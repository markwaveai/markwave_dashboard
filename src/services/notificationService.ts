/**
 * notificationService.ts
 *
 * Centralised FCM push-notification service for the Markwave dashboard.
 *
 * Responsibilities:
 *   - Register the Firebase service worker
 *   - Request notification permission
 *   - Get / refresh the FCM web-push token and save it to the backend
 *   - Subscribe the token to FCM topics via the backend (web cannot subscribe
 *     to topics client-side — Firebase Admin SDK on the backend does it)
 *   - Provide an `onForegroundMessage` listener so the UI can show an in-app
 *     banner when the tab is in the foreground
 *   - Clean up on logout (unsubscribe topics, delete token)
 *
 * Usage:
 *   // On app mount (after session restore):
 *   await notificationService.onUserLogin(mobile, roles);
 *   const unsub = notificationService.onForegroundMessage(({ title, body }) => {
 *     setNotification({ title, body });
 *   });
 *
 *   // On logout:
 *   await notificationService.onUserLogout(mobile, roles);
 *   unsub();
 */

import { messaging } from '../config/firebase';
import { getToken, onMessage, deleteToken } from 'firebase/messaging';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

// VAPID key from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
const VAPID_KEY =
  'BI7QADN3NcxaEeiy8GoSAht_Ua52K8jvLPW66nHgWzMg7BAwkFLxt13Z70hwEwXJGu_XUOji2g18KOEAp13bMGQ';

// Roles that receive dashboard admin push notifications
const ADMIN_ROLES = ['Admin', 'SuperAdmin'];

// FCM topic that all dashboard admins subscribe to
const ADMIN_TOPIC = 'markwave_dashboard_admins';

export interface ForegroundNotification {
  title: string;
  body: string;
  data?: Record<string, string>;
}

type MessageCallback = (payload: ForegroundNotification) => void;

const notificationService = {
  /**
   * Register the service worker, get a fresh FCM token and save it to the
   * backend. Returns the token string, or null on failure / permission denied.
   */
  async init(mobile: string): Promise<string | null> {
    try {
      if (!('serviceWorker' in navigator)) {
        console.warn('[FCM] Service workers not supported in this browser');
        return null;
      }

      // Register SW so getToken() always uses the right registration
      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js'
      );
      console.log('[FCM] Service worker registered:', registration.scope);

      // Request permission if not already granted
      const permission =
        Notification.permission === 'granted'
          ? 'granted'
          : await Notification.requestPermission();

      if (permission !== 'granted') {
        console.warn('[FCM] Notification permission denied');
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        console.warn('[FCM] getToken() returned null — check VAPID key and Firebase config');
        return null;
      }

      console.log('[FCM] Token obtained:', token.slice(0, 20) + '...');
      await this._saveTokenToBackend(mobile, token);
      return token;
    } catch (err) {
      console.error('[FCM] init() failed:', err);
      return null;
    }
  },

  /**
   * Register a callback for incoming push notifications.
   * Listens on two channels so the banner always fires regardless of
   * whether Firebase routes the message as foreground or background:
   *
   *   1. Firebase onMessage  — fires when Firebase detects a focused tab
   *   2. SW postMessage      — fires from our onBackgroundMessage handler
   *                            which always forwards to open tabs
   *
   * Returns an unsubscribe function — call it on component unmount or logout.
   */
  onForegroundMessage(callback: MessageCallback): () => void {
    // Channel 1: Firebase foreground routing
    const unsubFirebase = onMessage(messaging, (payload) => {
      console.log('[FCM] onMessage fired:', payload);
      const title =
        payload.notification?.title ||
        (payload.data as any)?.title ||
        'New Notification';
      const body =
        payload.notification?.body ||
        (payload.data as any)?.body ||
        '';
      callback({ title, body, data: payload.data as Record<string, string> });
    });

    // Channel 2: SW postMessage forwarding (catches what onMessage misses)
    const swHandler = (event: MessageEvent) => {
      if (event.data?.type === 'FCM_PUSH') {
        console.log('[FCM] SW postMessage received:', event.data);
        callback({
          title: event.data.title,
          body: event.data.body,
          data: event.data.data,
        });
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', swHandler);
    }

    return () => {
      unsubFirebase();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', swHandler);
      }
    };
  },

  /**
   * Subscribe the user's current FCM token to a named topic.
   * Must go via the backend — Firebase Admin SDK handles the subscription.
   * Firebase is idempotent: subscribing the same token twice is a no-op.
   */
  async subscribeToTopic(mobile: string, topic: string): Promise<void> {
    try {
      const baseUrl = API_CONFIG.getBaseUrl();
      await axios.post(`${baseUrl}/users/subscribe-topic`, { mobile, topic });
      console.log(`[FCM] Subscribed to topic "${topic}"`);
    } catch (err) {
      console.error(`[FCM] Failed to subscribe to topic "${topic}":`, err);
    }
  },

  /**
   * Unsubscribe the user's current FCM token from a named topic.
   */
  async unsubscribeFromTopic(mobile: string, topic: string): Promise<void> {
    try {
      const baseUrl = API_CONFIG.getBaseUrl();
      await axios.post(`${baseUrl}/users/unsubscribe-topic`, { mobile, topic });
      console.log(`[FCM] Unsubscribed from topic "${topic}"`);
    } catch (err) {
      console.error(`[FCM] Failed to unsubscribe from topic "${topic}":`, err);
    }
  },

  /**
   * Call after a successful login.
   * Initialises FCM, saves the token, and subscribes Admin/SuperAdmin users
   * to the shared admin notification topic.
   */
  async onUserLogin(mobile: string, roles: string[]): Promise<void> {
    const token = await this.init(mobile);
    if (!token) return;

    const isAdmin = roles.some((r) => ADMIN_ROLES.includes(r));
    if (isAdmin) {
      await this.subscribeToTopic(mobile, ADMIN_TOPIC);
    }
  },

  /**
   * Call on logout.
   * Unsubscribes from topics and deletes the local FCM token so the device
   * no longer receives push messages after sign-out.
   */
  async onUserLogout(mobile: string, roles: string[]): Promise<void> {
    try {
      const isAdmin = roles.some((r) => ADMIN_ROLES.includes(r));
      if (isAdmin) {
        await this.unsubscribeFromTopic(mobile, ADMIN_TOPIC);
      }
      await deleteToken(messaging);
      console.log('[FCM] Token deleted on logout');
    } catch (err) {
      console.error('[FCM] Logout cleanup failed:', err);
    }
  },

  // ─── private ──────────────────────────────────────────────────────────────

  async _saveTokenToBackend(mobile: string, token: string): Promise<void> {
    try {
      const baseUrl = API_CONFIG.getBaseUrl();
      await axios.put(`${baseUrl}/users/${mobile}`, {
        custom_fields: { web_fcm_token: token },
      });
      console.log('[FCM] Token saved to backend for', mobile);
    } catch (err) {
      console.error('[FCM] Failed to save token to backend:', err);
    }
  },
};

export default notificationService;
