export interface SupportCategory {
    id: string;
    title: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SupportItem {
    id: string;
    title: string;
    url: string;
    description: string;
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
    title: string;
    url: string;
    description: string;
    categoryId: string;
}

export interface UpdateSupportItemInput {
    title?: string;
    url?: string;
    description?: string;
    categoryId?: string;
    active?: boolean;
}

export interface CreateSupportCategoryInput {
    title: string;
}

export interface UpdateSupportCategoryInput {
    title?: string;
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
