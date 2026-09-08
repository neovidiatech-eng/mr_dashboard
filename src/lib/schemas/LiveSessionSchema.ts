import { z } from "zod";


type TFunc = (key: string, options?: any) => string;
export const getLiveSessionSchema = (t: TFunc) => z.object({
    title:z.string().min(1,t("validation.required")),
    planId: z.string().min(1, t("validation.required")),
    stageId: z.string().min(1, t("validation.required")),
    date: z.string().min(1, t("validation.required")),
    time: z.string().min(1, t("validation.required"))

})
export type LiveSessionFormData = z.infer<ReturnType<typeof getLiveSessionSchema>>