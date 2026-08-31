import api from "../../../lib/axios";
import { OfflineGroupResponse, OfflineGroupsResponse, CreateOfflineGroupPayload } from "../../../types/offlineGroup";

export const getOfflineGroups = async (): Promise<OfflineGroupsResponse> => {
    const response = await api.get('/offline-groups');
    return response.data;
};

export const getOfflineGroup = async (id: string): Promise<OfflineGroupResponse> => {
    const response = await api.get(`/offline-groups/${id}`);
    return response.data;
};

export const createOfflineGroup = async (data: CreateOfflineGroupPayload): Promise<OfflineGroupResponse> => {
    const response = await api.post('/offline-groups', data);
    return response.data;
};

export const updateOfflineGroup = async (id: string, data: Partial<CreateOfflineGroupPayload>): Promise<OfflineGroupResponse> => {
    const response = await api.patch(`/offline-groups/${id}`, data);
    return response.data;
};

export const deleteOfflineGroup = async (id: string): Promise<OfflineGroupResponse> => {
    const response = await api.delete(`/offline-groups/${id}`);
    return response.data;
};
