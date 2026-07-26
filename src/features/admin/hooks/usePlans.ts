import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPlan, deletePlans, getPlans, updatePlan, UpdatePlanPayload } from "../services/PlansServices";
import { Plan } from "../../../types/plan";

export const usePlans = () => {
    return useQuery<Plan[]>({
        queryKey: ['plans'],
        queryFn: getPlans,
    })
}

export const useCreatePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPlan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
        },
    });
};

export const useUpdatePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePlanPayload }) => updatePlan(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
        },
    });
};

export const useDeletePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePlans,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plans'] });
        },
    });
};