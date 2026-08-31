import { useQuery } from "@tanstack/react-query";
import { getAllStages } from "../services/StageServices";

export const useGetAllStages = () => {
    return useQuery({
        queryKey: ["stages"],
        queryFn: getAllStages
    })
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addStageById, updateStage, deleteStage, getStageById, StageCreate } from "../services/StageServices";
import ErrorService from "../../../utils/ErrorService";
import { useTranslation } from "react-i18next";

export const useAddStage = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: (stage: StageCreate) => addStageById(stage),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stages"] });
            queryClient.invalidateQueries({ queryKey: ["ranks"] });
            ErrorService.success(t('stageAddedSuccess'));
        },
        onError: (error) => {
            ErrorService.handleError(error);
        },
    });
};

export const useUpdateStage = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: ({ id, stage }: { id: string; stage: StageCreate }) =>
            updateStage(id, stage),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stages"] });
            ErrorService.success(t('stageUpdatedSuccess'));
        },
        onError: (error) => {
            ErrorService.handleError(error);
        },
    });
};

export const useDeleteStage = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: (id: string) => deleteStage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stages"] });
            queryClient.invalidateQueries({ queryKey: ["ranks"] });
            ErrorService.success(t('stageDeletedSuccess'));
        },
        onError: (error) => {
            ErrorService.handleError(error);
        },
    });
};

export const useStageById = (id: string) => {
    return useQuery({
        queryKey: ["stages", id],
        queryFn: () => getStageById(id)
    });
};