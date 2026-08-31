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
    const formData = new FormData();
    const { attachments, ...rest } = data;
    Object.keys(rest).forEach((key) => {
        const val = (rest as any)[key];
        if (val !== undefined && val !== null) {
            formData.append(key, String(val));
        }
    });
    if (attachments && attachments.length > 0) {
        attachments.forEach((file: File) => {
            formData.append('attachments', file);
        });
    }
    const res = await api.post('/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

// Legacy Compatibility
export const createRequest = async (data: CreateRequestType | any): Promise<any> => {
    const res = await api.post('/requests', data);
    return res.data;
};

export const getMyRequests = async (): Promise<GetRequestsResponse> => {
    const res = await api.get<GetRequestsResponse>('/requests/my');
    return res.data;
};
