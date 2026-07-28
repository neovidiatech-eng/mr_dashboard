import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addCategory, deleteCategory, getCategories, searchCategory, updateCategory } from "../services/CategoryServices"
import { Category } from "../../../types/category";

export const useCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: () => getCategories(),
    });
};

export const useSearchCategory = (search: string) => {
    return useQuery({
        queryKey: ["categories", search],
        queryFn: () => searchCategory(search),
    });
};

export const useAddCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Category> }) => updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
};
