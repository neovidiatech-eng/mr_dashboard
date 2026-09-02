import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeLecture, createLecture, deleteLecture, getAllLectures, getLectureById, updateLecture, updateLectureProgress } from "../services/LecturesServices";
import ErrorService from "../utils/ErrorService";
import { Lecture, UpdateLecture } from "../types/lectures";

export const useLectures = () => {
  return useQuery({
    queryKey: ["lectures"],
    queryFn: () => getAllLectures(),
  });
};

export const useLectureById = (id: string) => {
  return useQuery({
    queryKey: ["lectures", id],
    queryFn: () => getLectureById(id),
  });
};

export const useCreateLecture = () => {
  return useMutation({
    mutationFn: createLecture,
    onSuccess: () => {
      ErrorService.success("Lecture created successfully");
    },
  });
};

export const useUpdateLecture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLecture }) => updateLecture(id, data),
    onSuccess: (_data, variables) => {
      ErrorService.success("Lecture updated successfully");
      queryClient.invalidateQueries({ queryKey: ["lectures", variables.id] });
    },
  });
};

export const useDeleteLecture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLecture,
    onSuccess: () => {
      ErrorService.success("Lecture deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useCompleteLecture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeLecture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-progress"] });
    },
  });
};

export const useUpdateLectureProgress = () => {
  return useMutation({
    mutationFn: ({ id, position, duration }: { id: string; position: number; duration?: number }) =>
      updateLectureProgress(id, position, duration),
  });
};
