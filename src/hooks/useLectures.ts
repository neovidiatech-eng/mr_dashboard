import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeLecture, createLecture, deleteLecture, getAllLectures, getLectureById, updateLecture } from "../services/LecturesServices";
import ErrorService from "../utils/ErrorService";
import { Lecture } from "../types/lectures";

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLecture,
    onSuccess: () => {
      ErrorService.success("Lecture created successfully");
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
      
  });
};

export const useUpdateLecture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lecture> }) => updateLecture(id, data),
    onSuccess: () => {
      ErrorService.success("Lecture updated successfully");
      queryClient.invalidateQueries({ queryKey: ["lectures"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
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
