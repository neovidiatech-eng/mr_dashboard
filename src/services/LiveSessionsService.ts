import api from "../lib/axios";
import {CreateLiveSession} from "../types/liveSessions";

export const createLiveSession = async(data:CreateLiveSession) =>{
    const response = await api.post('livesessions',data)
    return response.data
}