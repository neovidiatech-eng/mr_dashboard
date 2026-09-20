// Scripts for firebase messaging service worker
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyBk3UxjL7HDDKYuOJtmLusl1EdXARTii1A",
  authDomain: "mr-mahmoud-a71c7.firebaseapp.com",
  projectId: "mr-mahmoud-a71c7",
  storageBucket: "mr-mahmoud-a71c7.firebasestorage.app",
  messagingSenderId: "531367244011",
  appId: "1:531367244011:web:84ccbc0ba62d7e40cf4eae",
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
 // console.log("[firebase-messaging-sw.js] Received background message: ", payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || "إشعار جديد من المنصة";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || payload.data?.message || "",
    icon: "/logo.png",
    badge: "/logo.png",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click to open or focus the web app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
