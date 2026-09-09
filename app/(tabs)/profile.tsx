import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/lib/authContext';

export default function ProfileScreen() {
  const { logout, user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>프로필</Text>
      {user && <Text>{user.nickname} · {user.email}</Text>}
      <Pressable style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>로그아웃</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  button: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
  },
  buttonText: {
    color: '#B91C1C',
    fontWeight: '600',
  },
});
