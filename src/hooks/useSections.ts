import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getSectionsByCourse,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  addItemsToSection,
  removeItemFromSection,
  CreateSectionPayload,
  UpdateSectionPayload,
  SectionItemPayload,
} from '../services/SectionServices';
import ErrorService from '../utils/ErrorService';

import { useLanguage } from '../contexts/LanguageContext';

export const useSectionsByCourse = (courseId: string) => {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ['sections', courseId, language],
    queryFn: () => getSectionsByCourse(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSectionById = (id: string) => {
  return useQuery({
    queryKey: ['section', id],
    queryFn: () => getSectionById(id),
    enabled: !!id,
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSectionPayload) => createSection(data),
    onSuccess: (_, variables) => {
      ErrorService.success('Section created successfully');
      queryClient.invalidateQueries({ queryKey: ['sections', variables.course_id] });
      queryClient.invalidateQueries({ queryKey: ['courses', variables.course_id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
    onError: (error: any) => {
      ErrorService.error(
        error?.response?.data?.message || 'Failed to create section'
      );
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSectionPayload; courseId?: string }) =>
      updateSection(id, data),
    onSuccess: (_, variables) => {
      ErrorService.success('Section updated successfully');
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ['sections', variables.courseId] });
        queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId] });
      }
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error: any) => {
      ErrorService.error(
        error?.response?.data?.message || 'Failed to update section'
      );
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; courseId?: string }) => deleteSection(id),
    onSuccess: (_, variables) => {
      ErrorService.success('Section deleted successfully');
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ['sections', variables.courseId] });
        queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId] });
      }
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['lectures'] });
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
    },
    onError: (error: any) => {
      ErrorService.error(
        error?.response?.data?.message || 'Failed to delete section'
      );
    },
  });
};

export const useAddItemsToSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, items, courseId }: { sectionId: string; items: SectionItemPayload[]; courseId?: string }) =>
      addItemsToSection(sectionId, items, courseId),
    onSuccess: (_, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ['sections', variables.courseId] });
        queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId] });
      }
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error: any) => {
      ErrorService.error(
        error?.response?.data?.message || 'Failed to add item to section'
      );
    },
  });
};

export const useRemoveItemFromSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, itemId }: { sectionId: string; itemId: string; courseId?: string }) =>
      removeItemFromSection(sectionId, itemId),
    onSuccess: (_, variables) => {
      ErrorService.success('Item removed from section');
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ['sections', variables.courseId] });
        queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId] });
      }
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error: any) => {
      ErrorService.error(
        error?.response?.data?.message || 'Failed to remove item from section'
      );
    },
  });
};
