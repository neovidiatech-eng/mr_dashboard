import api from "../lib/axios";
import { CreateQuizPayload, Quiz, QuizPayload, QuizQuestion } from "../types/quiz";

export const getAllQuizzes = async (): Promise<Quiz[]> => {
  const response = await api.get("/quiz");
  return response.data.data;
};

export const getQuizzes = async (params?: { page?: number; limit?: number }) => {
  const response = await api.get("/quiz", { params });
  return response.data.data as { items: Quiz[]; pagination: any };
};

export const getQuizById = async (id: string): Promise<Quiz | null> => {
  try {
    const response = await api.get(`/quiz/${id}`);
    const resData = response.data;
    if (resData && typeof resData === 'object') {
      return resData.data || resData;
    }
    return resData;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return null;
    }
    throw err;
  }
};

export const getQuizQuestions = async (quizId: string): Promise<QuizQuestion[]> => {
  try {
    const quiz = await getQuizById(quizId);
    return quiz?.questions || (quiz as any)?.quiz_questions || [];
  } catch (err: any) {
    return [];
  }
};

export const createQuiz = async (data: CreateQuizPayload | QuizPayload): Promise<Quiz> => {
  const response = await api.post("/quiz", data);
  return response.data.data;
};

export const updateQuiz = async (id: string, data: Partial<CreateQuizPayload | QuizPayload>): Promise<Quiz> => {
  const response = await api.patch(`/quiz/${id}`, data);
  return response.data.data;
};

export const deleteQuiz = async (id: string): Promise<void> => {
  try {
    await api.delete(`/quiz/${id}`);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return;
    }
    throw err;
  }
};

export const submitQuiz = async (data: any): Promise<any> => {
  const response = await api.post("/quiz/submit", data);
  return response.data.data;
};

export const getQuizHistory = async (params?: { page?: number; limit?: number; quiz_id?: string }): Promise<any> => {
  const response = await api.get("/quiz/history", { params });
  return response.data.data;
};

export const getQuizHistoryById = async (id: string): Promise<any> => {
  const response = await api.get(`/quiz/history/${id}`);
  return response.data.data;
};
