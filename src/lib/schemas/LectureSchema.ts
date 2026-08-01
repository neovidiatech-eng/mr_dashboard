import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getLectureSchema = (t: TFunc) => z.object({
  title_ar: z.string().min(3, t("validation.min", { count: 3 })),
  title_en: z.string().optional(),
  content_ar: z.string().optional(),
  content_en: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().url(t("validation.invalidUrl")).optional().or(z.literal('')),
  pdfUrl: z.string().url(t("validation.invalidUrl")).optional().or(z.literal('')),
  slidesUrl: z.string().url(t("validation.invalidUrl")).optional().or(z.literal('')),
  order: z.number().int().min(1, t("validation.required")),
  courseId: z.string().min(1, t("validation.required")),
});

export type LectureFormData = z.infer<ReturnType<typeof getLectureSchema>>;
