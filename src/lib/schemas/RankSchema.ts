import z from "zod";

export const rankSchema = z.object({

  name_ar: z.string().min(1, 'اسم المرحلة بالعربية مطلوب'),
  name_en: z.string().optional().or(z.literal('')),
  color: z.string().min(1, 'Color is required').regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
});

export type RankSchema = z.infer<typeof rankSchema>;