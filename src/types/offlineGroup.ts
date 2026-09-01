export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface OfflineGroupStage {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  rankId: string;
  rank?: {
    id: string;
    name_ar: string;
    name_en: string;
    slug: string;
    color?: string;
    icon?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OfflineGroupCourseDetails {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  keywords: string[];
  rankId: string;
  stageId: string;
  categoryId: string | null;
  price: number;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfflineGroupCourse {
  id: string;
  groupId: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  course: OfflineGroupCourseDetails;
}

export interface OfflineGroup {
  id: string;
  qrToken: string;
  stageId: string;
  createdAt: string;
  stage: OfflineGroupStage;
  courses: OfflineGroupCourse[];
}

export interface OfflineGroupsResponse {
  message: string;
  status: number;
  data: {
    items: OfflineGroup[];
    pagination: Pagination;
  };
}

export interface OfflineGroupResponse {
  message: string;
  status: number;
  data: OfflineGroup;
}

export interface CreateOfflineGroupPayload {
  stageId: string;
  courseIds: string[];
}

