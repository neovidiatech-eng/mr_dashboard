export interface LiveSessions{
    id:string;
    planId:string;
    stageId:string;
    userId:string;
    roomName:string;
    startAt:string;
    status:string;
}

export interface CreateLiveSession{
    stageId:string;
    planId:string;
    startAt:string;
}

export interface LiveSessionResponse{
    message:string;
    status:number;
    data:LiveSessions
}