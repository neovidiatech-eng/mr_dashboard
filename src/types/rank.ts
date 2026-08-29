export interface AgeRange {
  maxAge: number;
  minAge: number;
}

export interface Stage {
  id: string;
  slug: string;
  rankId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface RankItem {
  id: string;
  name_ar?: string;
  name_en?: string;
  name?: string;
  slug?: string;
  color: string;
  ageRange: AgeRange;
  stageName_ar?: string | null;
  stageName_en?: string | null;
  stageName?: string | null;
  stages?: Stage[];
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
  name_ar: string;
  name_en?: string;
  color: string;
  icon?: File;
}

export interface UpdateRankBody {
  name_ar?: string;
  name_en?: string;
  color?: string;
  icon?: File;
}