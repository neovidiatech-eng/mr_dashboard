import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ExamServices from "../services/ExamServices";
import type { CreateExamPayload, CreateQuestionPayload, SubmitExamPayload } from "../types/exam";

export const useExams = (params?: { studentId?: string; teacherId?: string; status?: string }) => {
  return useQuery({
    queryKey: ["exams", params],
    queryFn: () => ExamServices.getExams(params),
  });
};

export const useMyExams = () => {
  return useQuery({
    queryKey: ["my-exams"],
    queryFn: () => ExamServices.getMyExams(),
  });
};

export const useExamById = (id: string) => {
  return useQuery({
    queryKey: ["exams", "one", id],
    queryFn: () => ExamServices.getExamById(id),
    enabled: !!id,
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamPayload) => ExamServices.createExam(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExamPayload> }) =>
      ExamServices.updateExam(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ExamServices.deleteExam(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });
};

export const useExamQuestions = (examId: string) => {
  return useQuery({
    queryKey: ["exam-questions", examId],
    queryFn: () => ExamServices.getExamQuestions(examId),
    enabled: !!examId,
  });
};

export const useAddExamQuestion = (examId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuestionPayload) => ExamServices.addExamQuestion(examId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exam-questions", examId] }),
  });
};

export const useUpdateExamQuestion = (examId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: string; data: Partial<CreateQuestionPayload> }) =>
      ExamServices.updateExamQuestion(questionId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exam-questions", examId] }),
  });
};

export const useDeleteExamQuestion = (examId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => ExamServices.deleteExamQuestion(questionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exam-questions", examId] }),
  });
};

export const useStartExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (examId: string) => ExamServices.startExam(examId),
    onSuccess: (_data, examId) => {
      queryClient.invalidateQueries({ queryKey: ["exams", "one", examId] });
      queryClient.invalidateQueries({ queryKey: ["my-exams"] });
    },
  });
};

export const useSubmitExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, data }: { examId: string; data: SubmitExamPayload }) =>
      ExamServices.submitExam(examId, data),
    onSuccess: (_data, { examId }) => {
      queryClient.invalidateQueries({ queryKey: ["exams", "one", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam-questions", examId] });
      queryClient.invalidateQueries({ queryKey: ["my-exams"] });
    },
  });
};
