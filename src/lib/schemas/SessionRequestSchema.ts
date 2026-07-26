import { z } from "zod";

type TFunc = (key: string) => string;

export const getSessionRequestSchema = (t: TFunc) => z.object({
  type: z.enum(['reschedule', 'cancel']).default('reschedule'),
  reason: z.string().min(5, t("validation.required")),
  date: z.any().optional(),
  time: z.any().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'reschedule') {
    if (!data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.required"),
        path: ['date'],
      });
    }
    if (!data.time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.required"),
        path: ['time'],
      });
    }
  }
});

export type SessionRequestFormData = z.infer<ReturnType<typeof getSessionRequestSchema>>;
