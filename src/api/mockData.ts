import type { Question, QuizSet, UserProgress } from '@/types/quiz';

const today = new Date().toISOString().slice(0, 10);

const questions: Question[] = [
  {
    id: 'q1',
    order: 1,
    prompt: '전기차 배터리의 핵심 원료로 쓰이는, 원소기호 Li의 금속은?',
    answerWordLengths: [2],
    hintSourceType: 'blog',
    hintUrl: 'https://blog.chamsuriquiz.com/science/lithium',
    explanation: '리튬은 가볍고 전기화학 반응성이 높아 이차전지 양극재의 핵심 소재로 쓰입니다.',
    sourceUrl: 'https://blog.chamsuriquiz.com/science/lithium',
  },
  {
    id: 'q2',
    order: 2,
    prompt: '국내 이커머스 중 로켓배송으로 잘 알려진 기업은?',
    answerWordLengths: [2],
    hintSourceType: 'affiliate',
    hintUrl: 'https://link.coupang.com/a/example',
    explanation: '쿠팡은 자체 물류망을 기반으로 익일배송 서비스를 운영합니다.',
    sourceUrl: 'https://blog.chamsuriquiz.com/company/coupang',
  },
];

export const mockQuizSet: QuizSet = {
  date: today,
  questions,
};

export const mockProgress: UserProgress = {
  xp: 120,
  level: 3,
  streakDays: 4,
  badges: ['첫 정답', '3일 연속 참여'],
  wrongAnswerCount: 2,
};
