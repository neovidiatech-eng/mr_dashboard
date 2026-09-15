import api from "../../../lib/axios";
import {
  NotificationItem,
  CreateNotificationPayload,
  CreateNotificationResponse,
  NotificationListResponse,
  UnreadNotifications,
} from "../../../types/notification";

export const getNotifications = async ({
  page = 1,
  limit = 20,
  isRead,
}: {
  page?: number;
  limit?: number;
  isRead?: boolean;
}): Promise<NotificationListResponse> => {
  const response = await api.get<NotificationListResponse>(`/notifications`, {
    params: {
      page,
      limit,
      ...(isRead !== undefined ? { isRead } : {}),
    },
  });
  return response.data;
};

export const getUnreadCount = async (): Promise<UnreadNotifications> => {
  const response = await api.get<UnreadNotifications>(`/notifications/unread-count`);
  return response.data;
};

export const createNotification = async (
  payload: CreateNotificationPayload
): Promise<CreateNotificationResponse> => {
  const body: Record<string, any> = {
    title_ar: payload.title_ar,
    message_ar: payload.message_ar,
  };
  if (payload.title_en) body.title_en = payload.title_en;
  if (payload.message_en) body.message_en = payload.message_en;
  if (payload.type) body.type = payload.type;
  if (payload.userId) body.userId = payload.userId;
  if (payload.userIds && payload.userIds.length > 0) body.userIds = payload.userIds;

  const response = await api.post<CreateNotificationResponse>(`/notifications`, body);
  return response.data;
};

export const markNotificationAsRead = async (id: string) => {
  const response = await api.patch<{ message: string; status: number; data?: any }>(
    `/notifications/${id}/read`
  );
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch<{ message: string; status: number; data?: any }>(
    `/notifications/read-all`
  );
  return response.data;
};

export const deleteNotification = async (id: string) => {
  const response = await api.delete<{ data: NotificationItem; message: string; status: number }>(
    `/notifications/${id}`
  );
  return response.data;
};

export const clearAllNotifications = async () => {
  const response = await api.delete<{ message: string; status: number }>(
    `/notifications/clear-all`
  );
  return response.data;
};

export const registerFCMToken = async (fcmToken: string) => {
  const response = await api.post<{ message: string; status: number; data?: any }>(
    `/notifications/fcm-token`,
    { fcmToken }
  );
  return response.data;
};

export const updateFCMToken = async (fcmToken: string) => {
  const response = await api.patch<{ message: string; status: number; data?: any }>(
    `/notifications/fcm-token`,
    { fcmToken }
  );
  return response.data;
};

