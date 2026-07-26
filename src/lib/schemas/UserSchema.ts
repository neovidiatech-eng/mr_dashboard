import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

const getPhoneRefinement = (t: TFunc) => (data: any, ctx: z.RefinementCtx) => {
  const { code_country: countryCode, phone } = data;
  
  if (!phone) return;

  if (!/^[0-9]+$/.test(phone)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t("validation.invalidPhone"),
      path: ["phone"],
    });
    return;
  }

  if (countryCode === "+20") {
    const reg = /^(01)[0125][0-9]{8}$|^(1)[0125][0-9]{8}$/;
    if (!reg.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    }
  } else if (countryCode === "+966") {
    const reg = /^(05|5)[0-9]{8}$/;
    if (!reg.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    }
  } else if (countryCode === "+971") {
    const reg = /^(05|5)[0-9]{8}$/;
    if (!reg.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    }
  } else if (countryCode === "+965") {
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

const getBaseUserSchema = (t: TFunc) => z.object({
  name: z.string().min(3, t("validation.min", { count: 3 })).max(32, t("validation.max", { count: 32 })),
  email: z.string().email(t("validation.email")),
  code_country: z.string(),
  phone: z.string().min(1, t("validation.required")),
  role: z.string().min(1, t("validation.required")),
  password: z.string().min(6, t("validation.min", { count: 6 })),
  permissions: z.array(z.string()).optional(),
});

export const getUserSchema = (t: TFunc) => getBaseUserSchema(t).superRefine(getPhoneRefinement(t));

export const getUpdateUserSchema = (t: TFunc) => getBaseUserSchema(t).extend({
  password: z.string().min(6, t("validation.min", { count: 6 })).or(z.literal('')),
}).superRefine(getPhoneRefinement(t));

export type UserFormData = z.infer<ReturnType<typeof getUserSchema>>;
export type UpdateUserFormData = z.infer<ReturnType<typeof getUpdateUserSchema>>;