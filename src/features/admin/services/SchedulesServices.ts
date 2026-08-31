import api from "../../../lib/axios";
import { CreateRecurringSchedulePayload, CreateSchedulePayload, UpdateSchedulePayload } from "../../../types/scheduales";

export const getSchedulesForTeacher = async (teacherId: string) => {
    const response = await api.get(`/schedules/teacher/${teacherId}`);
    return response.data;
}

export const getSchedulesForStudent = async (studentId: string) => {
    const response = await api.get(`/schedules/student/${studentId}`);
    return response.data;
}

export const createSchedule = async (scheduleData: CreateSchedulePayload) => {
    const formData = new FormData();
    Object.keys(scheduleData).forEach((key) => {
        const value = scheduleData[key as keyof CreateSchedulePayload];
        if (value !== undefined) {
            if (Array.isArray(value)) {
                value.forEach((v) => formData.append(key, String(v)));
            } else {
                formData.append(key, value as Blob | string);
            }
        }
    });
    const response = await api.post("/schedules/create-one/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
}

export const createRecurringSchedule = async (scheduleData: CreateRecurringSchedulePayload) => {
    const formData = new FormData();
    Object.keys(scheduleData).forEach((key) => {
        const value = scheduleData[key as keyof CreateRecurringSchedulePayload];
        if (value !== undefined) {
            if (Array.isArray(value)) {
                value.forEach((v) => formData.append(key, String(v)));
            } else {
                formData.append(key, value as Blob | string);
            }
        }
    });
    const response = await api.post("/schedules/create-recurring/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
}

export const deleteSchedule = async (scheduleId: string) => {
    const response = await api.delete(`/schedules/${scheduleId}`);
    return response.data;
}

export const deleteRecurringScheduale = async (groupId: string) => {
    const response = await api.delete(`/schedules/group/${groupId}`);
    return response.data;
}

export const updateSchedule = async (scheduleId: string, scheduleData: UpdateSchedulePayload) => {
    const formData = new FormData();
    Object.keys(scheduleData).forEach((key) => {
        const value = scheduleData[key as keyof UpdateSchedulePayload];
        if (value !== undefined) {
            if (Array.isArray(value)) {
                value.forEach((v) => formData.append(key, String(v)));
            } else {
                formData.append(key, value as Blob | string);
            }
        }
    });
    const response = await api.patch(`/schedules/${scheduleId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
}