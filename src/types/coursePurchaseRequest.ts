export interface CoursePurchaseRequestStudent {
  id: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface CoursePurchaseRequestCourse {
  id: string;
  title?: string;
  title_ar?: string;
  price?: number | null;
  image?: string;
}

export interface CoursePurchaseRequest {
  id: string;
  studentId: string;
  courseId: string;
  status: 'pending' | 'approved' | 'rejected';
  receipt_img?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  student: CoursePurchaseRequestStudent;
  course: CoursePurchaseRequestCourse;
}

export interface CoursePurchaseRequestsResponse {
  message: string;
  status: string | number;
  data: {
    items: CoursePurchaseRequest[];
    pagination: {
      currentPage: number;
      page?: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage?: boolean;
    };
  };
}
