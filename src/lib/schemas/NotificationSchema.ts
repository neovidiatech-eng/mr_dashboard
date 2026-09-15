import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getNotificationSchema = (t?: TFunc) =>
  z.object({
    title_ar: z
      .string()
      .min(1, t ? t("validation.required", "العنوان بالعربية مطلوب") : "العنوان بالعربية مطلوب"),
    title_en: z.string().optional(),
    message_ar: z
      .string()
      .min(1, t ? t("validation.required", "نص الإشعار بالعربية مطلوب") : "نص الإشعار بالعربية مطلوب"),
    message_en: z.string().optional(),
    type: z.string().optional(),
    userId: z.string().optional(),
    userIds: z.array(z.string()).optional(),
  });

export type NotificationFormData = z.infer<ReturnType<typeof getNotificationSchema>>;
