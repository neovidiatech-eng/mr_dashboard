import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getAssignmentSchema = (t: TFunc) => z.object({
  studentId: z.string().min(1, t("validation.required")),
  title: z.string().min(3, t("validation.min", { count: 3 })),
  description: z.string().min(5, t("validation.min", { count: 5 })),
  dueDate: z.string().min(1, t("validation.required")),
  status: z.enum(['pending', 'submitted', 'graded']),
  grade: z.union([z.coerce.number().min(0), z.literal('')]).optional(),
  feedback: z.string().max(2000).optional(),
});

export type AssignmentFormData = z.infer<ReturnType<typeof getAssignmentSchema>>;