import api from "../../../lib/axios";
import { SettingsResponse, UpdateSettingsRequest } from "../../../types/settings";

export const getSettings = async (): Promise<SettingsResponse> => {
    const response = await api.get('/settings/');
    return response.data;
}

export const updateSettings = async (data: UpdateSettingsRequest): Promise<SettingsResponse> => {
    const response = await api.patch('/settings/', data);
    return response.data;
}