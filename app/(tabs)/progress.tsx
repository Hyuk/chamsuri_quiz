import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getProgress } from '@/api/quiz';

export default function ProgressScreen() {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: getProgress,
  });

  if (isLoading || !progress) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.statRow}>
        <Stat label="레벨" value={String(progress.level)} />
        <Stat label="XP" value={String(progress.xp)} />
        <Stat label="연속 참여" value={`${progress.streakDays}일`} />
      </View>

      <Text style={styles.sectionTitle}>배지</Text>
      <View style={styles.badgeRow}>
        {progress.badges.map((badge) => (
          <View key={badge} style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>오답노트</Text>
      <Text style={styles.body}>다시 풀어볼 문제 {progress.wrongAnswerCount}개</Text>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
    gap: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  badgeText: {
    color: '#4338CA',
    fontWeight: '600',
    fontSize: 13,
  },
  body: {
    color: '#374151',
    fontSize: 15,
  },
});
