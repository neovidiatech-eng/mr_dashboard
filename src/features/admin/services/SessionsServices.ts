import api from "../../../lib/axios";
import { CreateRecurringSessionBody, CreateSessionBody, GetSessionsResponse, UpdateSessionBody, Schedule } from "../../../types/scheduales";

export const getAllSchedules = async (page: number = 1, limit: number = 10): Promise<GetSessionsResponse> => {
    const response = await api.get<GetSessionsResponse>(`/schedules?page=${page}&limit=${limit}`);
    return response.data;
};

export const searchSchedules = async (searchTerm: string, page: number = 1, limit: number = 10): Promise<GetSessionsResponse> => {
    const response = await api.get<GetSessionsResponse>(`/schedules?search=${searchTerm}&page=${page}&limit=${limit}`);
    return response.data;
};

export const getSchedulesForTeacher = async (
    teacherId: string
): Promise<GetSessionsResponse> => {
    const response = await api.get<GetSessionsResponse>(
        `/schedules/teacher/${teacherId}`
    );
    return response.data;
};

export const getSchedulesForStudent = async (
    studentId: string
): Promise<GetSessionsResponse> => {
    const response = await api.get<GetSessionsResponse>(
        `/schedules/student/${studentId}`
    );
    return response.data;
};

export const createSchedule = async (
    scheduleData: CreateSessionBody
) => {
    const response = await api.post("/schedules/create-one/", scheduleData);
    return response.data;
};

export const createRecurringSchedule = async (
    scheduleData: CreateRecurringSessionBody
) => {
    const response = await api.post(
        "/schedules/create-recurring/",
        scheduleData
    );
    return response.data;
};

export const deleteSchedule = async (scheduleId: string) => {
    const response = await api.delete(`/schedules/${scheduleId}`);
    return response.data;
};

export const updateSchedule = async (
    scheduleId: string,
    scheduleData: UpdateSessionBody
) => {
    const response = await api.patch(
        `/schedules/${scheduleId}`,
        scheduleData
    );
    return response.data;
};

export const getScheduleById = async (id: string): Promise<{ data: { schedule: Schedule } }> => {
    const response = await api.get<{ data: { schedule: Schedule } }>(`/schedules/${id}`);
    return response.data;
};

export const updateInstructorForSchedule = async (scheduleId: string, teacherId: string) => {
    const response = await api.patch(`/schedules/change-instructor/${scheduleId}`, { teacherId });
    return response.data;
};