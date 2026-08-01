import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getPolicySchema = (t: TFunc) => z.object({
  title_ar: z.string().min(3, t("validation.required")),
  title_en: z.string().optional(),
  description_ar: z.string().optional(),
  description_en: z.string().optional(),
  content_ar: z.string().optional(),
  content_en: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  icon: z.string().min(1, t("validation.required")),
  color: z.string().default('#4f46e5'),
  active: z.boolean().default(true),
});

export type PolicyFormData = z.infer<ReturnType<typeof getPolicySchema>>;
