import api from "../../../lib/axios";
import { Stage, StagesResponse } from "../../../types/stage";

export interface StageCreate {
    name_ar: string;
    name_en?: string;
    rankId: string;
}
export const getAllStages = async (): Promise<StagesResponse> => {
    const response = await api.get("/materials/stages");
    return response.data;
};

export const addStageById = async (stage: StageCreate): Promise<Stage> => {
    const response = await api.post("/materials/stages/", stage);
    return response.data;
};
export const updateStage = async (id: string, stage: StageCreate): Promise<Stage> => {
    const response = await api.patch(`/materials/stages/${id}`, stage);
    return response.data;
};

export const getStageById = async (id: string): Promise<Stage> => {
    const response = await api.get(`/materials/stages/${id}`);
    return response.data;
};
export const deleteStage = async (id: string): Promise<Stage> => {
    const response = await api.delete(`/materials/stages/${id}`);
    return response.data;
};
