import api from "../lib/axios"
import { GetUserSchedulesResponse, SendReviewSchedulePayload } from "../types/scheduales"

export const getUserSessions = async (search: string): Promise<GetUserSchedulesResponse> => {
    const response = await api.get<GetUserSchedulesResponse>(`/schedules/user/schedules?search=${search}`)
    return response.data
}

export const SendFeedBack = async (id: string, payload: SendReviewSchedulePayload) => {
    const response = await api.post(`/schedules/${id}/review`, payload)
    return response.data
}

export const JoinSession = async (id: string) => {
    const response = await api.post(`/schedules/${id}/join`)
    return response.data
}

export const EndSession = async (id: string) => {
    const response = await api.post(`/schedules/${id}/leave`)
    return response.data
}
