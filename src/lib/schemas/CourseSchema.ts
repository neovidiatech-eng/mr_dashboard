import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getCourseSchema = (t: TFunc) => z.object({
  title_ar: z.string().min(3, t("validation.min", { count: 3 })),
  title_en: z.string().optional(),
  description_ar: z.string().optional(),
  description_en: z.string().optional(),
  keywords: z.union([z.string(), z.array(z.string())]).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  rankId: z.string().min(1, t("validation.required")),
  categoryId: z.string().optional(),
  price: z.string().optional(),
  image: z.any().optional(),
});

export type CourseFormData = z.infer<ReturnType<typeof getCourseSchema>>;