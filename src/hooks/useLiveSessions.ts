import { useMutation, useQuery } from "@tanstack/react-query";
import { CreateLiveSession, UpdateLiveSession } from "../types/liveSessions";
import { createLiveSession, getAllLiveSessions, getLiveSession, deleteLiveSession, updateLiveSessions, startExistingLiveSession, endExistingLiveSession, getStudentUpcomingLiveSessions, getStudentNextLiveSession, joinLiveSession } from "../features/admin/services/LiveSessionsService";
import ErrorService from "../utils/ErrorService";
import { useQueryClient } from "@tanstack/react-query";

export const useCreateLiveSessions = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateLiveSession) => createLiveSession(data),
        onSuccess: () => {
            ErrorService.success("Live session created successfully");
            queryClient.invalidateQueries({
                queryKey: ["liveSessions"]
            })
        },
        onError: () => {
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

export const useUpdateLiveSession =()=>{
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn:({id,data}: {id: string, data: UpdateLiveSession})=>updateLiveSessions(id,data),
        onSuccess:()=>{
            ErrorService.success("Live Session Updated Successfully");
            queryClient.invalidateQueries({
                queryKey: ['liveSessions'],
            });
        },
        onError:()=>{
            ErrorService.error("Failed to Update Live Session");
        },
    })

}


export const useStartExistingLiveSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => startExistingLiveSession(id),
        onSuccess: () => {
            ErrorService.success("Existing Live Session Started Successfully");
            queryClient.invalidateQueries({
                queryKey: ['liveSessions'],
            });
        },
        onError: () => {
            ErrorService.error("Failed to Start Existing Live Session");
        },
    });
};

export const useEndExistingLiveSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (param: string | { id: string; [key: string]: any }) => {
            const id = typeof param === 'string' ? param : param.id;
            return endExistingLiveSession(id);
        },
        onSuccess: () => {
            ErrorService.success("Live Session Ended Successfully");
            queryClient.invalidateQueries({
                queryKey: ['liveSessions'],
            });
        },
        onError: () => {
            ErrorService.error("Failed to End Live Session");
        },
    });
};

export const useGetStudentUpcomingLiveSessions = (
    page: number = 1,
    limit: number = 3,
    search?: string
) => {
    return useQuery({
        queryKey: ['studentUpcomingLiveSessions', page, limit, search],
        queryFn: () => getStudentUpcomingLiveSessions(page, limit, search),
        refetchInterval: 5000,
    });
};

export const useGetStudentNextLiveSession = () => {
    return useQuery({
        queryKey: ['studentNextLiveSession'],
        queryFn: () => getStudentNextLiveSession(),
        refetchInterval: 5000,
    });
};

export const useJoinLiveSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => joinLiveSession(id),
        onSuccess: () => {
            ErrorService.success("Joined Live Session Successfully");
            queryClient.invalidateQueries({
                queryKey: ['studentNextLiveSession'],
            });
            queryClient.invalidateQueries({
                queryKey: ['studentUpcomingLiveSessions'],
            });
            queryClient.invalidateQueries({
                queryKey: ['liveSessions'],
            });
        },
        onError: (error: any) => {
            ErrorService.handleError(error);
        },
    });
};
