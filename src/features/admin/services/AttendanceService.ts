import api from "../../../lib/axios";
import { 
    AttendanceListResponse, 
    TodayAttendanceResponse, 
    UpdateAttendancePayload, 
    UpdateAttendanceResponse 
} from "../../../types/attendance";

export const getAllAttendance = async (page: number, limit: number) => {
    const response = await api.get<AttendanceListResponse>(`/attendance?page=${page}&limit=${limit}`)
    return response.data
}


export const getTodayAttendance = async () => {
    const response = await api.get<TodayAttendanceResponse>('/attendance/today')
    return response.data
}

export const getStudentAttendance = async (studentId: string, page: number, limit: number) => {
    const response = await api.get<AttendanceListResponse>(`/attendance/student/${studentId}?page=${page}&limit=${limit}`)
    return response.data
}


export const updateAttendnace = async (id:string,data:UpdateAttendancePayload)=>{
    const response = await api.patch<UpdateAttendanceResponse>(`/attendance/${id}`,data)
    return response.data

}

export const deleteAttendance = async (id:string)=>{
    const response = await api.delete(`/attendance/${id}`)
    return response.data
}