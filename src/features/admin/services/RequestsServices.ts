import api from "../../../lib/axios";
import { GetRequestsResponse } from "../../../types/requests";

export const getAllRequests = async (): Promise<GetRequestsResponse> => {
    const response = await api.get<GetRequestsResponse>("/requests");
    return response.data;
    console.log(response.data);
};

export const updateRequestStatus = async (
    requestId: string,
    status: 'approve' | 'reject',
    adminNotes?: string
) => {
    const response = await api.patch(`/requests/${requestId}/${status}`, {
        adminNotes
    });
    return response.data;
};
