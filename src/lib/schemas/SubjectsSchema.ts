import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getSubjectSchema = (t: TFunc) => z.object({
  name_ar: z.string().min(2, t("validation.min", { count: 2 })),
  name_en: z.string().min(2, t("validation.min", { count: 2 })).optional().or(z.literal('')),
  active: z.boolean().default(true),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t("validation.invalidColor")).default('#10b981'),
});


export type SubjectFormData = z.infer<ReturnType<typeof getSubjectSchema>>;