import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getExpenseSchema = (t: TFunc) => z.object({
  title: z
    .string()
    .min(3, t("validation.min", { count: 3 }))
    .max(200, t("validation.max", { count: 200 })),
    
  amount: z.coerce
    .number()
    .min(0.01, t("validation.required")),
    
  currencyId: z.string().min(1, t("validation.required")),
  
  type: z.enum(['salary', 'amenities', 'general', 'management', 'marketing', 'other']).default('general'),
  
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: t("validation.required"),
  }),
  
  payment_type: z.string().min(1, t("validation.required")),
  
  status: z.enum(['paid', 'pending', 'failed']).default('pending'),
});

export type ExpenseFormData = z.infer<ReturnType<typeof getExpenseSchema>>;

export interface Expense extends ExpenseFormData {
  id: string;
  createdAt?: string;
  currency?: {
    id: string;
    code: string;
    symbol: string;
  };
}