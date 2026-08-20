import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllAttendance, getTodayAttendance, getStudentAttendance, updateAttendnace, deleteAttendance } from "../services/AttendanceService";
import { AttendanceListResponse, TodayAttendanceResponse, UpdateAttendancePayload } from "../../../types/attendance";
import ErrorService from "../../../utils/ErrorService";
import { t } from "i18next";


export const useGetAllAttendance = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ['attendance', page, limit],
        queryFn: () => getAllAttendance(page, limit)
    });
};

export const useGetTodayAttendance = () => {
    return useQuery<TodayAttendanceResponse>({
        queryKey: ['attendance', 'today'],
        queryFn: () => getTodayAttendance()
    });
};

export const useGetStudentAttendance = (studentId: string, page: number = 1, limit: number = 10) => {
    return useQuery<AttendanceListResponse>({
        queryKey: ['attendance', 'student', studentId, page, limit],
        queryFn: () => getStudentAttendance(studentId, page, limit),
        enabled: !!studentId,
    });
}

export const useUpdateAttendance = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: UpdateAttendancePayload }) =>
            updateAttendnace(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendance"] })
            ErrorService.success(t('attendanceUpdatedSuccess'))

        }
    })

}

export const useDeleteAttendance = () => {
    const queryclient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deleteAttendance(id),
        onSuccess: () => {
            queryclient.invalidateQueries({ queryKey: ["attendance"] })
            ErrorService.success(t("attendanceDeletedSuccess"))

        }
    })
}