


export interface NotificationRecipientFilter {
  stageId?: string;
  gradeId?: string;
  groupId?: string;
  courseId?: string;
}

export interface NotificationTranslation {
  id?: string;
  title: string;
  message: string;
  notificationId?: string;
  lang: "ar" | "en" | string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  type?: string;
  isRead: boolean;
  createdAt?: string;
  title?: string;
  message?: string;
  translations?: NotificationTranslation[];
  title_ar?: string;
  title_en?: string;
  message_ar?: string;
  message_en?: string;
}

export interface CreateNotificationPayload {
  userId?: string;
  userIds?: string[];
  title_ar: string;
  title_en?: string;
  message_ar: string;
  message_en?: string;
  type?: string;
}

export type CreateNotification = CreateNotificationPayload;

export interface CreateNotificationResponse {
  message: string;
  status: number;
  data: any;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface NotificationListResponse {
  message: string;
  status: number;
  data: {
    items: NotificationItem[];
    pagination?: NotificationPagination;
  };
  unreadCount?: number;
}

export interface UnreadNotifications {
  message: string;
  status: number;
  data: {
    unreadCount: number;
  };
}