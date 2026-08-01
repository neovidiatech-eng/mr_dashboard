export interface ExamOption {
  id: string;
  questionId: string;
  text: string;
  text_ar?: string;
  text_en?: string;
  isCorrect?: boolean; // hidden by the backend until the exam is submitted
  order: number;
}

export interface ExamQuestion {
  id: string;
  examId: string;
  text: string;
  text_ar?: string;
  text_en?: string;
  type: 'mcq' | 'true_false';
  points: number;
  order: number;
  options: ExamOption[];
  answers?: ExamAnswer[]; // the requesting student's own answer, if any
}

export interface ExamAnswer {
  id: string;
  examId: string;
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
}

export type ExamStatus = 'pending' | 'in_progress' | 'submitted' | 'graded';

export interface Exam {
  id: string;
  title: string;
  title_ar?: string;
  title_en?: string;
  subject?: string | null;
  grade: number;
  studentId: string;
  teacherId: string;
  dueDate: string;
  totalMarks: number;
  duration: number;
  status: ExamStatus;
  startedAt?: string | null;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: { id: string; user: { name: string; email: string } };
  teacher?: { id: string; user: { name: string; email: string } };
}

export interface CreateExamPayload {
  title?: string;
  title_ar: string;
  title_en?: string;
  subject?: string;
  studentId: string;
  teacherId?: string;
  dueDate: string;
  totalMarks?: number;
  duration: number;
}

export interface CreateQuestionPayload {
  text?: string;
  text_ar: string;
  text_en?: string;
  type: 'mcq' | 'true_false';
  points: number;
  options: { text_ar?: string; text_en?: string; text: string; isCorrect: boolean }[];
}

export interface SubmitExamPayload {
  answers: { questionId: string; selectedOptionId: string | null }[];
}
