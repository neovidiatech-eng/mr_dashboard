
export interface TeacherReport {
  id: string;
  teacherId: string;
  weekStarting: string;
  weekEnding: string;
  totalClasses: number;
  studentsTaught: number;
  avgSessionDuration: number;
  materialsUploaded: number;
  teachingSummary: string;
  studentProgress: string;
  challenges: string;
  overallRating: number;
  createdAt: string;
  updatedAt: string;
  teacher?: {
    id: string;
    user_id: string;
    user: {
      name: string;
      email: string;
    }
  }
}

export interface CreateTeacherReport {
  weekStarting: string;
  weekEnding: string;
  totalClasses: number;
  studentsTaught: number;
  avgSessionDuration: number;
  materialsUploaded: number;
  teachingSummary: string;
  studentProgress: string;
  challenges: string;
  overallRating: number;
}



export interface Insights {
  message: string;
  status: number;
  lang: string;
  data: {
    totalClasses: number;
    studentsTaught: number;
    avgSessionDuration: number;
    materialsUploaded: number;
  };
}
export interface TeacherReportResponse {
  message: string;
  status: number;
  lang: string;
  data: TeacherReport;
}

export interface TeacherReportsResponse {
  message: string;
  status: number;
  lang: string;
  data: TeacherReport[] | {
    items: TeacherReport[];
    pagination?: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
    }
  };
}

