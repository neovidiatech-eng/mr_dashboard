import api from "../lib/axios"
import { Assignment, HomeworkResponse } from "../types/assignment"

export const getAssignments = async (): Promise<HomeworkResponse> => {
    const response = await api.get<HomeworkResponse>("/homework")
    return response.data
}

export const createAssignment = async (data: any): Promise<Assignment> => {
    const response = await api.post("/homework", data)
    return response.data
}

export const updateAssignment = async (id: string, data: any): Promise<Assignment> => {
    const response = await api.put(`/homework/${id}`, data)
    return response.data
}

export const deleteAssignment = async (id: string): Promise<void> => {
    await api.delete(`/homework/${id}`)
}

export const assignAnswerToAssignment = async (assignmentId: string, data: FormData): Promise<void> => {
    await api.post(`/homework/${assignmentId}/submit`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}