import { apiFetch, USE_MOCK } from '@/api/client';
import { mockProgress, mockQuizSet } from '@/api/mockData';
import type {
  AnswerResponse,
  DisputeSubmission,
  QuizSet,
  UserProgress,
} from '@/types/quiz';

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getTodayQuiz(): Promise<QuizSet> {
  if (USE_MOCK) return delay(mockQuizSet);
  return apiFetch<QuizSet>('/v1/quiz/today');
}

export async function submitAnswer(
  questionId: string,
  answerText: string,
): Promise<AnswerResponse> {
  if (USE_MOCK) {
    const question = mockQuizSet.questions.find((q) => q.id === questionId);
    const normalized = answerText.trim().replace(/\s+/g, '');
    const isCorrect = normalized.length > 0 && normalized.length <= 4;
    return delay({
      result: isCorrect ? 'correct' : 'incorrect',
      explanation: question?.explanation,
      sourceUrl: question?.sourceUrl,
      xpAwarded: isCorrect ? 10 : 0,
    });
  }
  return apiFetch<AnswerResponse>('/v1/answers', {
    method: 'POST',
    body: JSON.stringify({ questionId, answerText }),
  });
}

export async function getProgress(): Promise<UserProgress> {
  if (USE_MOCK) return delay(mockProgress);
  return apiFetch<UserProgress>('/v1/me/progress');
}

export async function submitDispute(payload: DisputeSubmission): Promise<void> {
  if (USE_MOCK) {
    await delay(undefined);
    return;
  }
  await apiFetch<void>('/v1/disputes', {
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
