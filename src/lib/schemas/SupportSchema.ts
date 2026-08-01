import { z } from "zod";

export const getSupportCategorySchema = (t: (key: string) => string) => z.object({
    title_ar: z.string().min(1, t("validation.required")),
    title_en: z.string().optional(),
    title: z.string().optional(),
    active: z.boolean().default(true),
});

export const getSupportItemSchema = (t: (key: string) => string) => z.object({
    title_ar: z.string().min(1, t("validation.required")),
    title_en: z.string().optional(),
    title: z.string().optional(),
    url: z.string().url(t("validation.invalidUrl")).min(1, t("validation.required")),
    description_ar: z.string().optional(),
    description_en: z.string().optional(),
    description: z.string().optional(),
    categoryId: z.string().min(1, t("validation.required")),
    active: z.boolean().default(true),
});

export type SupportCategoryFormData = z.infer<ReturnType<typeof getSupportCategorySchema>>;
export type SupportItemFormData = z.infer<ReturnType<typeof getSupportItemSchema>>;
