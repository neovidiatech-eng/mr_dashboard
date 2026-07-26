import api from "../../../lib/axios";

export const getTeacherWithdrawals = async () => {
    const response = await api.get("/withdrawals/");
    return response.data;
};

export const createTeacherWithdrawal = async (amount: number) => {
    const response = await api.post("/withdrawals/request", { amount });
    return response.data;
};