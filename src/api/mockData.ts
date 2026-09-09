import type { AnswerResponse, Question, QuizSet, UserProgress } from '@/types/quiz';

// toISOString()은 UTC 기준이라 한국 시간 자정~09시 사이에 전날로 잡히므로 로컬 날짜로 만든다.
const now = new Date();
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-');

const mockAnswers: Record<number, string[]> = {
  1: ['리튬', 'lithium'],
  2: ['쿠팡', 'coupang'],
};

const questions: Question[] = [
  {
    id: 1,
    orderIndex: 1,
    prompt: '전기차 배터리의 핵심 원료로 쓰이는, 원소기호 Li의 금속은?',
    answerWordLengths: [2],
    hintSourceType: 'BLOG',
    hintUrl: 'https://blog.chamsuriquiz.com/science/lithium',
    explanation: null,
    sourceUrl: null,
    mySubmission: null,
  },
  {
    id: 2,
    orderIndex: 2,
    prompt: '국내 이커머스 중 로켓배송으로 잘 알려진 기업은?',
    answerWordLengths: [2],
    hintSourceType: 'AFFILIATE',
    hintUrl: 'https://link.coupang.com/a/example',
    explanation: null,
    sourceUrl: null,
    mySubmission: null,
  },
];

const explanations: Record<number, string> = {
  1: '리튬은 가볍고 전기화학 반응성이 높아 이차전지 양극재의 핵심 소재로 쓰입니다.',
  2: '쿠팡은 자체 물류망을 기반으로 익일배송 서비스를 운영합니다.',
};

export const mockQuizSet: QuizSet = {
  quizDate: today,
  questions,
};

export const mockProgress: UserProgress = {
  xp: 120,
  level: 3,
  points: 35,
  streakDays: 4,
  longestStreakDays: 6,
  lastAttendanceDate: today,
  badges: ['첫 정답', '3일 연속 참여'],
  wrongAnswerCount: 2,
};

// 서버 채점 규칙(공백 제거 + 소문자)을 흉내 낸다.
export function mockSubmit(questionId: number, answerText: string): AnswerResponse {
  const normalized = answerText.replace(/\s+/g, '').toLowerCase();
  const isCorrect = (mockAnswers[questionId] ?? []).some((a) => a.replace(/\s+/g, '').toLowerCase() === normalized);
  return {
    submissionId: Date.now(),
    result: isCorrect ? 'correct' : 'incorrect',
    isCorrect,
    explanation: explanations[questionId] ?? null,
    sourceUrl: null,
    xpAwarded: isCorrect ? 10 : 0,
    pointsAwarded: isCorrect ? 5 : 0,
    progress: {
      ...mockProgress,
      xp: mockProgress.xp + (isCorrect ? 10 : 0),
      points: mockProgress.points + (isCorrect ? 5 : 0),
    },
  };
}
