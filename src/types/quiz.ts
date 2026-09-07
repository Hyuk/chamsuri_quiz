export type HintSourceType = 'blog' | 'affiliate';

export interface Question {
  id: string;
  order: number;
  prompt: string;
  answerWordLengths: number[];
  hintSourceType: HintSourceType;
  hintUrl: string;
  explanation?: string;
  sourceUrl?: string;
}

export interface QuizSet {
  date: string;
  questions: Question[];
}

export type AnswerResult = 'correct' | 'incorrect' | 'pending';

export interface AnswerResponse {
  result: AnswerResult;
  explanation?: string;
  sourceUrl?: string;
  xpAwarded?: number;
}

export interface UserProgress {
  xp: number;
  level: number;
  streakDays: number;
  badges: string[];
  wrongAnswerCount: number;
}

export interface DisputeSubmission {
  questionId: string;
  submittedAnswer: string;
  reason: string;
}
