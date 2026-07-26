import api from "../lib/axios";
import {
    RequestDashboardResponse,
    CreateUnifiedRequestInput,
    CreateRequestType,
    GetRequestsResponse
} from "../types/requests";

// Unified Dashboard
export const getRequestDashboard = async (): Promise<RequestDashboardResponse> => {
    const res = await api.get<RequestDashboardResponse>('/requests/my');
    return res.data;
};

export const createUnifiedRequest = async (data: CreateUnifiedRequestInput): Promise<any> => {
    const { attachments, ...payload } = data;
    const res = await api.post('/requests', payload);
    return res.data;
};

// Legacy Compatibility
export const createRequest = async (data: CreateRequestType | any): Promise<any> => {
    // If it's the old session-requests logic, we still send it as JSON
    const res = await api.post('/requests', data);
    return res.data;
};

export const getMyRequests = async (): Promise<GetRequestsResponse> => {
    const res = await api.get<GetRequestsResponse>('/requests/my');
    return res.data;
};
