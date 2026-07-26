import { Pagination } from "./courses";

export interface Lecture {
  id: string;
  title: string;
  content: string;
  videoUrl: string;
  slidesUrl?: string;
  pdfUrl?: string;
  order: number;
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
