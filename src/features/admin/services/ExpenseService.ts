import api from "../../../lib/axios";
import { ExpensesResponse, CreateExpenseDto, UpdateExpenseDto } from "../../../types/expenses";

export const ExpenseService = {
  getExpenses: async (status?: string) => {
    const response = await api.get<ExpensesResponse>(
      `/finances/expenses${status && status !== 'all' ? `?status=${status}` : ""}`
    );
    return response.data.data.expenses;
  },

  createExpense: async (data: CreateExpenseDto) => {
    const response = await api.post("/finances/expenses", data);
    return response.data;
  },

  updateExpense: async (id: string, data: UpdateExpenseDto) => {
    const response = await api.patch(`/finances/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id: string) => {
    const response = await api.delete(`/finances/expenses/${id}`);
    return response.data;
  },

  getExpenseById: async (id: string) => {
    const response = await api.get(`/finances/expenses/${id}`);
    return response.data;
  }
};
