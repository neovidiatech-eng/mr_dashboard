import { z } from 'zod';
import { DayOfWeek } from '../../types/scheduales';

type TFunc = (key: string, options?: any) => string;

/** Shared fields between single & recurring sessions */
const getBaseSession = (t: TFunc) => z.object({
  studentId: z.string().min(1, t("validation.required")),
  teacherId: z.string().min(1, t("validation.required")),
  courseId: z.string().min(1, t("validation.required")),
  description: z.string().optional(),
  notification_Time: z.string().optional(),
  link: z.string().url("Invalid Url"),
  notes: z.string().optional(),
  language: z.string().min(1, t("validation.required")),
});

/** Single session schema — includes platform, type, videoUrl, slidesUrl */
export const getSessionSchema = (t: TFunc) => getBaseSession(t).extend({
  type: z.enum(['full', 'half']),
  platform: z.enum(['zoom', 'google']),
  videoUrl: z.string().url("Invalid Url"),
  slidesUrl: z.string().optional(),
  title: z.string().min(3, t("validation.min", { count: 3 })),
  sessionDate: z.string().min(1, t("validation.required")),
  duration: z.string().min(1, t("validation.required")),
  startTime: z.string().min(1, t("validation.required")),
  endTime: z.string().min(1, t("validation.required")),
}).refine((data) => data.endTime > data.startTime, {
  message: t("validation.timeOrder"),
  path: ["endTime"],
});

/** Recurring / batch session schema */
export const getMultipleSessionsSchema = (t: TFunc) => getBaseSession(t).extend({
  batchStartDate: z.string().min(1, t("validation.required")),
  batchEndDate: z.string().min(1, t("validation.required")),
  startTime: z.string().min(1, t("validation.required")),
  selectedDays: z.array(z.string()).min(1, t("validation.required")),
  duration: z.string().min(1, t("validation.required")),
}).refine((data) => data.batchEndDate > data.batchStartDate, {
  message: t("validation.dateOrder"),
  path: ["batchEndDate"],
});

export type SessionFormData = z.infer<ReturnType<typeof getSessionSchema>>;
export type MultipleSessionsFormData = z.infer<ReturnType<typeof getMultipleSessionsSchema>>;

export interface MultipleSessionsPayload {
  formData: MultipleSessionsFormData;
  sessions: Array<{
    date: string;
    day: string;
    time: string;
  }>;
  selectedDays: DayOfWeek[];
}