import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addTeacherReport, getTeacherInsights, getTeacherReportById, getTeacherReports, updateTeacherReport } from "../services/TeacherReports"
import { CreateTeacherReport } from "../../../types/reports"

export const useTeacherReports = () => {
    return useQuery({
        queryKey: ["teacher-reports"],
        queryFn: getTeacherReports,
    })
}

export const useTeacherReportById = (id: string) => {
    return useQuery({
        queryKey: ["teacher-report-by-id", id],
        queryFn: () => getTeacherReportById(id),
        enabled: !!id,
    })
}

export const useTeacherInsights = (params?: { weekStarting: string; weekEnding: string }) => {
    return useQuery({
        queryKey: ["teacher-insights", params],
        queryFn: () => getTeacherInsights(params),
        enabled: !!params?.weekStarting && !!params?.weekEnding,
    })
}

export const useAddTeacherReport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTeacherReport) => addTeacherReport(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teacher-reports"] });
        }
    });
}

export const useUpdateTeacherReport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<CreateTeacherReport> }) => 
            updateTeacherReport(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["teacher-reports"] });
            queryClient.invalidateQueries({ queryKey: ["teacher-report-by-id", variables.id] });
        }
    });
}

