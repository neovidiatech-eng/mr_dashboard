import { z } from "zod";

export const getRegisterSchema = (t: (key: string, options?: any) => string) =>
  z.object({
    name: z.string().min(3, t("validation.min", { count: 3 })),
    email: z.string().email(t("validation.email")),
    codeCountry: z.string().min(1, t("validation.required")),
    phone: z
      .string()
      .min(7, t("validation.min", { count: 7 }))
      .max(15, t("validation.max", { count: 15 })),
    parentNumber: z
      .string()
      .min(7, t("validation.min", { count: 7 }))
      .max(15, t("validation.max", { count: 15 })),
    rankId: z.string().min(1, t("validation.required")),
    stageId: z.string().optional(),
    birth_date: z
      .string()
      .refine((val) => val !== "", { message: t("validation.required") }),
    gender: z.string().min(1, t("validation.required")),
    country: z.string().min(1, t("validation.required")),
    password: z.string()
      .min(8, t("validation.passwordMin"))
      .regex(/[a-z]/, t("validation.passwordLowercase"))
      .regex(/[A-Z]/, t("validation.passwordUppercase"))
      .regex(/[0-9]/, t("validation.passwordNumber"))
      .regex(/[@$!%*?&^#]/, t("validation.passwordSpecial")),
    plan_id: z.string().min(1, t("validation.required")),
    image: z
      .union([z.instanceof(File), z.string()])
      .optional()
      .nullable()
      .refine((file) => {
        if (!file || typeof file === "string") return true;
        return file.size <= 5 * 1024 * 1024;
      }, t("validation.imageMax"))
      .refine((file) => {
        if (!file || typeof file === "string") return true;
        return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type);
      }, t("validation.imageFormat")),
  })
  .superRefine((data, ctx) => {
    const { codeCountry, phone } = data;
    
    // Check if phone only contains digits
    if (!/^[0-9]+$/.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
      return;
    }

    if (codeCountry === "+20") {
      // Egypt: starts with 01 (11 digits) or 1 (10 digits)
      const reg = /^(01)[0125][0-9]{8}$|^(1)[0125][0-9]{8}$/;
      if (!reg.test(phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.invalidPhone"),
          path: ["phone"],
        });
      }
    } else if (codeCountry === "+966") {
      // Saudi Arabia: starts with 5 (9 digits) or 05 (10 digits)
      const reg = /^(05|5)[0-9]{8}$/;
      if (!reg.test(phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.invalidPhone"),
          path: ["phone"],
        });
      }
    } else if (codeCountry === "+971") {
      // UAE: starts with 5 (9 digits) or 05 (10 digits)
      const reg = /^(05|5)[0-9]{8}$/;
      if (!reg.test(phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.invalidPhone"),
          path: ["phone"],
        });
      }
    } else if (codeCountry === "+965") {
      // Kuwait: starts with 5, 6, 9 (8 digits)
      const reg = /^[569][0-9]{7}$/;
      if (!reg.test(phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.invalidPhone"),
          path: ["phone"],
        });
      }
    } else {
      // General fallback validation
      if (phone.length < 7 || phone.length > 15) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.invalidPhone"),
          path: ["phone"],
        });
      }
    }
  });

export type RegisterInput = z.infer<ReturnType<typeof getRegisterSchema>>;
