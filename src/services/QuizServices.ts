import api from "../lib/axios";
import { CreateQuizPayload, Quiz, QuizQuestion } from "../types/quiz";

export const getAllQuizzes = async (): Promise<Quiz[]> => {
  const response = await api.get("/quiz");
  return response.data.data;
};

export const createQuiz = async (data: CreateQuizPayload): Promise<Quiz> => {
  const response = await api.post("/quiz", data);
  return response.data.data;
};

export const submitQuiz = async (data: any): Promise<any> => {
  const response = await api.post("/quiz/submit", data);
  return response.data.data;
};

export const getQuizHistory = async (): Promise<any[]> => {
  const response = await api.get("/quiz/history");
  return response.data.data;
};

export const getQuizHistoryById = async (id: string): Promise<any> => {
  const response = await api.get(`/quiz/history/${id}`);
  return response.data.data;
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
import { ExamData } from "../types/courseExam";

export interface QuizOptionPayload {
  id?: string;
  option_text_ar: string;
  option_text_en?: string;
  is_correct: boolean;
}

export interface QuizQuestionPayload {
  id?: string;
  question_ar: string;
  question_en?: string;
  type: "MCQ" | "TRUE_FALSE";
  points: number;
  order: number;
  options: QuizOptionPayload[];
}

export interface QuizPayload {
  title_ar: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  courseId?: string;
  total_points: number;
  pass_points: number;
  duration_min: number;
  questions: QuizQuestionPayload[];
}

export interface Quiz {
  id: string;
  title_ar: string;
  title_en?: string;
  slug?: string;
  description_ar?: string;
  description_en?: string;
  total_points: number;
  pass_points: number;
  duration_min: number;
  questions: {
    id: string;
    question_ar: string;
    question_en?: string;
    type: string;
    points: number;
    order: number;
    options: {
      id: string;
      option_text_ar: string;
      option_text_en?: string;
      is_correct?: boolean;
    }[];
  }[];
  createdAt: string;
  updatedAt: string;
}

export const getQuizzes = async (params?: { page?: number; limit?: number }) => {
  const response = await api.get("/quiz", { params });
  return response.data.data as { items: Quiz[]; pagination: any };
};

export const getQuizById = async (id: string) => {
  const response = await api.get(`/quiz/${id}`);
  return response.data.data as Quiz;
};

export const createQuiz = async (data: QuizPayload) => {
  const response = await api.post("/quiz", data);
  return response.data.data as Quiz;
};

export const updateQuiz = async (id: string, data: Partial<QuizPayload>) => {
  const response = await api.patch(`/quiz/${id}`, data);
  return response.data.data as Quiz;
};

export const deleteQuiz = async (id: string) => {
  const response = await api.delete(`/quiz/${id}`);
  return response.data.data;
};

export const submitQuiz = async (payload: {
  quiz_id: string;
  answers: { question_id: string; option_id: string | null }[];
}) => {
  const response = await api.post("/quiz/submit", payload);
  return response.data.data;
};

export const getQuizHistory = async (params?: { page?: number; limit?: number; quiz_id?: string }) => {
  const response = await api.get("/quiz/history", { params });
  return response.data.data;
};

export function convertExamDataToQuizPayload(examData: ExamData, courseId?: string): QuizPayload {
  const mcqMapped: QuizQuestionPayload[] = (examData.mcqQuestions || []).map((q, idx) => ({
    question_ar: q.text,
    question_en: q.text,
    type: "MCQ",
    points: q.points || 1,
    order: idx + 1,
    options: (q.options || []).map((opt) => ({
      option_text_ar: opt.text,
      option_text_en: opt.text,
      is_correct: !!opt.isCorrect,
    })),
  }));

  const tfMapped: QuizQuestionPayload[] = (examData.trueFalseQuestions || []).map((q, idx) => ({
    question_ar: q.text,
    question_en: q.text,
    type: "TRUE_FALSE",
    points: q.points || 1,
    order: mcqMapped.length + idx + 1,
    options: [
      {
        option_text_ar: "صح",
        option_text_en: "True",
        is_correct: q.correctAnswer === true,
      },
      {
        option_text_ar: "خطأ",
        option_text_en: "False",
        is_correct: q.correctAnswer === false,
      },
    ],
  }));

  const allQuestions = [...mcqMapped, ...tfMapped];
  const totalPoints = allQuestions.reduce((acc, q) => acc + q.points, 0);
  const passPoints = Math.ceil(totalPoints * 0.5);

  return {
    title_ar: examData.title,
    title_en: examData.title,
    courseId: courseId || undefined,
    duration_min: Number(examData.duration) || 30,
    total_points: totalPoints || 1,
    pass_points: passPoints,
    questions: allQuestions,
  };
}
