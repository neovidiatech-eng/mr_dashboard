import api from "../../../lib/axios";
import { CreateLiveSession, UpdateLiveSession, StudentUpcomingLiveSessionsResponse, StudentNextLiveSessionResponse } from "../../../types/liveSessions";

export const createLiveSession = async (data: CreateLiveSession) => {
    const response = await api.post('livesessions', data)
    return response.data
}

export const getAllLiveSessions = async (page: number = 1, limit: number = 10, search?: string) => {
    const params: Record<string, any> = { page, limit };
    if (search) params.search = search;
    const response = await api.get('livesessions', { params });
    return response.data;
}

export const getLiveSession = async (id: string) => {
    const response = await api.get(`livesessions/${id}`)
    return response.data

}

export const deleteLiveSession = async (id: string) => {
    const response = await api.delete(`livesessions/${id}`)
    return response.data

}

export const updateLiveSessions = async (id: string, data: UpdateLiveSession) => {
    const response = await api.patch(`livesessions/${id}`, data)
    return response.data
}


export const startExistingLiveSession = async (id: string) => {
    const response = await api.patch(`livesessions/${id}/start`)
    return response.data
}

export const endExistingLiveSession = async (id: string) => {
    const response = await api.patch(`livesessions/${id}/end`);
    return response.data;
}

export const getStudentUpcomingLiveSessions = async (
    page: number = 1,
    limit: number = 3,
    search?: string
): Promise<StudentUpcomingLiveSessionsResponse> => {
    const params: Record<string, any> = { page, limit };
    if (search) params.search = search;
    const response = await api.get('livesessions/student/upcoming', { params });
    return response.data;
}

export const getStudentNextLiveSession = async (): Promise<StudentNextLiveSessionResponse> => {
    const response = await api.get('livesessions/student/next');
    return response.data;
}

export const joinLiveSession = async (id: string) => {
    const response = await api.patch(`livesessions/${id}/join`);
    return response.data;
}