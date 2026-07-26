import api from "../lib/axios";
import { RankResponse } from "../types/rank";

export const getAllRanks = async (): Promise<any> => {
    const response = await api.get("/materials/ranks");
    return response.data.data;
}
