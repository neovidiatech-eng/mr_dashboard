import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { EndSession, getUserSessions, JoinSession, SendFeedBack } from "../services/SessionsServices"
import { SendReviewSchedulePayload } from "../types/scheduales"
import ErrorService from "../utils/ErrorService"

export const useUserSessions = (search: string) => {
    return useQuery({
        queryKey: ["user-sessions", search],
        queryFn: () => getUserSessions(search),
    })
}

export const useSendReview = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: { id: string, data: SendReviewSchedulePayload }) => SendFeedBack(payload.id, payload.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-sessions"] })
        },
    })
}

export const useJoinSession = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => JoinSession(id),
        onSuccess: () => {
            ErrorService.success("Joined session successfully");
            queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    })
}

export const useEndSession = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => EndSession(id),
        onSuccess: () => {
            ErrorService.success("Session ended successfully")
            queryClient.invalidateQueries({ queryKey: ["user-sessions"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard"] })
        },
    })
}
