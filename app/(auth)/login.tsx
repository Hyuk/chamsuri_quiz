import { Redirect } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/lib/authContext';

export default function LoginScreen() {
  const { isLoggedIn, login } = useAuth();

  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>참수리퀴즈</Text>
      <Text style={styles.subtitle}>매일 새로운 주관식 퀴즈를 풀어보세요</Text>

      <Pressable style={styles.button} onPress={() => login('mock-token')}>
        <Text style={styles.buttonText}>이메일로 시작하기</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.buttonSecondary]} onPress={() => login('mock-token')}>
        <Text style={styles.buttonText}>소셜 계정으로 시작하기</Text>
      </Pressable>
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
  buttonSecondary: {
    backgroundColor: '#374151',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
