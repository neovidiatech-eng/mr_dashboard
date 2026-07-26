import { Course } from "./courses";

export type ScheduleType = 'full' | 'half';

export interface CreateSchedulePayload {
    studentId: string;
    teacherId: string;
    courseId: string;
    title: string;
    description: string;
    link: string;
    notes: string;
    start_time: string;
    type: ScheduleType;
    notification_Time: string;
    platform: string;
    language: string;
    videoUrl?: string;
    slidesUrl?: string;
}

export interface UpdateSchedulePayload {
    title: string;
    description: string;
    link: string;
    notes: string;
    status: string;
    start_time: string;
    type: ScheduleType;
    notification_Time: string;
}
export type DayOfWeek =
    | 'Saturday'
    | 'Sunday'
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday';

export interface CreateRecurringSchedulePayload {
    studentId: string;
    teacherId: string;
    courseId: string;
    description: string;
    link: string;
    notes: string;
    startTime: string;
    days: DayOfWeek[];
    startDate: string;
    endDate: string;
    notification_Time: string;
    language: string;
}

// Aliases for Services
export type CreateSessionBody = CreateSchedulePayload;
export type CreateRecurringSessionBody = CreateRecurringSchedulePayload;
export type UpdateSessionBody = UpdateSchedulePayload;

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    code_country: string;
}

export interface Student {
    id: string;
    user_id: string;
    birth_date: string;
    gender: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    sessions: number;
    sessions_attended: number;
    sessions_remaining: number;
    planId: string | null;
    country: string;
    status: string;
    user: User;
}

export interface Teacher {
    id: string;
    user_id: string;
    currencyId: string;
    hour_price: number;
    gender: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    roleId: string | null;
    user: User;
}

export interface ScheduleSubject {
    id: string;
    name:string;
    active: boolean;
    color: string;
    createdAt: string;
    updatedAt: string;
}

export interface ScheduleLogs {
    id: string;
    scheduleId: string;
    joinTime_student: string | null;
    leaveTime_student: string | null;
    joinTime_teacher: string | null;
    leaveTime_teacher: string | null;
    duration_student: number | null;
    duration_teacher: number | null;
    isTeacherLate: boolean;
    isTeacherCompleted: boolean;
    isStudentAttended: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Schedule {
    id: string;
    teacherId: string;
    studentId: string;
    subjectId: string;
    status: string;
    title: string;
    description: string;
    type: string;
    start_time: string;
    end_time: string;
    link: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    is_recurring: boolean;
    day_of_week: string | null;
    parent_recurring_id: string | null;
    order?: number;
    language?: string;
    videoUrl?: string;
    slidesUrl?: string;
    notification_Time?: string;
    student: Student;
    teacher: Teacher;
    subject?: ScheduleSubject;
    scheduleLogs?: ScheduleLogs;
      course: Course;

}

export interface Pagination {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
}

export interface SessionsPagination {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
}

export interface GetSessionsResponse {
    message: string;
    status: number;
    data: {
        schedule: {
            upcomingSchedule: Schedule[];
            toDaySchedule: Schedule[];
            previousSchedule: Schedule[];
        };
        pagination: SessionsPagination;
    };
}

export interface GetUserSchedulesResponse {
    message: string;
    status: number;
    data:  {
            upcomingSchedule: Schedule[];
            toDaySchedule: Schedule[];
            previousSchedule: Schedule[];
        };
}



export interface SendReviewSchedulePayload {
    comment: string;
    rating: number;
    teacherAttended: boolean;
    studentAttended: boolean;
}