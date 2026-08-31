import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getCourseSchema = (t: TFunc) => z.object({
  title_ar: z.string().min(2, t("validation.min", { count: 2 })),
  title_en: z.string().min(2, t("validation.min", { count: 2 })),
  description_ar: z.string().min(5, t("validation.required")),
  description_en: z.string().min(5, t("validation.required")),
  rankId: z.string().min(1, t("validation.required")),
  stageId: z.string().optional(),
  price: z.string().optional(),
  keywords: z.array(z.string()).optional().default([]),
  image: z.any().optional(),
});

export type CourseFormData = z.infer<ReturnType<typeof getCourseSchema>>;