import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getAdminReports, getAdminReportsId, deleteAdminReport } from "../services/ReportServices"

export const useAdminReports = () => {
    return useQuery({
        queryKey: ['admin-reports'],
        queryFn: getAdminReports
    })
}

export const useAdminReport = (id: string) => {
    return useQuery({
        queryKey: ['admin-report', id],
        queryFn: () => getAdminReportsId(id),
        enabled: !!id
    })
}

export const useDeleteAdminReport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteAdminReport(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
        }
    });
}
 