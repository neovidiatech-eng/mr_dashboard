export interface ReviewUser {
  id: string;
  name: string;
}

export interface ReviewSchedule {
  id: string;
  title: string;
  start_time: string;
}

export interface Review {
  id: string;
  scheduleId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string | null;
  role: 'student' | 'teacher';
  isHidden: boolean;
  createdAt: string;
  reviewer: ReviewUser;
  reviewee: ReviewUser;
  schedule: ReviewSchedule;
}

export interface ReviewsResponse {
  message: string;
  status: number;
  data: {
    items: Review[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
    };
  };
}
