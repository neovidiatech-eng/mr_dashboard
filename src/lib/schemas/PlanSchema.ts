import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getPlanSchema = (t: TFunc) => z.object({
  name: z.string().min(1, t("validation.required")),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  currencyId: z.string().min(1, t("validation.required")),
  duration: z.coerce.number().positive(t("validation.min", { count: 1 })),
  sessionsCount: z.coerce.number().nullable().optional(),
  liveSessionsCount: z.coerce.number().nullable().optional(),
  sessionTime: z.coerce.number().positive(),
  type: z.enum(['quarterly', 'halfAnnually', 'annually'], { message: t("validation.required") }),
  features: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']),
  isGroup: z.boolean().default(false),
  maxStudents: z.string().optional(),
}).refine((data) => !data.isGroup || (data.maxStudents && data.maxStudents.trim() !== ''), {
  message: t("validation.required"),
  path: ["maxStudents"],
}).refine((data) => {
  const sessions = Number(data.sessionsCount || 0);
  const liveSessions = Number(data.liveSessionsCount || 0);
  return sessions > 0 || liveSessions > 0;
}, {
  message: t("validation.atLeastOneSessionRequired") || "At least one session or live session is required",
  path: ["sessionsCount"],
});

export type PlanFormData = z.infer<ReturnType<typeof getPlanSchema>>;