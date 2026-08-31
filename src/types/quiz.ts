export interface QuizOption {
  id?: string;
  questionId?: string;
  option_text_ar?: string;
  option_text_en?: string;
  text?: string;
  text_ar?: string;
  text_en?: string;
  is_correct?: boolean;
  isCorrect?: boolean;
  order?: number;
}

export type QuizQuestionType = 'MCQ' | 'TRUE_FALSE' | 'mcq' | 'true_false';

export interface QuizQuestion {
  id?: string;
  quizId?: string;
  question_ar?: string;
  question_en?: string;
  text?: string;
  text_ar?: string;
  text_en?: string;
  type: QuizQuestionType;
  points: number;
  order: number;
  options?: QuizOption[];
  answers?: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  quizId: string;
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
}

export type QuizStatus = 'pending' | 'in_progress' | 'submitted' | 'graded';

export interface Quiz {
  id: string;
  title?: string;
  title_ar?: string;
  title_en?: string;
  description?: string;
  description_ar?: string;
  description_en?: string;
  subject?: string | null;
  grade?: number;
  studentId?: string;
  teacherId?: string;
  dueDate?: string;
  totalMarks?: number;
  total_points?: number;
  pass_points?: number;
  duration?: number;
  duration_min?: number;
  status?: QuizStatus;
  questions?: QuizQuestion[];
  startedAt?: string | null;
  submittedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  student?: { id: string; user: { name: string; email: string } };
  teacher?: { id: string; user: { name: string; email: string } };
}

export interface CrQuizOptionPayload {
  option_text_ar: string;
  option_text_en: string;
  is_correct: boolean;
}

export interface CreateQuizQuestionPayload {
  question_ar: string;
  question_en: string;
  type: 'MCQ' | 'TRUE_FALSE';
  points: number;
  order: number;
  options?: CrQuizOptionPayload[];
}

export interface CreateQuizPayload {
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  courseId?: string;
  course_id?: string;
  sectionId?: string;
  section_id?: string;
  duration?: number;
  duration_min?: number;
  totalMarks?: number;
  total_points?: number;
  pass_points?: number;
  order?: number;
  questions?: CreateQuizQuestionPayload[];
}
