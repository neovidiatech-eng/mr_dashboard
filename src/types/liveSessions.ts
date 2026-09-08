export interface LiveSessions{
    id:string;
    title:string;
    planId:string;
    stageId:string;
    userId:string;
    roomName:string;
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