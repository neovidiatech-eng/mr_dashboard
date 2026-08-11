import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getPostSchema = (t: TFunc) => z.object({
  type: z.enum(['blog', 'news']),
  title_ar: z.string().min(1, t("validation.required")),
  title_en: z.string().min(1, t("validation.required")),
  excerpt_ar: z.string().optional(),
  excerpt_en: z.string().optional(),
  content_ar: z.string().min(1, t("validation.required")),
  content_en: z.string().min(1, t("validation.required")),
  coverImage: z.string().optional(),
  published: z.boolean(),
});

export type PostFormData = z.infer<ReturnType<typeof getPostSchema>>;
