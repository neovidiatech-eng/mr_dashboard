import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getLectureSchema = (t: TFunc) => z.object({
  title_ar: z.string().min(2, t("validation.min", { count: 2 })),
  title_en: z.string().min(2, t("validation.min", { count: 2 })),
  content_ar: z.string().optional().or(z.literal('')),
  content_en: z.string().optional().or(z.literal('')),
  video: z.any().optional(),
  pdf: z.any().optional(),
  slides: z.any().optional(),
  order: z.number().int().min(1, t("validation.required")),
  courseId: z.string().min(1, t("validation.required")),
});

export type LectureFormData = z.infer<ReturnType<typeof getLectureSchema>>;
