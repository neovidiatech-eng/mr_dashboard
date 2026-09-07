import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as QuizServices from "../services/QuizServices";
import { createSection, addItemsToSection } from "../services/SectionServices";
import { CreateQuizPayload, QuizPayload } from "../types/quiz";
import ErrorService from "../utils/ErrorService";

export interface CreateQuizWithSectionParams {
  data: CreateQuizPayload | QuizPayload;
  targetSectionId?: string;
  courseId?: string;
  order?: number;
}

export interface UpdateQuizParams {
  id: string;
  data: Partial<CreateQuizPayload | QuizPayload>;
  courseId?: string;
}

export const useQuizzes = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["quizzes", params],
    queryFn: () => QuizServices.getQuizzes(params),
  });
};

export const useQuizById = (id: string | null) => {
  return useQuery({
    queryKey: ["quizzes", id],
    queryFn: () => QuizServices.getQuizById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useQuizQuestions = (quizId: string | null) => {
  return useQuery({
    queryKey: ["quiz-questions", quizId],
    queryFn: () => QuizServices.getQuizQuestions(quizId!),
    enabled: !!quizId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      targetSectionId,
      courseId,
      order = 1,
    }: CreateQuizWithSectionParams) => {
      const createdQuiz = await QuizServices.createQuiz(data);
      const createdQuizId = createdQuiz?.id;

      const isValidUUID = (id?: string) =>
        !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      let secId = targetSectionId;
      if ((!secId || !isValidUUID(secId)) && courseId) {
        try {
          const newSec = await createSection({
            course_id: courseId,
            name_ar: "محتوى الكورس",
            name_en: "Course Content",
            items: createdQuizId ? [{ item_id: createdQuizId, item_type: "QUIZ", order }] : [],
          });
          secId = newSec.id;
        } catch (secErr) {
          console.error("Failed to auto-create section for quiz:", secErr);
        }
      }

      if (createdQuizId && secId && isValidUUID(secId)) {
        try {
          await addItemsToSection(secId, [
            { item_id: createdQuizId, item_type: "QUIZ", order },
          ]);
        } catch (err) {
          console.error("Failed to link quiz to section:", err);
        }
      }

      return createdQuiz;
    },
    onSuccess: (_data, variables) => {
      ErrorService.success("تم إنشاء الكويز بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["courses", variables.courseId] });
        queryClient.invalidateQueries({ queryKey: ["sections", variables.courseId] });
      }
    },
    onError: (error: any) => {
      ErrorService.error(
        error?.response?.data?.message || error?.message || "حدث خطأ أثناء إنشاء الكويز"
      );
    },
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateQuizParams) => QuizServices.updateQuiz(id, data),
    onSuccess: (_data, variables) => {
      ErrorService.success("تم تحديث الكويز بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["quizzes", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ["courses", variables.courseId] });
        queryClient.invalidateQueries({ queryKey: ["sections", variables.courseId] });
      }
    },
    onError: (error: any) => {
      ErrorService.error(
        error?.response?.data?.message || error?.message || "حدث خطأ أثناء تحديث الكويز"
      );
    },
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => QuizServices.deleteQuiz(id),
    onSuccess: () => {
      ErrorService.success("تم حذف الكويز بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (error: any) => {
      ErrorService.error(
        error?.response?.data?.message || error?.message || "حدث خطأ أثناء حذف الكويز"
      );
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

export const useQuizHistoryById = (id: string | null) => {
  return useQuery({
    queryKey: ["quiz-history", id],
    queryFn: () => QuizServices.getQuizHistoryById(id!),
    enabled: !!id,
  });
};
