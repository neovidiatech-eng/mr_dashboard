export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface StageRank {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stage {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  rankId: string;
  rank: StageRank;
}

export interface StagesResponse {
  message: string;
  status: number;
  data: {
    items: Stage[];
    pagination: Pagination;
  };
}
