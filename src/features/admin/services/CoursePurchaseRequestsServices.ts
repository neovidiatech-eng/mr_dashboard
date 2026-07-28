import api from "../../../lib/axios";
import { CoursePurchaseRequestsResponse } from "../../../types/coursePurchaseRequest";

export const getCoursePurchaseRequests = async (status?: string): Promise<CoursePurchaseRequestsResponse> => {
  const response = await api.get("/course-purchase-requests", {
    params: status && status !== "all" ? { status } : undefined,
  });
  return response.data;
};

export const changeCoursePurchaseRequestStatus = async (
  id: string,
  status: "approved" | "rejected",
) => {
  const response = await api.patch(`/course-purchase-requests/${id}/status`, { status });
  return response.data;
};
