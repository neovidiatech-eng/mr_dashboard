import api from "../lib/axios";
import { CreateQuizPayload, Quiz, QuizQuestion } from "../types/quiz";

export const createQuiz = async (data: CreateQuizPayload): Promise<Quiz> => {
  const response = await api.post("/quiz", data);
  return response.data.data;
};

export const getQuizById = async (id: string): Promise<Quiz | null> => {
  try {
    const response = await api.get(`/quiz/${id}`);
    return response.data.data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return null;
    }
    throw err;
  }
};

export const getQuizQuestions = async (quizId: string): Promise<QuizQuestion[]> => {
  try {
    const response = await api.get(`/quiz/${quizId}/questions`);
    return response.data?.data || [];
  } catch (err: any) {
    // If GET /quiz/:id/questions doesn't exist on backend (404 Cannot GET), fallback to GET /quiz/:id
    try {
      const quiz = await getQuizById(quizId);
      return quiz?.questions || (quiz as any)?.quiz_questions || [];
    } catch (fallbackErr) {
      return [];
    }
  }
};

export const updateQuiz = async (id: string, data: Partial<CreateQuizPayload>): Promise<Quiz> => {
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
