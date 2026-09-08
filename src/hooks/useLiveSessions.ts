import { useMutation, useQuery} from "@tanstack/react-query";
import { CreateLiveSession } from "../types/liveSessions";
import { createLiveSession , getAllLiveSessions,getLiveSession,deleteLiveSession } from "../services/LiveSessionsService";
import ErrorService from "../utils/ErrorService";   
import { useQueryClient } from "@tanstack/react-query";

export const useCreateLiveSessions=()=>{
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn:(data:CreateLiveSession)=>createLiveSession(data),
        onSuccess:()=>{
            ErrorService.success("Live session created successfully");
            queryClient.invalidateQueries({
                queryKey:["liveSessions"]
            })
        },
        onError:()=>{
            ErrorService.error("Failed to create live session");
        }
    })
}

export const useGetAllLiveSessions = (page: number = 1, limit: number = 10, search?: string) => {
    return useQuery({
        queryKey: ["liveSessions", page, limit, search],
        queryFn: () => getAllLiveSessions(page, limit, search),
    });
};

export const useGetLiveSession = (id: string) => {
    return useQuery({
        queryKey: ['liveSession', id],
        queryFn: () => getLiveSession(id),
        enabled: !!id,
    });
};

export const useDeleteLiveSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteLiveSession(id),
        onSuccess: () => {
            ErrorService.success("Live Session Deleted Successfully");
            queryClient.invalidateQueries({
                queryKey: ['liveSessions'],
            });
        },
        onError: () => {
            ErrorService.error("Failed to Delete Live Session");
        },
    });
};