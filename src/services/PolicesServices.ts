import api from "../lib/axios";
import { 
    PoliciesResponse, 
    SinglePolicyResponse, 
    CreatePolicyInput, 
    UpdatePolicyInput,
    CreateNoticeInput
} from "../types/polices";

export const getPolicies = async (): Promise<PoliciesResponse> => {
    const res = await api.get<PoliciesResponse>('/policies')
    return res.data
}

export const getNotice = async (): Promise<SinglePolicyResponse> => {
    const res = await api.get<PoliciesResponse>(`/policies/notice`) as any; 
    // Sometimes the backend structure varies, adjusting based on response
    return res.data;
}

export const createPolicy = async (data: CreatePolicyInput): Promise<SinglePolicyResponse> => {
    const res = await api.post<SinglePolicyResponse>('/policies', data)
    return res.data
}

export const createNotice = async (data: CreateNoticeInput): Promise<SinglePolicyResponse> => {
    const res = await api.post<SinglePolicyResponse>(`/policies/notice`, data)
    return res.data
}

export const updatePolicy = async (id: string, data: UpdatePolicyInput): Promise<SinglePolicyResponse> => {
    const res = await api.patch<SinglePolicyResponse>(`/policies/${id}`, data)
    return res.data
}

export const deletePolicy = async (id: string): Promise<void> => {
    await api.delete(`/policies/${id}`)
}
