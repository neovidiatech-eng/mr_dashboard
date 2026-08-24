import z from "zod";

export const rankSchema = z.object({
  name_ar: z.string().min(1, 'المرحلة الدراسية بالعربية مطلوبة'),
  name_en: z.string().min(1, 'English level name is required'),
  color: z.string().min(1, 'Color is required').regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  ageRange: z.object({
    minAge: z.number().positive('Min age must be positive'),
    maxAge: z.number().positive('Max age must be positive'),
  }),
  stageName_ar: z.string().optional().or(z.literal('')),
  stageName_en: z.string().optional().or(z.literal('')),
});

export type RankSchema = z.infer<typeof rankSchema>;