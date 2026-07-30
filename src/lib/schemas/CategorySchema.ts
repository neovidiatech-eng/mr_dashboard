import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getCategorySchema = (t: TFunc) => z.object({
  name_ar: z.string().min(2, t("validation.min", { count: 2 })),
  name_en: z.string().min(2, t("validation.min", { count: 2 })).optional().or(z.literal('')),
  active: z.boolean().default(true),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t("validation.invalidColor")).default('#800020'),
});

export type CategoryFormData = z.infer<ReturnType<typeof getCategorySchema>>;
