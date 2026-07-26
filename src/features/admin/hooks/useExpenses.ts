import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExpenseService } from "../services/ExpenseService";
import { CreateExpenseDto, UpdateExpenseDto } from "../../../types/expenses";

export const useExpenses = (status?: string) => {
  return useQuery({
    queryKey: ["expenses", status],
    queryFn: () => ExpenseService.getExpenses(status),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseDto) => ExpenseService.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseDto }) =>
      ExpenseService.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ExpenseService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};
