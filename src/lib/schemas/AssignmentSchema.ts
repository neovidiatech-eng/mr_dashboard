import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getAssignmentSchema = (t: TFunc) => z.object({
  studentId: z.string().min(1, t("validation.required")),
  title_ar: z.string().min(1, t("validation.required")),
  title_en: z.string().min(1, t("validation.required")),
  description_ar: z.string().min(1, t("validation.required")),
  description_en: z.string().min(1, t("validation.required")),
  dueDate: z.string().min(1, t("validation.required")),
  status: z.enum(['pending', 'submitted', 'graded', 'completed']).optional().default('pending'),
  grade: z.union([z.coerce.number().min(0), z.literal('')]).optional(),
  feedback: z.string().max(2000).optional(),
});

export type AssignmentFormData = z.infer<ReturnType<typeof getAssignmentSchema>>;