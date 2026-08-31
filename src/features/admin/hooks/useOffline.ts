import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getOfflineGroups,
    getOfflineGroup,
    createOfflineGroup,
    updateOfflineGroup,
    deleteOfflineGroup
} from "../services/offlineServices";
import { CreateOfflineGroupPayload } from "../../../types/offlineGroup";
import ErrorService from "../../../utils/ErrorService";
import { useTranslation } from "react-i18next";

export const useGetOfflineGroups = () => {
    return useQuery({
        queryKey: ["offlineGroups"],
        queryFn: getOfflineGroups,
    });
};

export const useGetOfflineGroup = (id: string) => {
    return useQuery({
        queryKey: ["offlineGroups", id],
        queryFn: () => getOfflineGroup(id),
        enabled: !!id,
    });
};

export const useCreateOfflineGroup = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: (data: CreateOfflineGroupPayload) => createOfflineGroup(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["offlineGroups"] });
            ErrorService.success(t("offlineGroupAddedSuccess", "تم إضافة المجموعة بنجاح"));
        },
        onError: (error) => {
            ErrorService.handleError(error);
        },
    });
};

export const useUpdateOfflineGroup = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateOfflineGroupPayload> }) =>
            updateOfflineGroup(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["offlineGroups"] });
            ErrorService.success(t("offlineGroupUpdatedSuccess", "تم تحديث المجموعة بنجاح"));
        },
        onError: (error) => {
            ErrorService.handleError(error);
        },
    });
};

export const useDeleteOfflineGroup = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: (id: string) => deleteOfflineGroup(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["offlineGroups"] });
            ErrorService.success(t("offlineGroupDeletedSuccess", "تم حذف المجموعة بنجاح"));
        },
        onError: (error) => {
            ErrorService.handleError(error);
        },
    });
};
