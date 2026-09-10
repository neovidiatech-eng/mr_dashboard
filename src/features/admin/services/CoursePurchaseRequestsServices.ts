import api from "../../../lib/axios";
import { CoursePurchaseRequestsResponse } from "../../../types/coursePurchaseRequest";

export const getCoursePurchaseRequests = async (
  status?: string,
  page: number = 1,
  limit: number = 10,
): Promise<CoursePurchaseRequestsResponse> => {
  const params: Record<string, unknown> = { page, limit };
  if (status && status !== "all") params.status = status;

  const response = await api.get("/course-purchase-requests", { params });
  return response.data;
};

export const changeCoursePurchaseRequestStatus = async (
  id: string,
  status: "approved" | "rejected",
) => {
  const response = await api.patch(`/course-purchase-requests/${id}/status`, {
    status,
  });
  return response.data;
};
