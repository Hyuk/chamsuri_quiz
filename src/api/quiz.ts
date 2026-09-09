import { apiFetch, USE_MOCK } from '@/api/client';
import { mockProgress, mockQuizSet, mockSubmit } from '@/api/mockData';
import type {
  AnswerResponse,
  DisputeSubmission,
  Question,
  QuizSet,
  SubmissionType,
  UserProgress,
} from '@/types/quiz';

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// 재전송 시 서버가 같은 결과를 돌려주고 재과금하지 않도록 제출마다 한 번만 만든다.
export function newIdempotencyKey(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export async function getTodayQuiz(): Promise<QuizSet> {
  if (USE_MOCK) return delay(mockQuizSet);
  return apiFetch<QuizSet>('/v1/quiz/today');
}

export async function submitAnswer(
  questionId: number,
  answerText: string,
  options: { submissionType?: SubmissionType; idempotencyKey?: string } = {},
): Promise<AnswerResponse> {
  if (USE_MOCK) return delay(mockSubmit(questionId, answerText));
  return apiFetch<AnswerResponse>('/v1/answers', {
    method: 'POST',
    body: JSON.stringify({
      questionId,
      answerText,
      submissionType: options.submissionType ?? 'DAILY',
      idempotencyKey: options.idempotencyKey,
    }),
  });
}

export async function getProgress(): Promise<UserProgress> {
  if (USE_MOCK) return delay(mockProgress);
  return apiFetch<UserProgress>('/v1/me/progress');
}

export async function getWrongAnswers(): Promise<Question[]> {
  if (USE_MOCK) return delay([]);
  return apiFetch<Question[]>('/v1/me/wrong-answers');
}

export async function submitDispute(payload: DisputeSubmission): Promise<void> {
  if (USE_MOCK) {
    await delay(undefined);
    return;
  }
  await apiFetch<unknown>('/v1/disputes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logAppOpenAdImpression(): Promise<void> {
  if (USE_MOCK) {
    await delay(undefined);
    return;
  }
  await apiFetch<void>('/v1/ads/app-open-log', { method: 'POST' });
}
