import { Stage } from "../types/stage";
import { Plan } from "../types/plan";

export type LiveSessionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface LiveSessions {
    id: string;
    title: string;
    plan: Plan;
    stage:Stage;
    userId:string;
    roomName:string;
    startAt:string;
    status: LiveSessionStatus;
    token?: string;
}
export interface UpdateLiveSession{
    title:string;
    stageId:string;
    planId:string;
    startAt:string;
    status:string;
}

export interface CreateLiveSession{
    title:string;
    stageId:string;
    planId:string;
    startAt:string;
}

export interface LiveSessionResponse{
    message:string;
    status:number;
    data:LiveSessions
}

export interface StudentUpcomingLiveSession {
    id: string;
    title: string;
    roomName: string;
    startAt: string;
    status: LiveSessionStatus;
    stage?: Stage;
    plan?: Plan;
}

export interface StudentUpcomingLiveSessionsPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface StudentUpcomingLiveSessionsData {
    items: StudentUpcomingLiveSession[];
    pagination: StudentUpcomingLiveSessionsPagination;
}

export interface StudentUpcomingLiveSessionsResponse {
    message: string;
    data: StudentUpcomingLiveSessionsData;
}

export interface StudentNextLiveSessionResponse {
    message: string;
    data: StudentUpcomingLiveSession | null;
}