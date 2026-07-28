import api from "../../../lib/axios";
import { ReviewsResponse } from "../../../types/review";

export const getReviews = async (
  page = 1,
  limit = 10,
  revieweeId?: string,
): Promise<ReviewsResponse> => {
  const response = await api.get("/schedules/reviews", {
    params: { page, limit, ...(revieweeId ? { revieweeId } : {}) },
  });
  return response.data;
};

export const toggleReviewVisibility = async (id: string) => {
  const response = await api.patch(`/schedules/reviews/${id}/visibility`);
  return response.data;
};
