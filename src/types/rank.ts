export interface AgeRange {
  maxAge: number;
  minAge: number;
}

export interface RankItem {
  id: string;
  name: string;
  slug: string;
  color: string;
  ageRange: AgeRange;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface RankResponse {
  message: string;
  status: number;
  lang: string;
  data: {
    items: RankItem[];
    pagination: Pagination;
  };
}

export interface SingleRankResponse {
  message: string;
  status: number;
  lang: string;
  data: RankItem;
}

export interface CreateRankBody {
  name: string;
  color: string;
  ageRange: AgeRange;
}

export interface UpdateRankBody {
  name?: string;
  color?: string;
  ageRange?: AgeRange;
}