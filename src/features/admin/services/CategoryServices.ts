import api from "../../../lib/axios";
import { Category, CategoriesData } from "../../../types/category";

export const getCategories = async (): Promise<CategoriesData> => {
    const response = await api.get("/materials/categories");
    return response.data.data;
};

export const searchCategory = async (search: string): Promise<CategoriesData> => {
    try {
        const response = await api.get(`/materials/categories?search=${search}`);
        return response.data.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return {
                categories: [],
                count: 0,
                activeCount: 0
            };
        }
        throw error;
    }
}

export const addCategory = async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post("/materials/categories", data);
    return response.data;
};

export const updateCategory = async (id: string, data: Partial<Category>) => {
    const response = await api.patch(`/materials/categories/${id}`, data);
    return response.data;
};

export const deleteCategory = async (id: string) => {
    const response = await api.delete(`/materials/categories/${id}`);
    return response.data;
};
