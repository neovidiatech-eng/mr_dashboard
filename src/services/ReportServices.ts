import apiClient from "../lib/axios";
import { TeacherReportsResponse } from "../types/reports";

export const getAdminReports = async (): Promise<TeacherReportsResponse> => {
    const response = await apiClient.get('/weekly-reports');
    return response.data;
}

export const getAdminReportsId = async (id: string): Promise<TeacherReportsResponse> => {
    const response = await apiClient.get(`/teacher/weekly-reports/${id}`);
    return response.data;
}

export const deleteAdminReport = async (id: string): Promise<void> => {
    await apiClient.delete(`/teacher/weekly-reports/${id}`);
}
