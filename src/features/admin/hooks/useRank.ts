import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRank, deleteRank, getAllRanks, getRank, updateRank } from "../services/RankServices";
import { CreateRankBody, UpdateRankBody } from "../../../types/rank";
import { message } from "antd";

import { useTranslation } from "react-i18next";

export const useGetRanks = () => {
    const { i18n } = useTranslation();
    const lang = i18n.language?.split('-')[0] || 'ar';
    return useQuery({
        queryKey: ['ranks', lang],
        queryFn: () => getAllRanks(),
    });
};

export const useGetRank = (id: string) => {
    const { i18n } = useTranslation();
    const lang = i18n.language?.split('-')[0] || 'ar';
    return useQuery({
        queryKey: ['rank', id, lang],
        queryFn: () => getRank(id),
    });
};

export const useCreateRank = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (rankData: CreateRankBody) => createRank(rankData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ranks'] });
            message.success('Rank created successfully');
        },
    });
};

export const useUpdateRank = (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (rankData: UpdateRankBody) => updateRank(id, rankData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rank', id] });
            queryClient.invalidateQueries({ queryKey: ['ranks'] });
            message.success('Rank updated successfully');
        },
    });
};

export const useDeleteRank = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteRank(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ranks'] });
            message.success('Rank deleted successfully');
        },
    });
};