import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as QuizServices from "../services/QuizServices";
import { QuizPayload } from "../services/QuizServices";

export const useQuizzes = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["quizzes", params],
    queryFn: () => QuizServices.getQuizzes(params),
  });
};

export const useQuizById = (id: string) => {
  return useQuery({
    queryKey: ["quizzes", id],
    queryFn: () => QuizServices.getQuizById(id),
    enabled: !!id,
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: QuizPayload) => QuizServices.createQuiz(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QuizPayload> }) =>
      QuizServices.updateQuiz(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["quizzes", id] });
    },
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => QuizServices.deleteQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { quiz_id: string; answers: { question_id: string; option_id: string | null }[] }) =>
      QuizServices.submitQuiz(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-history"] });
    },
  });
};

export const useQuizHistory = (params?: { page?: number; limit?: number; quiz_id?: string }) => {
  return useQuery({
    queryKey: ["quiz-history", params],
    queryFn: () => QuizServices.getQuizHistory(params),
  });
};
