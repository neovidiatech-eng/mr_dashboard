export interface SupportCategory {
    id: string;
    title: string;
    title_ar?: string;
    title_en?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SupportItem {
    id: string;
    title: string;
    title_ar?: string;
    title_en?: string;
    url: string;
    description: string;
    description_ar?: string;
    description_en?: string;
    categoryId: string;
    readingCount: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    category?: SupportCategory;
}

export interface SupportCategoryWithItems extends SupportCategory {
    supports: SupportItem[];
}

export interface SupportResponse {
    message: string;
    status: number;
    lang: string;
    data: SupportItem[];
}

export interface SupportCategoriesResponse {
    message: string;
    status: number;
    lang: string;
    data: SupportCategoryWithItems[];
}

export interface CreateSupportItemInput {
    title?: string;
    title_ar: string;
    title_en?: string;
    url: string;
    description?: string;
    description_ar?: string;
    description_en?: string;
    categoryId: string;
}

export interface UpdateSupportItemInput {
    title?: string;
    title_ar?: string;
    title_en?: string;
    url?: string;
    description?: string;
    description_ar?: string;
    description_en?: string;
    categoryId?: string;
    active?: boolean;
}

export interface CreateSupportCategoryInput {
    title?: string;
    title_ar: string;
    title_en?: string;
}

export interface UpdateSupportCategoryInput {
    title?: string;
    title_ar?: string;
    title_en?: string;
    active?: boolean;
}

export interface PopularSupportCategory {
    _count: {
        id: number;
        active: number;
    };
    _sum: {
        readingCount: number | null;
    };
    categoryId: string;
    popular: SupportItem[];
    category: SupportCategory;
}

export interface PopularSupportResponse {
    message: string;
    status: number;
    data: PopularSupportCategory[];
}
