export interface Post {
  id: string;
  slug?: string;
  type: string; // 'blog' | 'news'
  title_ar: string;
  title_en: string;
  excerpt_ar?: string;
  excerpt_en?: string;
  content_ar: string;
  content_en: string;
  coverImage?: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePostInput {
  type: string;
  title_ar: string;
  title_en: string;
  excerpt_ar?: string;
  excerpt_en?: string;
  content_ar: string;
  content_en: string;
  coverImage?: string;
  published?: boolean;
}

export interface UpdatePostInput extends Partial<CreatePostInput> {}

export interface PostsQueryParams {
  type?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface PostsResponse {
  message: string;
  status: number;
  data: {
    items: Post[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
    };
  };
}

export interface SinglePostResponse {
  message: string;
  status: number;
  data: Post;
}