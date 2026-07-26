import { useMutation, useQuery } from "@tanstack/react-query";
import { createCourse, deleteCourse, getAllCourses, getCourseById, updateCourse } from "../services/CoursesServices";
import ErrorService from "../utils/ErrorService";
import { Course } from "../types/courses";

export const useCourses = (page: number = 1, limit: number = 10, rankId?: string) => {
    return useQuery({
        queryKey: ["courses", page, limit, rankId],
        queryFn: () => getAllCourses(page, limit, rankId),
    });
}

export const useCourseById = (id: string) => {
    return useQuery({
        queryKey: ["courses", id],
        queryFn: () => getCourseById(id),
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
