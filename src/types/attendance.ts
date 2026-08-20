export type AttendanceStatus = "present" | "late" | "absent";

// Nested types inside student

export interface AttendanceUserDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface AgeRange {
  minAge: number;
  maxAge: number;
}

export interface AttendanceRank {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  color: string;
  ageRange: AgeRange;
  stageName_ar: string;
  stageName_en: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStudent {
  id: string;
  user_id: string;
  birth_date: string | null;
  qrToken: string | null;
  qrActive: boolean;
  type: "online" | "onsite";
  active: boolean;
  planId: string | null;
  country: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  sessions: number;
  sessions_attended: number;
  sessions_remaining: number;
  avgRating: number;
  totalReviews: number;
  rankId: string | null;
  user: AttendanceUserDetails;
  rank: AttendanceRank | null;
}

// Main attendance item

export interface AttendanceItem {
  id: string;
  studentId: string;
  attendanceDate: string;
  checkedInAt: string | null;
  status: AttendanceStatus;
  checkedInBy: string | null;
  student: AttendanceStudent;
}

// API Response 

export interface AttendanceListResponse {
  message: string;
  status: number;
  data: {
    items: AttendanceItem[];
    pagination?: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
    };
  };
}


//Today's stats
export interface AttendanceStats {
  present: number;
  late: number;
  absent: number;
}


//Today's data
export interface TodayData {
  date: string;
  totalOnsiteStudents: number;
  checkedInToday: number;
  remainingToScan: number;
  stats: AttendanceStats
}


// Today's API response
export interface TodayAttendanceResponse {
  message: string;
  status: number;
  data: TodayData;
}

export interface StudentAttendance {
  id: string;
  studentId: string;
  attendanceDate: string;
  checkedInAt: string;
  status: string;
  checkedInBy: string;
}

// Update Attendance Types
export interface UpdateAttendancePayload {
  status: AttendanceStatus;
 
}

export interface UpdatedAttendanceRecord {
  id: string;
  studentId: string;
  attendanceDate: string;
  checkedInAt: string | null;
  status: AttendanceStatus;
  checkedInById?: string | null;
}

export interface UpdateAttendanceResponse {
  message: string;
  status: number;
  data: UpdatedAttendanceRecord;
}