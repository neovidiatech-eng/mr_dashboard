import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as QuizServices from "../services/QuizServices";
import { CreateQuizPayload } from "../types/quiz";

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuizPayload) => QuizServices.createQuiz(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useQuizById = (id: string | null) => {
  return useQuery({
    queryKey: ["quizzes", id],
    queryFn: () => QuizServices.getQuizById(id!),
    enabled: !!id,
  });
};

export const useQuizQuestions = (quizId: string | null) => {
  return useQuery({
    queryKey: ["quiz-questions", quizId],
    queryFn: () => QuizServices.getQuizQuestions(quizId!),
    enabled: !!quizId,
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateQuizPayload> }) =>
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
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};