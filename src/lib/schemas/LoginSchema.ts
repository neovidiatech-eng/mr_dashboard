import { z } from "zod";

export const getLoginSchema = (t: (key: string, options?: any) => string) => z.object({
  username: z.string()
    .min(1, t("validation.required")),
  password: z.string()
    .min(8, "Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&^#)")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&^#]/, "Password must contain at least one special character"),
  rememberMe: z.boolean().optional(),
});

// For type safety, we can use a dummy translation for inference or export a type helper
export type LoginInput = z.infer<ReturnType<typeof getLoginSchema>>;