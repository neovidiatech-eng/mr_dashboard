import api from "../lib/axios";
import {
  Exam,
  ExamQuestion,
  CreateExamPayload,
  CreateQuestionPayload,
  SubmitExamPayload,
} from "../types/exam";

export const getExams = async (params?: { studentId?: string; teacherId?: string; status?: string }) => {
  const response = await api.get("/exams", { params });
  return response.data.data as { items: Exam[]; pagination: any };
};

export const getMyExams = async () => {
  const response = await api.get("/exams/user-exams");
  return response.data.data as Exam[];
};

export const getExamById = async (id: string) => {
  const response = await api.get(`/exams/exam/${id}`);
  return response.data.data as Exam;
};

export const createExam = async (data: CreateExamPayload) => {
  const response = await api.post("/exams", data);
  return response.data.data as Exam;
};

export const updateExam = async (id: string, data: Partial<CreateExamPayload>) => {
  const response = await api.patch(`/exams/${id}`, data);
  return response.data.data as Exam;
};

export const deleteExam = async (id: string) => {
  await api.delete(`/exams/${id}`);
};

export const getExamQuestions = async (examId: string) => {
  const response = await api.get(`/exams/${examId}/questions`);
  return response.data.data as ExamQuestion[];
};

export const addExamQuestion = async (examId: string, data: CreateQuestionPayload) => {
  const response = await api.post(`/exams/${examId}/questions`, data);
  return response.data.data as ExamQuestion;
};

export const updateExamQuestion = async (questionId: string, data: Partial<CreateQuestionPayload>) => {
  const response = await api.patch(`/exams/questions/${questionId}`, data);
  return response.data.data as ExamQuestion;
};

export const deleteExamQuestion = async (questionId: string) => {
  await api.delete(`/exams/questions/${questionId}`);
};

export const startExam = async (examId: string) => {
  const response = await api.post(`/exams/${examId}/start`);
  return response.data.data as Exam;
};

export const submitExam = async (examId: string, data: SubmitExamPayload) => {
  const response = await api.post(`/exams/${examId}/submit`, data);
  return response.data.data as Exam;
};
