import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

const passwordSchema = (t: TFunc) => z.string()
  .min(8, t("validation.passwordComplexity"))
  .regex(/[A-Z]/, t("validation.passwordComplexity"))
  .regex(/[a-z]/, t("validation.passwordComplexity"))
  .regex(/[0-9]/, t("validation.passwordComplexity"))
  .regex(/[^A-Za-z0-9]/, t("validation.passwordComplexity"));

const baseTeacherSchema = (t: TFunc) => ({
  name: z.string().min(3, t("validation.min", { count: 3 })).max(32, t("validation.max", { count: 32 })),
  email: z.string().email(t("validation.email")),
  phone: z.string().min(1, t("validation.required")),
  hourlyRate: z.coerce.number().min(10, t("validation.required")),
  currency: z.string().min(1, t("validation.required")),
  gender: z.enum(['male', 'female']),
  status: z.enum(['active', 'inactive']),
  age: z.coerce.number().min(5, t("validation.required")).transform((val,ctx) => {
    if(val < 5){
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "TOO_SHORT",
        path: ['age'],
      });
    }
    return val;
  }),
  code_country: z.string().default('+20'),
});

const refinePhone = (t: TFunc) => (data: { code_country: string; phone: string }, ctx: z.RefinementCtx) => {
  const { code_country, phone } = data;
  if (!phone) return;

  if (!/^[0-9]+$/.test(phone)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t("validation.invalidPhone"),
      path: ["phone"],
    });
    return;
  }

  if (code_country === "+20") {
    const reg = /^(01)[0125][0-9]{8}$|^(1)[0125][0-9]{8}$/;
    if (!reg.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    }
  } else if (code_country === "+966") {
    const reg = /^(05|5)[0-9]{8}$/;
    if (!reg.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    }
  } else if (code_country === "+971") {
    const reg = /^(05|5)[0-9]{8}$/;
    if (!reg.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    }
  } else if (code_country === "+965") {
    const reg = /^[569][0-9]{7}$/;
    if (!reg.test(phone)) {
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
};

export const getCreateTeacherSchema = (t: TFunc) => z.object({
  ...baseTeacherSchema(t),
  password: passwordSchema(t),
}).superRefine(refinePhone(t));

export const getUpdateTeacherSchema = (t: TFunc) => z.object({
  ...baseTeacherSchema(t),
  password: passwordSchema(t).optional().or(z.literal('')),
}).superRefine(refinePhone(t));

// For backward compatibility
export const getTeacherSchema = getCreateTeacherSchema;

export type TeacherFormData = z.infer<ReturnType<typeof getCreateTeacherSchema>>;
export type UpdateTeacherFormData = z.infer<ReturnType<typeof getUpdateTeacherSchema>>;