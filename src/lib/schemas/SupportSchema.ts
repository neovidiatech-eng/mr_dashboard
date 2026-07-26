import { z } from "zod";

export const getSupportCategorySchema = (t: (key: string) => string) => z.object({
    title: z.string().min(1, t("validation.required")),
    active: z.boolean().default(true),
});

export const getSupportItemSchema = (t: (key: string) => string) => z.object({
    title: z.string().min(1, t("validation.required")),
    url: z.string().url(t("validation.invalidUrl")).min(1, t("validation.required")),
    description: z.string().min(1, t("validation.required")),
    categoryId: z.string().min(1, t("validation.required")),
    active: z.boolean().default(true),
});

export type SupportCategoryFormData = z.infer<ReturnType<typeof getSupportCategorySchema>>;
export type SupportItemFormData = z.infer<ReturnType<typeof getSupportItemSchema>>;
