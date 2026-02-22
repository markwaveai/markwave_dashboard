importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC0XUQqk51NGLazlnaGKsPAgjkNNbgZR-E",
  authDomain: "markwave-481315.firebaseapp.com",
  projectId: "markwave-481315",
  storageBucket: "markwave-481315.appspot.com",
  messagingSenderId: "612299373064",
  appId: "1:612299373064:web:32b53e0ae6b3f6cc0eefbd",
});

const messaging = firebase.messaging();

// Called when a push arrives while the tab is in the background or closed.
// We manually show the notification so we can attach our custom data/action URL.
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);
  const data = payload.data || {};
  const notification = payload.notification || {};

  const title = notification.title || 'AnimalKart Dashboard';
  const body = notification.body || '';

  // Determine the in-app URL to open on click.
  // encodeURIComponent is required because order IDs contain '#' (e.g. OD#123...)
  // which the URL parser would treat as a fragment delimiter if left unencoded.
  let actionUrl = '/orders';
  if (data.type === 'MILESTONE_ACHIEVED') {
    actionUrl = `/offer-settings?highlight_milestone=${encodeURIComponent(data.milestone_id || '')}`;
  } else if (data.type === 'REFERRAL_REWARD') {
    actionUrl = `/orders?highlight_order=${encodeURIComponent(data.order_id || '')}`;
  } else if (data.order_id) {
    actionUrl = `/orders?highlight_order=${encodeURIComponent(data.order_id)}`;
  }

  self.registration.showNotification(title, {
    body,
    icon: '/header-logo-new.png',
    badge: '/header-logo-new.png',
    data: { ...data, actionUrl },
    requireInteraction: false,
  });
});

// When admin clicks the OS notification, focus the open tab (or open a new one)
// and post a message so the React app can navigate + highlight the correct item.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const actionUrl = event.notification.data?.actionUrl || '/orders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'FCM_NOTIFICATION_CLICK', url: actionUrl });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(actionUrl);
      }
    })
  );
});
