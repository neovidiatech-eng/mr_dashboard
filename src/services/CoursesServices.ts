import api from "../lib/axios";
import { CoursesData, Course, CoursesResponse, CourseResponse } from "../types/courses";

export const getAllCourses = async (page: number, limit: number, rankId?: string): Promise<CoursesData> => {
    const params: any = { page, limit };
    if (rankId) params.rankId = rankId;

    const response = await api.get<CoursesResponse>("/materials/courses", { params });
    return response.data.data;
}


export const getCourseById = async (id: string): Promise<Course> => {
    const response = await api.get<CourseResponse>(`/materials/courses/${id}`);
    return response.data.data;
}

export const createCourse = async (data: FormData): Promise<Course> => {
    const response = await api.post<CourseResponse>(`/materials/courses`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
}

export const updateCourse = async (id: string, data: FormData | Course): Promise<Course> => {
    const response = await api.patch<CourseResponse>(`/materials/courses/${id}`, data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data.data;
}

export const deleteCourse = async (id: string): Promise<void> => {
    await api.delete(`/materials/courses/${id}`);
}

export const getStudentProgress = async (courseId: string) => {
    const response = await api.get(`/materials/courses/${courseId}/student-progress`);
    return response.data.data;
}