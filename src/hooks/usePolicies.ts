import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPolicies, getNotice, createPolicy, updatePolicy, deletePolicy, createNotice } from "../services/PolicesServices";
import ErrorService from "../utils/ErrorService";
import { CreatePolicyInput, UpdatePolicyInput, CreateNoticeInput } from "../types/polices";

export const usePolicies = () => {
    return useQuery({
        queryKey: ["policies"],
        queryFn: getPolicies,
    });
};

export const useNotice = () => {
    return useQuery({
        queryKey: ["policies", "notice"],
        queryFn: getNotice,
    });
};

export const useCreatePolicy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPolicy,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["policies"] });
            ErrorService.success("Policy created successfully");
        },
    });
};

export const useUpdatePolicy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePolicyInput }) => updatePolicy(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["policies"] });
            ErrorService.success("Policy updated successfully");
        },
    });
};

export const useDeletePolicy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePolicy,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["policies"] });
            ErrorService.success("Policy deleted successfully");
        },
    });
};

export const useCreateNotice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createNotice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["policies", "notice"] });
            ErrorService.success("Notice updated successfully");
        },
    });
};
