import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

const firebaseConfig = {
  apiKey: 'AIzaSyC0XUQqk51NGLazlnaGKsPAgjkNNbgZR-E',
  authDomain: 'markwave-481315.firebaseapp.com',
  projectId: 'markwave-481315',
  storageBucket: 'markwave-481315.appspot.com',
  messagingSenderId: '612299373064',
  appId: '1:612299373064:web:32b53e0ae6b3f6cc0eefbd',
};

// Get this from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY || '';

let messaging: Messaging | null = null;

function getMessagingInstance(): Messaging | null {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    messaging = getMessaging(app);
    return messaging;
  } catch (e) {
    console.error('[FCM] Failed to initialise messaging:', e);
    return null;
  }
}

/**
 * Initialise FCM for a logged-in dashboard admin:
 *  1. Request notification permission
 *  2. Obtain FCM token (requires VAPID key)
 *  3. Save token to backend (web_fcm_token field)
 *  4. Subscribe token to markwave_dashboard_admins topic
 *  5. Register a foreground message listener
 */
export async function initFCM(
  adminMobile: string,
  onForegroundMessage: (payload: any) => void
): Promise<void> {
  try {
    if (!('Notification' in window)) {
      console.warn('[FCM] Browser does not support notifications');
      return;
    }

    if (!VAPID_KEY) {
      console.warn('[FCM] REACT_APP_FIREBASE_VAPID_KEY is not set — FCM token cannot be obtained');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[FCM] Notification permission denied');
      return;
    }

    const msg = getMessagingInstance();
    if (!msg) return;

    // Register the service worker manually so FCM can use it
    let swRegistration: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('[FCM] Service worker registered');
    }

    const token = await getToken(msg, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      console.warn('[FCM] No registration token available');
      return;
    }

    console.log('[FCM] Token obtained:', token.substring(0, 20) + '...');

    const baseUrl = API_CONFIG.getBaseUrl();

    // Persist the web FCM token to Neo4j
    await axios.post(`${baseUrl}/users/fcm-token`, {
      mobile: adminMobile,
      fcm_token: token,
      appName: 'animalkart_dashboard',
    });

    // Subscribe to admin broadcast topic (server-side via Admin SDK)
    await axios.post(`${baseUrl}/users/subscribe-topic`, {
      mobile: adminMobile,
      topic: 'markwave_dashboard_admins',
    });

    console.log('[FCM] Subscribed to markwave_dashboard_admins');

    // Handle messages while the tab is in the foreground
    onMessage(msg, (payload) => {
      console.log('[FCM] Foreground message:', payload);
      onForegroundMessage(payload);
    });
  } catch (e) {
    console.error('[FCM] initFCM failed:', e);
  }
}

/**
 * Unsubscribe from the admin topic on logout.
 * Called before clearing the session so we still have the mobile number.
 */
export async function cleanupFCM(adminMobile: string): Promise<void> {
  try {
    const baseUrl = API_CONFIG.getBaseUrl();
    await axios.post(`${baseUrl}/users/unsubscribe-topic`, {
      mobile: adminMobile,
      topic: 'markwave_dashboard_admins',
    });
    console.log('[FCM] Unsubscribed from markwave_dashboard_admins');
  } catch (e) {
    console.error('[FCM] cleanupFCM failed:', e);
  }
}

/**
 * Decode a notification data payload into a target route path and the IDs
 * that should be highlighted once the component mounts.
 */
export function getNotificationRoute(data: Record<string, string>): {
  path: string;
  highlightOrderId?: string;
  highlightMilestoneId?: string;
} {
  if (data.type === 'MILESTONE_ACHIEVED') {
    return { path: '/offer-settings', highlightMilestoneId: data.milestone_id };
  }
  if (data.type === 'REFERRAL_REWARD' || data.order_id) {
    return { path: '/orders', highlightOrderId: data.order_id };
  }
  return { path: '/orders' };
}
