import api from "../../../lib/axios"
import { WalletHistoryResponse, WithdrawalApiResponse } from "../../../types/transaction";

export const getTransactions = async (page: number = 1, limit: number = 20) : Promise<WalletHistoryResponse> =>{
    const response = await api.get(`/transactions/?page=${page}&limit=${limit}`);
    return response.data;
}

export const getAllWithdrawals = async () : Promise<WithdrawalApiResponse> =>{
    const response = await api.get("/withdrawals/all");
    return response.data;
}

export const updateWithdrawalStatus = async (id: string, status: 'approve' | 'reject', adminNotes?: string) : Promise<any> =>{
    const response = await api.patch(`/withdrawals/${id}/${status}`, { adminNotes });
    return response.data;
}
