export interface AdminDashboardStats {
  totalStudents: number;
  totalTeachers: number;
  pendingRequests: number;
  todaySessions: number;
}

export interface SessionsPerDay {
  date: string;
  count: number;
}

export interface UpcomingSession {
  id: string;
  title: string;
  time: string;
  // Add other properties if available in the future
}

export interface ActivityFeedItem {
  id: string;
  type: string;
  title: string;
  time: string;
  user: string;
}

export interface ActiveUsers {
  students: number;
  instructors: number;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  sessionsPerDay: SessionsPerDay[];
  upcomingSessions: UpcomingSession[];
  activityFeed: ActivityFeedItem[];
  activeUsers: ActiveUsers;
}

export interface AdminDashboardResponse {
  message: string;
  status: number;
  data: AdminDashboardData;
}
