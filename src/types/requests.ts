import { Schedule } from "./scheduales";

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'canceled';
export type RequestPriority = 'high' | 'medium' | 'low';

export type UnifiedRequestType = 
  | 'vacation' 
  | 'sick_leave' 
  | 'excuse' 
  | 'emergency' 
  | 'resign' 
  | 'technical_issue' 
  | 'reschedule' 
  | 'others';

export interface UnifiedRequest {
    id: string;
    title: string;
    type: UnifiedRequestType;
    status: RequestStatus;
    priority: RequestPriority;
    reason: string;
    attachments: string[] | null;
    adminNotes: string | null;
    createdAt: string;
    updatedAt: string;
    sessionId?: string | null;
    schedule?: Schedule | null;
    // Admin specific fields
    requester?: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    requesterRole?: 'student' | 'teacher' | 'staff';
}

export interface RequestDashboardSummary {
    types: {
        vacation: number;
        sick_leave: number;
        excuse: number;
        emergency: number;
        resign: number;
        [key: string]: number;
    };
    statuses: {
        pending: number;
        approved: number;
        rejected: number;
        total: number;
    };
}

export interface RequestDashboardResponse {
    message: string;
    status: number;
    data: {
        summary: RequestDashboardSummary;
        pending: UnifiedRequest[];
        history: UnifiedRequest[];
    };
}

export interface CreateUnifiedRequestInput {
    type: UnifiedRequestType | string;
    priority: RequestPriority;
    title: string;
    reason: string;
    attachments?: File[];
    sessionId?: string;
}

// Legacy support
export type RequestType = 'new_session' | 'reschedule' | 'cancel' | string;
export interface CreateRequestType {
    sessionId?: string;
    type: string;
    reason: string;
    requestedData?: any;
}

export interface GetRequestsResponse {
    message: string;
    status: number;
    data: UnifiedRequest[] | {
        student_requests: UnifiedRequest[];
        teachers_requests: UnifiedRequest[];
    };
}
