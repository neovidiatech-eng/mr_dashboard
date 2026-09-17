import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBk3UxjL7HDDKYuOJtmLusl1EdXARTii1A",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mr-mahmoud-a71c7.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mr-mahmoud-a71c7",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mr-mahmoud-a71c7.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "531367244011",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:531367244011:web:84ccbc0ba62d7e40cf4eae",
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Messaging instance (only available in browser environments supporting Notification & ServiceWorker)
export let messaging: Messaging | null = null;

if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.warn("Firebase Messaging is not supported in this browser:", err);
  }
}

/**
 * Requests Notification permission from the student's browser and retrieves the FCM device token.
 */
export const requestFCMToken = async (vapidKey?: string): Promise<string | null> => {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("[FCM] Notifications are not supported in this browser environment");
      return null;
    }

    // 1. Request user permission
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.warn("[FCM] Notification permission was not granted:", permission);
      return null;
    }

    if (!messaging) {
      console.warn("[FCM] Firebase Messaging instance is not available");
      return null;
    }

    // 2. Register / ensure service worker is active
    let serviceWorkerRegistration: ServiceWorkerRegistration | undefined;
    if ("serviceWorker" in navigator) {
      try {
        serviceWorkerRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        await navigator.serviceWorker.ready;
      } catch (swErr) {
        console.warn("[FCM] Service worker registration error:", swErr);
      }
    }

    // 3. Retrieve token from Firebase
    const effectiveVapidKey = vapidKey || import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const tokenOptions: { serviceWorkerRegistration?: ServiceWorkerRegistration; vapidKey?: string } = {};

    if (serviceWorkerRegistration) {
      tokenOptions.serviceWorkerRegistration = serviceWorkerRegistration;
    }
    if (effectiveVapidKey) {
      tokenOptions.vapidKey = effectiveVapidKey;
    }

    const token = await getToken(messaging, tokenOptions);
    console.log("[FCM] Device Token generated successfully:", token);

    if (token) {
      console.log("[FCM] Device Token generated successfully:", token);
      return token;
    } else {
      console.warn("[FCM] No registration token returned by Firebase.");
      return null;
    }
  } catch (error) {
    console.error("[FCM] An error occurred while retrieving token:", error);
    return null;
  }
};

/**
 * Helper to listen to incoming push messages when the app is in the foreground (tab is open)
 */
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    console.log("[FCM] Foreground message received:", payload);
    callback(payload);
  });
};

export default app;
