import { ScheduleType } from "./scheduales";

export interface DashboardReview {
    id: string;
    scheduleId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment: string;
    role: string;
    isHidden: boolean;
    createdAt: string;
}

export interface DashboardUser {
    name: string;
    email: string;
    phone: string;
    gender: string | null;
    age: number;
    reviewsReceived: DashboardReview[];
}

export interface DashboardPlanCurrency {
    symbol: string;
}

export interface DashboardPlan {
    id: string;
    name: string;
    sessionsCount: number;
    rescheduleCount: number;
    price: string;
    currency: DashboardPlanCurrency;
}

export interface DashboardRankCourse {
    id: string;
    title: string;
    description: string;
    rankId: string;
    image: string;
    createdAt: string;
    updatedAt: string;
}

export interface DashboardRank {
    id: string;
    name: string;
    courses: DashboardRankCourse[];
}

export interface DashboardMetadata {
    id: string;
    birth_date: string;
    country: string;
    sessions: number;
    sessions_attended: number;
    sessions_remaining: number;
    avgRating: number;
    totalReviews: number;
    rank: DashboardRank | null;
    user: DashboardUser;
    plan: DashboardPlan;
    joindate: string;
}

export interface DashboardTeacherUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    image: string | null;
}

export interface DashboardTeacher {
    id: string;
    user: DashboardTeacherUser;
}

export interface DashboardCourse {
    id: string;
    title: string;
}

export interface DashboardNextSchedule {
    id: string;
    title: string;
    description: string;
    notes: string;
    link: string;
    status: string;
    createdAt: string;
    platform: string;
    type: ScheduleType;
    end_time: string;
    start_time: string;
    is_recurring: boolean;
    rescheduledFromId: string | null;
    rescheduledToId: string | null;
    teacher: DashboardTeacher;
    course: DashboardCourse;
}

export interface StudentDashboardData {
    metadata: DashboardMetadata;
    nextSchedule: DashboardNextSchedule | null;
}

export interface StudentDashboardResponse {
    message: string;
    status: number;
    lang: string;
    data: StudentDashboardData;
}
