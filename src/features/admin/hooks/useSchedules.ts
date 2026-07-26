import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateSchedule, createSchedule, createRecurringSchedule, deleteSchedule, deleteRecurringScheduale } from "../services/SchedulesServices";
import { UpdateSchedulePayload, CreateSchedulePayload, CreateRecurringSchedulePayload } from "../../../types/scheduales";
import { getAllSchedules, searchSchedules, getSchedulesForTeacher, getScheduleById, updateInstructorForSchedule } from "../services/SessionsServices";

export const useGetScheduleById = (id: string) => {
    return useQuery({
        queryKey: ["schedules", id],
        queryFn: () => getScheduleById(id),
        enabled: !!id,
    });
};
import ErrorService from "../../../utils/ErrorService";
import { useTranslation } from "react-i18next";

export const useGetSchedules = (page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ["schedules", page, limit],
        queryFn: () => getAllSchedules(page, limit),
    });
};

export const useSearchSchedules = (searchTerm: string, page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: ["schedules", searchTerm, page, limit],
        queryFn: () => searchTerm ? searchSchedules(searchTerm, page, limit) : getAllSchedules(page, limit),
    });
};

export const useGetSchedulesByTeacher = (teacherId: string) => {
    return useQuery({
        queryKey: ["schedules", "teacher", teacherId],
        queryFn: () => getSchedulesForTeacher(teacherId),
        enabled: !!teacherId,
    });
};

export const useCreateSchedule = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: (data: CreateSchedulePayload) => createSchedule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["schedules"] });
            ErrorService.success(t('sessionAddedSuccess'));
        }
    });
};

export const useCreateRecurringSchedule = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: (data: CreateRecurringSchedulePayload) => createRecurringSchedule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["schedules"] });
            ErrorService.success(t('sessionsAddedSuccess'));
        }
    });
};

export const useDeleteSchedule = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: (id: string) => deleteSchedule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["schedules"] });
            ErrorService.success(t('sessionDeletedSuccess'));
        }
    });
};

export const useDeleteGroupedSchedule = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: (id: string) => deleteRecurringScheduale(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["schedules"] });
            ErrorService.success(t('sessionDeletedSuccess'));
        }
    });
};


export const useUpdateSchedule = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSchedulePayload }) =>
            updateSchedule(id, data),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["schedules"] });
            ErrorService.success(t('sessionUpdatedSuccess'));
        }
    });
};


export const useUpdateInstructorForSchedule = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: ({ id, teacherId }: { id: string; teacherId: string }) =>
            updateInstructorForSchedule(id, teacherId),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["schedules"] });
            ErrorService.success(t('sessionUpdatedSuccess'));
        }
    });
}
