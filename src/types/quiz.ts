// 백엔드(chamsuri_quiz_backend)·관리자(chamsuri_quiz_admin)와 같은 필드명/enum 표기를 쓴다.
export type HintSourceType = 'BLOG' | 'AFFILIATE';

export interface Question {
  id: number;
  orderIndex: number;
  prompt: string;
  answerWordLengths: number[];
  hintSourceType: HintSourceType;
  hintUrl: string;
  explanation?: string;
  sourceUrl?: string;
}

export interface QuizSet {
  quizDate: string;
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
  questionId: number;
  submittedAnswer: string;
  reason: string;
}
