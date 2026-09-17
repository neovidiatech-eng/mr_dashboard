import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  deleteNotification,
  getNotifications,
  createNotification,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from "../services/NotificationServices";
import ErrorService from "../../../utils/ErrorService";
import { CreateNotification } from "../../../types/notification";

export const useGetNotifications = (
  params: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  } = { page: 1, limit: 20 },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => getNotifications(params),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useGetUnreadCount = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => getUnreadCount(),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5, // 5 minutes cache, real-time updates handled by FCM / invalidation
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: CreateNotification) => createNotification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      ErrorService.success(t("notification_sent_success", "تم إرسال الإشعار بنجاح"));
    },
    onError: (error: any) => {
      ErrorService.error(error?.response?.data?.message || t("notification_send_failed", "فشل إرسال الإشعار"));
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      ErrorService.success(t("notifications_marked_all_read", "تم تحديد جميع الإشعارات كمقروءة"));
    },
    onError: (error: any) => {
      ErrorService.error(error?.response?.data?.message || t("notifications_mark_all_read_failed", "فشل تحديث حالة الإشعارات"));
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      ErrorService.success(t("notification_deleted_success", "تم حذف الإشعار بنجاح"));
    },
    onError: (error: any) => {
      ErrorService.error(error?.response?.data?.message || t("notification_delete_failed", "فشل حذف الإشعار"));
    },
  });
};

export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () => clearAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      ErrorService.success(t("notifications_cleared_success", "تم مسح جميع الإشعارات بنجاح"));
    },
    onError: (error: any) => {
      ErrorService.error(error?.response?.data?.message || t("notifications_clear_failed", "فشل مسح الإشعارات"));
    },
  });
};


