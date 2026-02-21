importScripts("https://www.gstatic.com/firebasejs/12.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyBfBgdf_6Vo20QmiwX6fx1X5L0rdnXnt5g",
    authDomain: "markwave-481315.firebaseapp.com",
    projectId: "markwave-481315",
    storageBucket: "markwave-481315.firebasestorage.app",
    messagingSenderId: "612299373064",
    appId: "1:612299373064:web:16b92029f2a3a8ee0eefbd",
    measurementId: "G-0BH7HSXKDE"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(clients.claim()));

// Firebase routes every push through onBackgroundMessage when it can't
// confirm the page is focused. We handle both cases here:
//   - Forward to all open dashboard tabs via postMessage (in-app banner)
//   - Show OS notification only when no visible tab is found (true background)
messaging.onBackgroundMessage((payload) => {
    const title =
        (payload.notification && payload.notification.title) ||
        (payload.data && payload.data.title) ||
        "New Notification";
    const body =
        (payload.notification && payload.notification.body) ||
        (payload.data && payload.data.body) ||
        "";
    const data = payload.data || {};

    clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((windowClients) => {
            const hasVisible = windowClients.some(
                (c) => c.visibilityState === "visible"
            );

            // Always forward to open tabs — the page listener shows the banner
            windowClients.forEach((client) => {
                client.postMessage({ type: "FCM_PUSH", title, body, data });
            });

            // Only show OS notification when the app is truly in the background
            if (!hasVisible) {
                self.registration.showNotification(title, {
                    body,
                    icon: "/logo192.png",
                });
            }
        });
});
