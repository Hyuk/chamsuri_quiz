import { useMutation, useQuery } from '@tanstack/react-query';
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

import { getTodayQuiz, submitAnswer } from '@/api/quiz';
import { BlankAnswerPreview } from '@/components/BlankAnswerPreview';
import type { AnswerResponse, Question } from '@/types/quiz';

function openHint(url: string) {
  if (!/^https?:\/\//i.test(url)) return;
  WebBrowser.openBrowserAsync(url);
}

export default function TodayQuizScreen() {
  const { data: quizSet, isLoading } = useQuery({
    queryKey: ['today-quiz'],
    queryFn: getTodayQuiz,
  });

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [result, setResult] = useState<AnswerResponse | null>(null);

  const submitMutation = useMutation({
    mutationFn: (question: Question) => submitAnswer(question.id, answerText),
    onSuccess: (response) => setResult(response),
  });

  if (isLoading || !quizSet) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  const question = quizSet.questions[questionIndex];
  const isLastQuestion = questionIndex === quizSet.questions.length - 1;

  function goToNextQuestion() {
    setAnswerText('');
    setResult(null);
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

      <TextInput
        style={styles.input}
        placeholder="답을 입력하세요"
        value={answerText}
        onChangeText={setAnswerText}
        editable={!result}
      />

      {!result && (
        <Pressable
          style={[styles.submitButton, !answerText && styles.submitButtonDisabled]}
          disabled={!answerText || submitMutation.isPending}
          onPress={() => submitMutation.mutate(question)}
        >
          <Text style={styles.submitButtonText}>
            {submitMutation.isPending ? '채점 중...' : '제출하기'}
          </Text>
        </Pressable>
      )}

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>
            {result.result === 'correct' && '정답입니다!'}
            {result.result === 'incorrect' && '아쉬워요, 오답입니다'}
            {result.result === 'pending' && '검토 중이에요'}
          </Text>
          {result.explanation && <Text style={styles.resultBody}>{result.explanation}</Text>}
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
  },
});
