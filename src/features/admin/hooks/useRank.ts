import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRank, deleteRank, getAllRanks, getRank, updateRank } from "../services/RankServices";
import { CreateRankBody, UpdateRankBody } from "../../../types/rank";
import { message } from "antd";

export const useGetRanks = () => {
    return useQuery({
        queryKey: ['ranks'],
        queryFn: () => getAllRanks(),
    });
};

export const useGetRank = (id: string) => {
    return useQuery({
        queryKey: ['rank', id],
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