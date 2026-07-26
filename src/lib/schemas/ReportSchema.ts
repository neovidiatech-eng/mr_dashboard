import z from "zod";

export const reportSchema = z.object({
  weekStarting: z.string().min(1, "Week starting date is required"),
  weekEnding: z.string().min(1, "Week ending date is required"),
  totalClasses: z.number().min(0, "Total classes must be at least 0"),
  studentsTaught: z.number().min(0, "Students taught must be at least 0"),
  avgSessionDuration: z.number().min(0, "Average duration must be at least 0"),
  materialsUploaded: z.number().min(0, "Materials uploaded must be at least 0"),
  teachingSummary: z.string().min(10, "Summary must be at least 10 characters"),
  studentProgress: z.string().min(10, "Progress must be at least 10 characters"),
  challenges: z.string().min(1, "Challenges description is required"),
  overallRating: z.number().min(1).max(5),
});

export type ReportSchema = z.infer<typeof reportSchema>;
