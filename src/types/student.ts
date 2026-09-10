import { Plan } from "./plan";

export type StudentStatus = 'pending' | 'approved' | 'rejected';
export type StudentType = "online" | "onsite";

export interface UserDetails {
  id: string;
  email: string;
  name: string;
  username: string;
  type?: StudentType;
  phone: string;
  code_country: string;
  status: string;
  confirmAt: string | null;
  createdAt: string;
  updatedAt: string;
  roleId: string;
  provider: string;
  parentNumber?: string;
  password?: string;
  googleId?: string | null;
  image?: string | null;
  gender?: string | null;
  age?: number | null;
  timezone?: string | null;
  reviewsReceived?: any[];
  role?: {
    name: string;
  };
}

export interface StudentQuizQuizInfo {
  id: string;
  title_ar: string;
  title_en: string;
  slug?: string;
  total_points: number;
  pass_points: number;
  duration_min?: number;
}

export interface StudentQuizItem {
  id: string;
  student_id: string;
  quiz_id: string;
  score: number;
  total_points: number;
  pass_points: number;
  passed: boolean;
  startedAt?: string | null;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  quiz?: StudentQuizQuizInfo;
}

export interface Student {
  id: string;
  user_id: string;
  birth_date: string | null;
  qrToken: string | null;
  qrActive?: boolean;
  type: StudentType;
  gender?: 'male' | 'female';
  active: boolean;
  createdAt: string;
  updatedAt: string;
  sessions: number;
  sessions_attended: number;
  sessions_remaining: number;
  planId: string | null;
  country: string;
  status: StudentStatus;
  avgRating?: number;
  totalReviews?: number;
  parentNumber?: string | null;
  rankId?: string | null;
  stageId?: string | null;
  offlineGroupId?: string | null;
  rank?: any;
  stage?: any;
  user: UserDetails;
  plan: Plan | null;
  studentQuizzes?: StudentQuizItem[];
}

export type EditStudentForm = {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone_code: string;
  gender: 'male' | 'female';
  birthDate: string;
  planId: string | null;
  country: string;
  status: StudentStatus;
  rankId: string ;
  stageId?: string;
  password?: string;
};


export interface StudentsFetchResponse {
  message: string;
  status: number;
  lang: string; 

  data: {
    studentsData: Student[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
    };
  };
}