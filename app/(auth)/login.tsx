import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import { canUseMockLogin, useAuth } from '@/lib/authContext';
import { GoogleSignInUnavailableError, isGoogleSignInConfigured } from '@/lib/googleSignIn';

export default function LoginScreen() {
  const { isLoggedIn, loginWithGoogle, loginMock } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      if (e instanceof GoogleSignInUnavailableError) setError(e.message);
      else if (e instanceof ApiError) setError(`로그인에 실패했습니다 (${e.code})`);
      else setError('로그인 중 문제가 생겼습니다. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>참수리퀴즈</Text>
      <Text style={styles.subtitle}>매일 새로운 주관식 퀴즈를 풀어보세요</Text>

      <Pressable
        style={[styles.button, (busy || !isGoogleSignInConfigured) && styles.buttonDisabled]}
        disabled={busy || !isGoogleSignInConfigured}
        onPress={() => run(loginWithGoogle)}
      >
        {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Google로 시작하기</Text>}
      </Pressable>
      {!isGoogleSignInConfigured && (
        <Text style={styles.help}>구글 클라이언트 ID(EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID)가 설정되지 않았습니다.</Text>
      )}

      {canUseMockLogin && (
        <Pressable style={[styles.button, styles.buttonSecondary]} disabled={busy} onPress={() => run(loginMock)}>
          <Text style={styles.buttonText}>개발용 mock 로그인</Text>
        </Pressable>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonSecondary: {
    backgroundColor: '#374151',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  help: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
  },
});
