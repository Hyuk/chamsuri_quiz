// 백엔드(chamsuri_quiz_backend) 응답 DTO(service/Views.kt, api/*)와 같은 필드명/enum 표기를 쓴다.
export type HintSourceType = 'BLOG' | 'AFFILIATE';
export type SubmissionType = 'DAILY' | 'RETRY';

export interface SubmissionView {
  id: number;
  submissionType: SubmissionType;
  submittedText: string;
  isCorrect: boolean;
  xpAwarded: number;
  pointsAwarded: number;
  createdAt: string;
}

export interface Question {
  id: number;
  orderIndex: number;
  prompt: string;
  answerWordLengths: number[];
  hintSourceType: HintSourceType;
  hintUrl: string;
  /** 이미 제출한 문제에만 내려온다. */
  explanation: string | null;
  sourceUrl: string | null;
  mySubmission: SubmissionView | null;
}

export interface QuizSet {
  quizDate: string;
  questions: Question[];
}

export interface UserProgress {
  xp: number;
  level: number;
  points: number;
  streakDays: number;
  longestStreakDays: number;
  lastAttendanceDate: string | null;
  badges: string[];
  wrongAnswerCount: number;
}

export type AnswerResult = 'correct' | 'incorrect';

export interface AnswerResponse {
  submissionId: number;
  result: AnswerResult;
  isCorrect: boolean;
  explanation: string | null;
  sourceUrl: string | null;
  xpAwarded: number;
  pointsAwarded: number;
  progress: UserProgress;
}

export interface DisputeSubmission {
  submissionId: number;
  reason: string;
}
