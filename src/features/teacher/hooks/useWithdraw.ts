import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTeacherWithdrawal, getTeacherWithdrawals } from "../services/Withdraw";

export const useTeacherWithdrawals = () => {
    return useQuery({
        queryKey: ["teacher-withdrawals"],
        queryFn: getTeacherWithdrawals,
    });
};

export const useCreateTeacherWithdrawal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (amount: number) => createTeacherWithdrawal(amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teacher-withdrawals"] });
            queryClient.invalidateQueries({ queryKey: ["teacher-profile"] });
        },
    });
};

