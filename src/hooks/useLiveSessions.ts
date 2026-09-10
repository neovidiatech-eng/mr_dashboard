import { useMutation} from "@tanstack/react-query";
import { CreateLiveSession } from "../types/liveSessions";
import { createLiveSession } from "../services/LiveSessionsService";
import ErrorService from "../utils/ErrorService";   

export const useCreateLiveSessions=()=>{
    return useMutation({
        mutationFn:(data:CreateLiveSession)=>createLiveSession(data),
        onSuccess:()=>{
            ErrorService.success("Live session created successfully");
        },
        onError:()=>{
            ErrorService.error("Failed to create live session");
        }
    })
}
