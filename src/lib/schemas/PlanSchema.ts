import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getPlanSchema = (t: TFunc) => z.object({
  name: z.string().min(1, t("validation.required")),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  currencyId: z.string().min(1, t("validation.required")),
  duration: z.coerce.number().positive(t("validation.min", { count: 1 })),
  sessionsCount: z.coerce.number().positive(),
  sessionTime: z.coerce.number().positive(),
  type: z.enum(['quarterly', 'halfAnnually', 'annually'], { message: t("validation.required") }),
  features: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']),
});

export type PlanFormData = z.infer<ReturnType<typeof getPlanSchema>>;