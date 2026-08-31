import { useMutation, useQuery } from "@tanstack/react-query";
import { createCourse, deleteCourse, getAllCourses, getCourseById, updateCourse } from "../services/CoursesServices";
import ErrorService from "../utils/ErrorService";
import { Course } from "../types/courses";

import { useLanguage } from "../contexts/LanguageContext";

export const useCourses = (page: number = 1, limit: number = 10, rankId?: string, search?: string) => {
    const { language } = useLanguage();
    return useQuery({
        queryKey: ["courses", page, limit, rankId, search, language],
        queryFn: () => getAllCourses(page, limit, rankId, search),
    });
}

export const useCourseById = (id: string) => {
    const { language } = useLanguage();
    return useQuery({
        queryKey: ["courses", id, language],
        queryFn: () => getCourseById(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    });
}

export const useCreateCourse = () => {
    return useMutation({
        mutationFn: createCourse,
        onSuccess: () => {
            ErrorService.success("Course created successfully");
        },
        onError: () => {
            ErrorService.error("Failed to create course");
        },
    });
}

export const useUpdateCourse = () => {
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: FormData | Course }) => updateCourse(id, data),
        onSuccess: () => {
            ErrorService.success("Course updated successfully");
        },
        onError: () => {
            ErrorService.error("Failed to update course");
        },
    });
}

export const useDeleteCourse = () => {
    return useMutation({
        mutationFn: (id: string) => deleteCourse(id),
        onSuccess: () => {
            ErrorService.success("Course deleted successfully");
        },
        onError: () => {
            ErrorService.success("Failed to delete course");
        },
    });
}
