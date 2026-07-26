export interface ContextSession {
  id: string;
  sessionName: string;
  studentName: string;
  teacherName: string;
  subject: string;
  day: string;
  date: string;
  time: string;
  endTime: string;
  meetingLink?: string;
  sessionIndex?: number;
}

export interface SessionDisplay {
  id: string;
  title: string;
  teacher: string;
  subject: string;
  grade: string; 
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface AddSessionInput {
  title: string;
  student: string;
  teacher: string;
  subject: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
}

export interface AddMultipleSessionsInput {
  title: string;
  student: string;
  teacher: string;
  subject: string;
  sessions: Array<{
    day: string;
    date: string;
    time: string;
    endTime: string;
    meetingLink?: string;
  }>;
}

export interface SessionFilters {
  status: string;
  dateFrom: string;
  dateTo: string;
  teacher: string;
  student: string;
  subject: string;
}

export interface SessionGroupDetails {
  id: string;
  sessionName: string;
  student: string;
  teacher: string;
  subject: string;
  monthYear: string;
  duration: number;
  meetingLink: string;
  sessions: Array<{
    day: string;
    date: string;
    time: string;
    endTime: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    meetingLink?: string;
  }>;
  packageInfo: {
    packageName: string;
    totalSessions: number;
    sessionsUsed: number;
    sessionsRemaining: number;
  };
}

export interface SingleSessionInput {
 title: string;
  student: string;
  teacher: string;
  subject: string;
  sessionDate: string; // بدلاً من date
  startTime: string;   // بدلاً من time
  endTime: string;
  meetingLink?: string;
  notes?: string;
}

export interface MultipleSessionsInput {
  title: string;
  student: string;
  teacher: string;
  subject: string;
  sessions: Array<{
    day: string;
    date: string;
    time: string;
    endTime: string;
    meetingLink?: string;
  }>;
}

export interface GetSessionById {
  id: string;
  teacherId: string;
  studentId: string;
  courseId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  notes: string | null;
  description: string;
  videoUrl: string | null;
  slidesUrl: string | null;
  link: string;
  title: string;
  platform: string;
  type: string;
  language: string;
  end_time: string;
  start_time: string;
  day_of_week: string;
  is_recurring: boolean;
  parent_recurring_id: string | null;
  rescheduledFromId: string | null;
  rescheduledToId: string | null;
  lecturesId: string;
  order: number;
  student: {
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
    rankId: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      code_country: string;
    };
  };
  teacher: {
    id: string;
    user_id: string;
    currencyId: string;
    hour_price: number;
    active: boolean;
    roleId: string | null;
    createdAt: string;
    updatedAt: string;
    avgRating: number;
    totalReviews: number;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      code_country: string;
    };
  };
  course: {
    id: string;
    title: string;
    lectures: {
      title: string;
      content: string;
      videoUrl: string;
      pdfUrl: string;
      date: string;
      order: number;
    }[];
  };
  scheduleLogs: any;
}