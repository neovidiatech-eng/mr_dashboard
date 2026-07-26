import z from "zod";

export const rankSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
    ageRange: z.object({
        minAge: z.number().positive('Min age must be positive'),
        maxAge: z.number().positive('Max age must be positive'),
    }),
});
export type RankSchema = z.infer<typeof rankSchema>;