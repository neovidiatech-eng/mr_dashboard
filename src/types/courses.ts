import { Lecture } from "./lectures";

export interface AgeRange {
  maxAge: number;
  minAge: number;
}

export interface Rank {
  name: string;
  slug: string;
  color: string;
  ageRange: AgeRange;
  courses : Courses[];
}

export interface Courses{
  id: string,
  name: string,
}

export interface Course {
  id: string;
  title: string;
  description: string;
  rankId: string;
  image:string;
  createdAt: string;
  updatedAt: string;
  rank: Rank;
  lectures: Lecture[];
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
