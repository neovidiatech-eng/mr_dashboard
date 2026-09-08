import api from "../lib/axios";
import {CreateLiveSession,} from "../types/liveSessions";

export const createLiveSession = async(data:CreateLiveSession) =>{
    const response = await api.post('livesessions',data)
    return response.data
}

export const getAllLiveSessions = async (page: number = 1, limit: number = 10, search?: string) => {
    const params: Record<string, any> = { page, limit };
    if (search) params.search = search;
    const response = await api.get('livesessions', { params });
    return response.data;
}

export const getLiveSession = async (id:string)=>{
    const response =await api.get(`livesessions/${id}`)
    return response.data

}

 export const deleteLiveSession  = async (id:string)=>{
    const response = await api.delete(`livesessions/${id}`)
    return response.data

 }

 