export interface Category {
    id: string;
    name_en?: string;
    name_ar: string;
    active: boolean;
    color: string;
    createdAt: string;
    updatedAt: string;
}

export interface CategoriesData {
    count: number;
    activeCount: number;
    categories: Category[];
}

export interface CategoriesResponse {
    message: string;
    status: number;
    data: CategoriesData;
}
