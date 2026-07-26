import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
    getRequestDashboard, 
    createUnifiedRequest,
    getMyRequests,
    createRequest as legacyCreateRequest
} from "../services/RequestServices";
import ErrorService from "../utils/ErrorService";
import { CreateUnifiedRequestInput, CreateRequestType } from "../types/requests";

export const useRequestDashboard = () => {
    return useQuery({
        queryKey: ["requests-dashboard"],
        queryFn: getRequestDashboard,
    });
};

export const useMyRequests = () => {
    return useQuery({
        queryKey: ["my-requests"],
        queryFn: getMyRequests,
    });
};

export const useCreateRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateUnifiedRequestInput | CreateRequestType | any) => {
            if (data instanceof FormData || (data.title && data.priority)) {
                return createUnifiedRequest(data);
            }
            return legacyCreateRequest(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["requests-dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["my-requests"] });
            ErrorService.success("Request submitted successfully");
        },
        onError: () => ErrorService.error("Failed to submit request"),
    });
};
