import { useEffect, useCallback } from "react";
import { notification } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { requestFCMToken, onForegroundMessage } from "../lib/firebase";
import { registerFCMToken, updateFCMToken } from "../features/admin/services/NotificationServices";

/**
 * Hook to initialize Firebase Cloud Messaging for students/users on the website.
 * Automatically requests permission, obtains the device FCM token, sends it to the backend,
 * and listens for foreground push notifications.
 */
export function useFCM() {
  const queryClient = useQueryClient();

  const initFCM = useCallback(async () => {
    // Only register if user is logged in
    const authToken = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!authToken) return;

    try {
      // 1. Request browser permission and retrieve token
      const fcmToken = await requestFCMToken();

      if (fcmToken) {
        // 2. Check if we already registered this token for current user
        const userRaw = localStorage.getItem("user") || sessionStorage.getItem("user");
        let userId = "guest";
        try {
          if (userRaw) userId = JSON.parse(userRaw)?.id || "guest";
        } catch {
          // ignore json parse error
        }

        const cacheKey = `fcm_registered_token_${userId}`;
        const cachedToken = localStorage.getItem(cacheKey);

        if (cachedToken !== fcmToken) {
          try {
            await registerFCMToken(fcmToken);
          } catch (regErr) {
            try {
              await updateFCMToken(fcmToken);
            } catch (upErr) {
              console.warn("[FCM] Server registration/update notice:", upErr);
            }
          }
          localStorage.setItem(cacheKey, fcmToken);
          localStorage.setItem("fcm_registered_token", fcmToken);
         // console.log("[FCM] Token active and registered for user:", userId);
        }
      }
    } catch (err) {
      console.warn("[FCM] Failed to initialize FCM or register token:", err);
    }
  }, []);

  useEffect(() => {
    initFCM();

    // 3. Listen to incoming push notifications while student/user is browsing the website
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload?.notification?.title || payload?.data?.title || "إشعار جديد";
      const description =
        payload?.notification?.body || payload?.data?.body || payload?.data?.message || "";

      notification.open({
        message: title,
        description: description,
        placement: "topRight",
        duration: 6,
      });

      // Refresh notification counts and lists in real-time
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [initFCM, queryClient]);

  return { initFCM };
}

