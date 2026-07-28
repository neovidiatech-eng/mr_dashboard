import api from "../../../lib/axios";

export const requestCoursePurchase = async (courseId: string, notes?: string) => {
  const response = await api.post("/course-purchase-requests", { courseId, notes });
  return response.data;
};

export const getMyCoursePurchaseRequests = async () => {
  const response = await api.get("/course-purchase-requests");
  return response.data;
};
