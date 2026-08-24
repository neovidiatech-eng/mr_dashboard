import { z } from "zod";

type TFunc = (key: string, options?: any) => string;
const MAX_FILE_SIZE = 25 * 1024 * 1024;
export const getLectureSchema = (t: TFunc) => z.object({
  title_ar: z.string().min(2, t("validation.min", { count: 2 })),
  title_en: z.string().min(2, t("validation.min", { count: 2 })),
  content_ar: z.string().optional().or(z.literal('')),
  content_en: z.string().optional().or(z.literal('')),
  videoUrl: z.string().url(t("validation.invalidUrl")).optional().or(z.literal('')),
  pdfFile: z.union([z.instanceof(File), z.string()]).optional().nullable()
    .refine((file) => {
      if (!file || typeof file === "string") return true;
      return file.size <= MAX_FILE_SIZE;
    }, t("validation.fileTooLarge", { maxSize: "25MB" })),

  slizesFile: z.union([z.instanceof(File), z.string()]).optional().nullable()
    .refine((file) => {
      if (!file || typeof file === "string") return true;
      return file.size <= MAX_FILE_SIZE;
    }, t('validation.fileToolLarge', { maxSize: "25MB" })),
  order: z.number().int().min(1, t("validation.required")),
  courseId: z.string().min(1, t("validation.required")),
});

export type LectureFormData = z.infer<ReturnType<typeof getLectureSchema>>;
