export interface ProfileUser {
  id: string;
  email: string;
  name: string;
  username?: string;
  phone: string;
  provider: string;
  googleId: string | null;
  createdAt: string;
  code_country: string;
  status: string;
  gender: string | null;
  age: number | null;
}

export interface ProfilePlanCurrency {
  id: string;
  name_en: string;
  symbol: string;
}

export interface ProfilePlan {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: number;
  features: string[];
  sessionsCount: number;
  rescheduleCount: number;
  currency: ProfilePlanCurrency;
}

export interface ProfileRank {
  id: string;
  name: string;
  slug: string;
  color: string;
  ageRange: {
    maxAge: number;
    minAge: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProfileScheduleTeacherUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string | null;
}

export interface ProfileScheduleTeacher {
  user: ProfileScheduleTeacherUser;
}

export interface ProfileScheduleSubject {
  id: string;
  name: string;
}

export interface ProfileSchedule {
  id: string;
  teacherId: string;
  studentId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  description: string;
  link: string;
  title: string;
  platform: string;
  type: string;
  end_time: string;
  start_time: string;
  day_of_week: string | null;
  is_recurring: boolean;
  parent_recurring_id: string | null;
  subjectId: string;
  rescheduledFromId: string | null;
  rescheduledToId: string | null;
  teacher: ProfileScheduleTeacher;
  subject: ProfileScheduleSubject;
}

export interface ProfileData {
  id: string;
  user_id: string;
  birth_date: string;
  active: boolean;
  planId: string;
  country: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sessions: number;
  sessions_attended: number;
  sessions_remaining: number;
  avgRating: number;
  totalReviews: number;
  rankId: string | null;
  user: ProfileUser;
  schedules: ProfileSchedule[];
  plan: ProfilePlan;
  rank: ProfileRank | null;
}

export interface StudentProfileResponse {
  message: string;
  status: number;
  lang: string;
  data: ProfileData;
}

export interface UpdateProfile {
  name?: string;
  username?: string;
  password?: string;
  phone?: string;
  phone_code?: string;
  country?: string;
  age?: number;
  birth_date?: string;
  gender?: string;
  timezone?: string;
}

export interface TeacherCurrency {
  id: string;
  name_en: string;
  name_ar: string;
  symbol: string;
  code: string;
  default: boolean;
  createdAt: string;
  updatedAt: string;
  exchangeRate: number;
}

export interface TeacherWallet {
  id: string;
  type: string;
  ownerId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  currencyId: string;
  userId: string;
  transactions: any[];
  currency: TeacherCurrency;
}

export interface TeacherProfileInfo {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  hourPrice: number;
  status: string;
  active: boolean;
  wallet: TeacherWallet[];
}

export interface TeacherStats {
  totalStudents: number;
  totalSessions: number;
}

export interface TeacherSchedule {
  title: string;
  description: string;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  link: string;
  notes: string;
  subject: {
    color: string;
  };
  student: {
    name: string;
    email: string;
    country: string;
    status: string;
    sessions: {
      total: number;
      attended: number;
      remaining: number;
    };
  };
}

export interface TeacherStudent {
  id: string;
  user_id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  subject: {
    code: string;
  };
  sessions: string;
}

export interface TeacherStudentsResponse {
  message: string;
  status: number;
  lang: string;
  data: TeacherStudent[];
}


export interface TeacherProfileData {
  teacher: TeacherProfileInfo;
  stats: TeacherStats;
  schedules: TeacherSchedule[];
  students: TeacherStudent[];
}

export interface TeacherProfileResponse {
  message: string;
  status: number;
  lang: string;
  data: TeacherProfileData;
}
