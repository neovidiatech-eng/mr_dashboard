export interface CoursePurchaseRequestStudent {
  id: string;
  user: {
    name: string;
    email: string;
  };
}

export interface CoursePurchaseRequestCourse {
  id: string;
  title: string;
  price?: number | null;
  image?: string;
}

export interface CoursePurchaseRequest {
  id: string;
  studentId: string;
  courseId: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  student: CoursePurchaseRequestStudent;
  course: CoursePurchaseRequestCourse;
}

export interface CoursePurchaseRequestsResponse {
  message: string;
  status: number;
  data: {
    items: CoursePurchaseRequest[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
    };
  };
}
