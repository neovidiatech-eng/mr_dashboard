import z from "zod";

export const rankSchema = z.object({
    name_ar: z.string().min(1, 'Arabic Name is required'),
    name_en: z.string().optional(),
    name: z.string().optional(),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
    ageRange: z.object({
        minAge: z.number().positive('Min age must be positive'),
        maxAge: z.number().positive('Max age must be positive'),
    }),
    stageName_ar: z.string().optional(),
    stageName_en: z.string().optional(),
    stageName: z.string().optional(),
});
export type RankSchema = z.infer<typeof rankSchema>;