export type QuestionType = "MCQ" | "FILL_IN_BLANK" | "DESCRIPTIVE" | "MATCH" | "ONE_WORD";

export interface QuestionOption {
  label?: string; // A, B, C, D
  text: string;
  isCorrect?: boolean;
}

export interface MatchPair {
  left: string;
  right: string;
  example?: boolean; // For example rows like in the Gujarati paper
}

export interface Question {
  id: string;
  number: string; // e.g., "1(અ)", "1", "2.a"
  text: string;
  marks: number;
  type: QuestionType;
  options?: QuestionOption[]; // For MCQs
  answer?: string; // For one word / fill in blanks
  matchPairs?: MatchPair[]; // For Match the following
  linesRequired?: number; // For descriptive essays
}

export interface Section {
  id: string;
  title: string; // e.g., "Section - A"
  questions: Question[];
}

export interface PaperMeta {
  standard: string;
  subject: string;
  chapter?: string;
  date: string;
  totalMarks: number;
  schoolName: string;
  schoolSubtitle: string;
  schoolMedium: string;
}

export interface QuestionPaper {
  meta: PaperMeta;
  sections: Section[];
}
