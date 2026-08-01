import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getExamSchema = (t: TFunc) => z.object({
  title_ar: z.string().min(3, t("validation.min", { count: 3 })),
  title_en: z.string().optional(),
  title: z.string().optional(),
  subject: z.string().optional(),
  studentId: z.string().min(1, t("validation.required")),
  teacherId: z.string().optional(),
  dueDate: z.string().min(1, t("validation.required")),
  duration: z.coerce.number().min(1, t("validation.required")),
  totalMarks: z.coerce.number().min(1).default(100),
});

export type ExamFormData = z.infer<ReturnType<typeof getExamSchema>>;
