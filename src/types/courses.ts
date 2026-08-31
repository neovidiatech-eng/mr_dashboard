import { Lecture } from "./lectures";

export interface AgeRange {
  maxAge: number;
  minAge: number;
}

export interface Rank {
  id?: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  slug: string;
  color: string;
  ageRange: AgeRange;
  courses : Courses[];
}

export interface Courses{
  id: string,
  name: string,
}

export interface CourseCategory {
  id: string;
  name_ar: string;
  name_en?: string;
  color: string;
}

export interface SectionItem {
  id: string;
  order: number;
  section_id: string;
  item_id: string;
  item_type: 'LECTURE' | 'QUIZ' | string;
  createdAt?: string;
  updatedAt?: string;
  details?: any;
}

export interface Section {
  id: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  course_id?: string;
  createdAt?: string;
  updatedAt?: string;
  section_items?: SectionItem[];
  sectionItems?: SectionItem[];
}

export interface Course {
  id: string;
  title: string;
  title_ar?: string;
  title_en?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  rankId: string;
  categoryId?: string | null;
  category?: CourseCategory | null;
  price?: number | null;
  keywords?: string[] | string | null;
  image: string;
  createdAt: string;
  updatedAt: string;
  rank: Rank;
  lectures: Lecture[];
  sections?: Section[];
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface CoursesData {
  items: Course[];
  pagination: Pagination;
}

export interface CoursesResponse {
  message: string;
  status: number;
  lang: string;
  data: CoursesData;
}

export interface CourseResponse {
  message: string;
  status: number;
  data: Course;
}
