import api from "../../../lib/axios";
import { Plan } from "../../../types/plan";

// get plans
export const getPlans = async (): Promise<Plan[]> => {
  try {
    const response = await api.get("/subscription/plans");
    const data = response.data.data;

    console.log(data);
    return data;
  } catch (error) {
    console.error("Get plans failed:", error);
    throw error;
  }
};

//delete plans
export const deletePlans = async (id: string) => {
  try {
    const res = await api.delete(`/subscription/plans/${id}`);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export interface UpdatePlanPayload {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  sessionsCount?: number;
  active?: boolean;
  currencyId?: string;
  features?: string[];
  type?: string;
}

// update plan
export const updatePlan = async (id: string, data: UpdatePlanPayload) => {
  try {
    const res = await api.patch(`/subscription/plans/${id}`, data);
    console.log(res.data);

    return res.data;
  } catch (error) {
    console.error("Update plan failed:", error);
    throw error;
  }
};

// create plan
export const createPlan = async (data: UpdatePlanPayload) => {
  try {
    const res = await api.post("/subscription/plans", data);
    return res.data;
  } catch (error) {
    console.error("Create plan failed:", error);
    throw error;
  }
};
