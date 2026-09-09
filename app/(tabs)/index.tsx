import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ApiError } from '@/api/client';
import { getTodayQuiz, newIdempotencyKey, submitAnswer } from '@/api/quiz';
import { BlankAnswerPreview } from '@/components/BlankAnswerPreview';
import type { Question } from '@/types/quiz';

function openHint(url: string) {
  if (!/^https?:\/\//i.test(url)) return;
  WebBrowser.openBrowserAsync(url);
}

interface Outcome {
  isCorrect: boolean;
  explanation: string | null;
  xpAwarded: number;
}

function outcomeOf(question: Question): Outcome | null {
  if (!question.mySubmission) return null;
  return {
    isCorrect: question.mySubmission.isCorrect,
    explanation: question.explanation,
    xpAwarded: question.mySubmission.xpAwarded,
  };
}

export default function TodayQuizScreen() {
  const queryClient = useQueryClient();
  const { data: quizSet, isLoading, error } = useQuery({
    queryKey: ['today-quiz'],
    queryFn: getTodayQuiz,
    retry: false,
  });

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [freshOutcome, setFreshOutcome] = useState<Outcome | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitMutation = useMutation({
    mutationFn: (question: Question) =>
      submitAnswer(question.id, answerText, { idempotencyKey: newIdempotencyKey() }),
    onSuccess: (response) => {
      setFreshOutcome({ isCorrect: response.isCorrect, explanation: response.explanation, xpAwarded: response.xpAwarded });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
    onError: (e) => {
      setSubmitError(e instanceof ApiError ? e.message : '제출에 실패했습니다. 다시 시도해 주세요.');
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !quizSet) {
    const noQuiz = error instanceof ApiError && error.code === 'NO_QUIZ_TODAY';
    return (
      <View style={styles.centered}>
        <Text style={styles.resultBody}>
          {noQuiz ? '오늘의 퀴즈가 아직 준비되지 않았어요. 잠시 후 다시 확인해 주세요.' : '퀴즈를 불러오지 못했어요.'}
        </Text>
      </View>
    );
  }

  const question = quizSet.questions[questionIndex];
  const isLastQuestion = questionIndex === quizSet.questions.length - 1;
  const outcome = freshOutcome ?? outcomeOf(question);

  function goToNextQuestion() {
    setAnswerText('');
    setFreshOutcome(null);
    setSubmitError(null);
    setQuestionIndex((index) => Math.min(index + 1, quizSet!.questions.length - 1));
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.progress}>
        {questionIndex + 1} / {quizSet.questions.length}
      </Text>

      <Text style={styles.prompt}>{question.prompt}</Text>

      <BlankAnswerPreview wordLengths={question.answerWordLengths} />

      <Pressable style={styles.hintButton} onPress={() => openHint(question.hintUrl)}>
        <Text style={styles.hintButtonText}>
          {question.hintSourceType === 'BLOG' ? '블로그에서 힌트 보기' : '관련 상품에서 힌트 보기'}
        </Text>
      </Pressable>

      {!outcome && (
        <>
          <TextInput
            style={styles.input}
            placeholder="답을 입력하세요"
            value={answerText}
            onChangeText={setAnswerText}
          />
          <Pressable
            style={[styles.submitButton, !answerText.trim() && styles.submitButtonDisabled]}
            disabled={!answerText.trim() || submitMutation.isPending}
            onPress={() => submitMutation.mutate(question)}
          >
            <Text style={styles.submitButtonText}>
              {submitMutation.isPending ? '채점 중...' : '제출하기'}
            </Text>
          </Pressable>
          {submitError && <Text style={styles.error}>{submitError}</Text>}
        </>
      )}

      {outcome && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>
            {outcome.isCorrect ? `정답입니다! +${outcome.xpAwarded} XP` : '아쉬워요, 오답입니다'}
          </Text>
          {question.mySubmission && !freshOutcome && (
            <Text style={styles.resultBody}>내 답: {question.mySubmission.submittedText}</Text>
          )}
          {outcome.explanation && <Text style={styles.resultBody}>{outcome.explanation}</Text>}
          {!isLastQuestion && (
            <Pressable style={styles.submitButton} onPress={goToNextQuestion}>
              <Text style={styles.submitButtonText}>다음 문제</Text>
            </Pressable>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    padding: 20,
    gap: 16,
  },
  progress: {
    color: '#6B7280',
    fontWeight: '600',
  },
  prompt: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  hintButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  hintButtonText: {
    color: '#4338CA',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  resultBox: {
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  resultBody: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    textAlign: 'center',
  },
  error: {
    color: '#B91C1C',
    fontSize: 14,
  },
});
