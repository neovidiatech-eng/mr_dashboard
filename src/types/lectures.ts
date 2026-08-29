import { Pagination } from "./courses";

export interface Lecture {
  id: string;
  title: string;
  title_ar?: string;
  title_en?: string;
  content: string;
  content_ar?: string;
  content_en?: string;
  // Backend returns these paths
  video_path?: string | null;
  pdf_path?: string | null;
  slides_path?: string | null;
  // Legacy fields (kept for compatibility)
  videoUrl?: string;
  slidesUrl?: string;
  pdfUrl?: string;
  order: number;
  duration?: string | null;
  date?: string | null;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LecturesData {
  items: Lecture[];
  pagination: Pagination;
}

export interface LecturesResponse {
  message: string;
  status: number;
  lang: string;
  data: LecturesData;
}


export interface CreateLecture {
  title_ar: string;
  title_en?: string;
  content_ar?: string;
  content_en?: string;
  order?: number;
  duration?: string;
  date?: string;
  courseId: string;
  video?: File;
  slides?: File;
  pdf?: File;
}