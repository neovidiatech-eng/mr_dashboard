export interface MCQOption {
  id?: string;
  text: string;
  isCorrect: boolean;
}

export interface MCQQuestion {
  id?: string;
  text: string;
  points: number;
  options: MCQOption[];
}

export interface TrueFalseQuestion {
  id?: string;
  text: string;
  points: number;
  correctAnswer: boolean; 
}

export interface ExamData {
  id?: string;
  title: string;
  duration?: number | string;
  mcqQuestions?: MCQQuestion[];
  trueFalseQuestions?: TrueFalseQuestion[];
}