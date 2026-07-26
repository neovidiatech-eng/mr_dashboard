import { z } from "zod";

type TFunc = (key: string) => string;

export const getUnifiedRequestSchema = (t: TFunc) => z.object({
  type: z.string().min(1, t("validation.required")),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  title: z.string().min(3, t("validation.required")),
  reason: z.string().min(5, t("validation.required")),
  sessionId: z.string().optional(),
});

export type UnifiedRequestFormData = z.infer<ReturnType<typeof getUnifiedRequestSchema>>;
