import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getPolicySchema = (t: TFunc) => z.object({
  title: z.string().min(3, t("validation.required")),
  description: z.string().min(10, t("validation.min", { count: 10 })),
  content: z.string().optional(),
  icon: z.string().min(1, t("validation.required")),
  color: z.string().default('#4f46e5'),
  active: z.boolean().default(true),
});

export type PolicyFormData = z.infer<ReturnType<typeof getPolicySchema>>;
