import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAllWithdrawals, getTransactions, updateWithdrawalStatus } from "../services/TransactionServices"

export const useTransactions = (page: number = 1, limit: number = 20) => {
    return useQuery({
        queryKey: ["transactions", page, limit],
        queryFn: () => getTransactions(page, limit),
    })
}

export const useWithdrawals = () => {
    return useQuery({
        queryKey: ["withdrawals"],
        queryFn: getAllWithdrawals,
    })
}

export const useUpdateWithdrawal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status, adminNotes }: { id: string, status: 'approve' | 'reject', adminNotes?: string }) => 
            updateWithdrawalStatus(id, status, adminNotes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
    });
}