import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getCourseSchema = (t: TFunc) => z.object({
  title: z.string().min(3, t("validation.min", { count: 3 })),
  description: z.string().min(5, t("validation.required")),
  rankId: z.string().min(1, t("validation.required")),
  image: z.any().optional(),
});

export type CourseFormData = z.infer<ReturnType<typeof getCourseSchema>>;