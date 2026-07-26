import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getStudentSchema = (t: TFunc) => z.object({
  name: z.string().min(3, t("validation.min", { count: 3 })).max(32, t("validation.max", { count: 32 })),
  email: z.string().email(t("validation.invalidEmail")),
  phone_code: z.string().min(1, t("validation.required")),
  phone: z.string().min(1, t("validation.required")),
  gender: z.enum(['male', 'female']),
  birthDate: z.string(t("validation.required")),
  plan: z.string(t("validation.required")),
  country: z.string().min(1, t("validation.required")),
  status: z.enum(['approved', 'pending', 'rejected']),
  rankId: z.string(t("validation.required")),
  password: z.string().min(6, t("validation.min", { count: 6 })),
  timezone: z.string().optional(),
  startingCourseId: z.string().optional(),
  startingLectureId: z.string().optional(),
}).superRefine((data, ctx) => {
  const { phone_code, phone } = data;

  if (!phone) return;

  if (!/^[0-9]+$/.test(phone)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t("validation.invalidPhone"),
      path: ["phone"],
    });
    return;
  }

  // Egypt
  if (phone_code === "+20") {
    if (!/^(01)[0125][0-9]{8}$|^(1)[0125][0-9]{8}$/.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    }
  }
  // Saudi Arabia
  else if (phone_code === "+966") {
    if (!/^(05|5)[0-9]{8}$/.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    }
  }
  // UAE
  else if (phone_code === "+971") {
    if (!/^(05|5)[0-9]{8}$/.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    }
  }
  // Kuwait
  else if (phone_code === "+965") {
    if (!/^[569][0-9]{7}$/.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    }
  }
  // Fallback for other countries
  else {
    if (phone.length < 7 || phone.length > 15) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    }
  }
});

export type StudentFormData = z.infer<ReturnType<typeof getStudentSchema>>;