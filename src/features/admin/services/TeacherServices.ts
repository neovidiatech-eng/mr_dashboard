import api from "../../../lib/axios"
import { CreateTeacherInput, Teacher, TeachersData, TeachersFetchResponse } from "../../../types/teachers"

export const getTeacher = async ({ search, page, limit }: { search?: string, page: number, limit: number }): Promise<TeachersData> => {
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    if (page) query.append("page", page.toString());
    if (limit) query.append("limit", limit.toString());
    const response = await api.get(`/teachers?${query.toString()}`);
    return response.data.data
}

// export const searchTeacher = async (search: string): Promise<TeachersData> => {
//     const response = await api.get(`/teachers?search=${search}`);
//     return response.data.data
// }

export const getTeacherById = async (id: string): Promise<any> => {
    const response = await api.get(`/teachers/${id}`);
    return response.data.data
}

export const createTeacher = async (data: CreateTeacherInput): Promise<TeachersFetchResponse> => {
    const response = await api.post("/teachers/create", data);
    return response.data
}

export const updateTeacher = async (id: string, data: CreateTeacherInput | Partial<Teacher>): Promise<TeachersFetchResponse> => {
    const response = await api.patch(`/teachers/update/${id}`, data);
    return response.data
}

export const deleteTeacher = async (id: string): Promise<TeachersFetchResponse> => {
    const response = await api.delete(`/teachers/delete/${id}`);
    return response.data
}