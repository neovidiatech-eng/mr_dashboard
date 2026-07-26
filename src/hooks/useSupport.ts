import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as SupportServices from "../services/SupportServices";
import { 
    CreateSupportCategoryInput, 
    CreateSupportItemInput, 
    UpdateSupportCategoryInput, 
    UpdateSupportItemInput 
} from "../types/support";
import ErrorService from "../utils/ErrorService";

export const useSupport = () => {
    const queryClient = useQueryClient();

    // Queries
    const supportsQuery = useQuery({
        queryKey: ['supports'],
        queryFn: SupportServices.getSupport
    });

    const supportCategoriesQuery = useQuery({
        queryKey: ['support-categories'],
        queryFn: SupportServices.getSupportCategories
    });

    const teacherSupportQuery = useQuery({
        queryKey: ['teacher-supports'],
        queryFn: SupportServices.getSupportForTeacher
    });

    // Support Item Mutations
    const createSupportMutation = useMutation({
        mutationFn: (data: CreateSupportItemInput) => SupportServices.createSupport(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supports'] });
            queryClient.invalidateQueries({ queryKey: ['support-categories'] });
            ErrorService.success("Support resource created successfully");
        },
        onError: (error) => ErrorService.handleError(error)
    });

    const updateSupportMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: UpdateSupportItemInput }) => 
            SupportServices.updateSupport(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supports'] });
            queryClient.invalidateQueries({ queryKey: ['support-categories'] });
            ErrorService.success("Support resource updated successfully");
        },
        onError: (error) => ErrorService.handleError(error)
    });

    const deleteSupportMutation = useMutation({
        mutationFn: (id: string) => SupportServices.deleteSupport(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supports'] });
            queryClient.invalidateQueries({ queryKey: ['support-categories'] });
            ErrorService.success("Support resource deleted successfully");
        },
        onError: (error) => ErrorService.handleError(error)
    });

    // Support Category Mutations
    const createCategoryMutation = useMutation({
        mutationFn: (data: CreateSupportCategoryInput) => SupportServices.createSupportCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-categories'] });
            ErrorService.success("Category created successfully");
        },
        onError: (error) => ErrorService.handleError(error)
    });

    const updateCategoryMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: UpdateSupportCategoryInput }) => 
            SupportServices.updateSupportCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-categories'] });
            ErrorService.success("Category updated successfully");
        },
        onError: (error) => ErrorService.handleError(error)
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: (id: string) => SupportServices.deleteSupportCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-categories'] });
            ErrorService.success("Category deleted successfully");
        },
        onError: (error) => ErrorService.handleError(error)
    });

    return {
        // Data
        supports: supportsQuery.data?.data || [],
        categories: supportCategoriesQuery.data?.data || [],
        teacherSupports: teacherSupportQuery.data?.data || [],
        
        // Loading States
        isLoadingSupports: supportsQuery.isLoading,
        isLoadingCategories: supportCategoriesQuery.isLoading,
        isLoadingTeacherSupports: teacherSupportQuery.isLoading,

        // Mutations
        createSupport: createSupportMutation.mutateAsync,
        updateSupport: updateSupportMutation.mutateAsync,
        deleteSupport: deleteSupportMutation.mutateAsync,
        
        createCategory: createCategoryMutation.mutateAsync,
        updateCategory: updateCategoryMutation.mutateAsync,
        deleteCategory: deleteCategoryMutation.mutateAsync,

        // Expose queries if needed
        supportsQuery,
        supportCategoriesQuery,
        teacherSupportQuery
    };
};
