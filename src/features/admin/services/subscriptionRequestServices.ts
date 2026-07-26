import api from "../../../lib/axios";

export interface SubscriptionRequestApi {
  id: string;
  user: {
    name: string;
    phone: string;
    email: string;
  };
  plan: {
    name_ar: string;
    name_en: string;
    price: string;
    hours: number;
  };
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

//get method
export const getSubscriptionRequests = async () => {
  const response = await api.get("/subscription/requests");
  const data = response.data.data;
  console.log(data);

  return data.subscriptionRequests;
};

// get ALL subscriptions (GET /subscription/)
export const getAllSubscriptions = async () => {
  const response = await api.get("/subscription/");
  return response.data.data as any[];
};

// delete
export const deleteSubscriptionRequest = async (id: string) => {
  try {
    const res = await api.delete(`/subscription/${id}`);
    return res.data;
  } catch (error) {
    console.error("Delete subscription failed:", error);
    throw error;
  }
};

// renew subscription
export const renewSubscription = async (
  studentId: string,
  body: { planId: string; rankId: string; courseId: string }
) => {
  const res = await api.post(`/subscription/${studentId}/renew`, body);
  return res.data;
};

// change status
export const changeSubscriptionRequestStatus = async (
  id: string,
  status: "approved" | "rejected",
  rankId?: string
) => {
  try {
    const res = await api.put(`/subscription/requests/change-status/${id}`, {
      status,
      rankId
    });
    return res.data;
  } catch (error) {
    console.error("Change status failed:", error);
    throw error;
  }
};

// https://github.com/neovidiatech-eng/lms_front
