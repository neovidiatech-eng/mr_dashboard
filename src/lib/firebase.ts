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
      console.warn("Notifications are not supported in this environment");
      return null;
    }

    // 1. Request user permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission was not granted by the user:", permission);
      return null;
    }

    if (!messaging) {
      console.warn("Messaging instance is not available");
      return null;
    }

    // 2. Register / ensure service worker is active
    let serviceWorkerRegistration: ServiceWorkerRegistration | undefined;
    if ("serviceWorker" in navigator) {
      try {
        serviceWorkerRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      } catch (swErr) {
        console.warn("Service worker registration failed, fallback to default registration:", swErr);
      }
    }

    // 3. Retrieve token from Firebase
    const effectiveVapidKey = vapidKey || import.meta.env.VITE_FIREBASE_VAPID_KEY;

    const token = await getToken(messaging, {
      vapidKey: effectiveVapidKey,
      serviceWorkerRegistration,
    });

    if (token) {
      console.log("[FCM] Device Token retrieved successfully:", token);
      return token;
    } else {
      console.warn("[FCM] No registration token available. Request permission to generate one.");
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
