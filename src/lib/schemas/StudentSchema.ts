import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getStudentSchema = (t: TFunc) => z.object({
  name: z.string().min(3, t("validation.min", { count: 3 })).max(32, t("validation.max", { count: 32 })),
  email: z.string().email(t("validation.invalidEmail")),
  phone_code: z.string().min(1, t("validation.required")),
  phone: z.string().min(1, t("validation.required")),
  gender: z.enum(['male', 'female']),
  type: z.enum(['online', 'onsite']),
  birthDate: z.string().optional().or(z.literal('')),
  plan: z.string().optional().or(z.literal('')),
  country: z.string().min(1, t("validation.required")),
  status: z.enum(['approved', 'pending', 'rejected']),
  rankId: z.string().optional().or(z.literal('')),
  stageId: z.string().optional().or(z.literal('')),
  password: z.string().optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  timezone: z.string().optional(),
  startingCourseId: z.string().optional(),
  startingLectureId: z.string().optional(),
  parentNumber: z.string().optional(),
}).superRefine((data, ctx) => {
  const { phone_code, phone, password, confirmPassword } = data;

  if (phone) {
    if (!/^[0-9]+$/.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    } else if (phone_code === "+20") {
      if (!/^(01)[0125][0-9]{8}$|^(1)[0125][0-9]{8}$/.test(phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.invalidPhone"),
          path: ["phone"],
        });
      }
    } else if (phone_code === "+966") {
      if (!/^(05|5)[0-9]{8}$/.test(phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.invalidPhone"),
          path: ["phone"],
        });
      }
    } else if (phone_code === "+971") {
      if (!/^(05|5)[0-9]{8}$/.test(phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.invalidPhone"),
          path: ["phone"],
        });
      }
    } else if (phone_code === "+965") {
      if (!/^[569][0-9]{7}$/.test(phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.invalidPhone"),
          path: ["phone"],
        });
      }
    } else {
      if (phone.length < 7 || phone.length > 15) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.invalidPhone"),
          path: ["phone"],
        });
      }
    }
  }

  // Require startingLectureId if startingCourseId is provided
  if (data.startingCourseId && data.startingCourseId.trim() !== "" && (!data.startingLectureId || data.startingLectureId.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t("validation.required"),
      path: ["startingLectureId"],
    });
  }

  // Password & confirmPassword matching check
  if (password && password.trim() !== "") {
    if (password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.min", { count: 6 }),
        path: ["password"],
      });
    }
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.passwordMatch"),
        path: ["confirmPassword"],
      });
    }
  }
});

export type StudentFormData = z.infer<ReturnType<typeof getStudentSchema>>;