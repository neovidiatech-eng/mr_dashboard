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
    const formData = new FormData();
    formData.append('name_ar', rankData.name_ar);
    if (rankData.name_en) formData.append('name_en', rankData.name_en);
    formData.append('color', rankData.color);
    if (rankData.icon) formData.append('icon', rankData.icon);
    const response = await api.post('/materials/ranks/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const updateRank = async (id: string, rankData: UpdateRankBody): Promise<{ message: string; status: number; lang: string; data: RankItem }> => {
    const formData = new FormData();
    if (rankData.name_ar !== undefined) formData.append('name_ar', rankData.name_ar);
    if (rankData.name_en !== undefined) formData.append('name_en', rankData.name_en);
    if (rankData.color !== undefined) formData.append('color', rankData.color);
    if (rankData.icon) formData.append('icon', rankData.icon);
    const response = await api.patch(`/materials/ranks/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteRank = async (id: string): Promise<{ message: string; status: number; lang: string }> => {
    const response = await api.delete(`/materials/ranks/${id}`);
    return response.data;
};
