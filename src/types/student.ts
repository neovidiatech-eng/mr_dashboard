import { Plan } from "./plan";

export type StudentStatus = 'pending' | 'approved' | 'rejected';


export interface UserDetails {
  id: string;
  email: string;
  name: string;
  username:string;
  phone: string;
  code_country: string;
  status: string;
  confirmAt: string | null;
  createdAt: string;
  updatedAt: string;
  roleId: string;
  provider: string;

  password?: string;
  googleId?: string | null;
  image?: string | null;
  reviewsReceived?: any[];
  role?: {
    name: string;
  };
}

export interface Student {
  id: string;
  user_id: string;
  birth_date: string;
  gender: 'male' | 'female';
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
  rankId?: string | null;
  rank?: any;
  user: UserDetails;
  plan: Plan | null;
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