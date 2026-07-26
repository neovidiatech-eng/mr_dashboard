import api from "../../../lib/axios";
import { CreateRankBody, RankItem, RankResponse, SingleRankResponse, UpdateRankBody } from "../../../types/rank";

export const getAllRanks = async (): Promise<RankResponse> => {
    const response = await api.get("/materials/ranks");
    return response.data;
};

export const getRank = async (id: string): Promise<SingleRankResponse> => {
    const response = await api.get(`/materials/ranks/${id}`);
    return response.data;
};

export const createRank = async (rankData: CreateRankBody): Promise<{ message: string; status: number; lang: string; data: RankItem }> => {
    const response = await api.post('/materials/ranks/create', rankData);
    return response.data;
};

export const updateRank = async (id: string, rankData: UpdateRankBody): Promise<{ message: string; status: number; lang: string; data: RankItem }> => {
    const response = await api.patch(`/materials/ranks/${id}`, rankData);
    return response.data;
};

export const deleteRank = async (id: string): Promise<{ message: string; status: number; lang: string }> => {
    const response = await api.delete(`/materials/ranks/${id}`);
    return response.data;
};
