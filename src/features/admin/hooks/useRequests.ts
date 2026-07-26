import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllRequests, updateRequestStatus } from "../services/RequestsServices";
import ErrorService from "../../../utils/ErrorService";
import { useTranslation } from "react-i18next";

export const useGetRequests = () => {
    return useQuery({
        queryKey: ["requests"],
        queryFn: () => getAllRequests(),
    });
};

export const useUpdateRequestStatus = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: ({ 
            id, 
            status,
            adminNotes 
        }: { 
            id: string; 
            status: 'approve' | 'reject';
            adminNotes?: string 
        }) => updateRequestStatus(id,status, adminNotes),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["requests"] });
            ErrorService.success(t('requestUpdatedSuccess'));
        },
        
    });
};
