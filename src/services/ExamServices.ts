import api from "../lib/axios";
import {
  Exam,
  ExamQuestion,
  CreateExamPayload,
  CreateQuestionPayload,
  SubmitExamPayload,
} from "../types/exam";
import { ExamData, MCQQuestion, TrueFalseQuestion } from "../types/courseExam";
import { QuizPayload, QuizQuestionPayload } from "../types/quiz";

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

export function convertExamDataToQuizPayload(examData: ExamData, courseId?: string): QuizPayload {
  const mcqMapped: QuizQuestionPayload[] = (examData.mcqQuestions || []).map((q: MCQQuestion, idx: number) => ({
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

  const tfMapped: QuizQuestionPayload[] = (examData.trueFalseQuestions || []).map((q: TrueFalseQuestion, idx: number) => ({
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

