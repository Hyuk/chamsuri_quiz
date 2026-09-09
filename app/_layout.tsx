import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { logAppOpenAdImpression } from '@/api/quiz';
import { recordAppOpenAdShown, shouldShowAppOpenAd } from '@/lib/appOpenAdGate';
import { AuthProvider } from '@/lib/authContext';
import { queryClient } from '@/lib/queryClient';

export default function RootLayout() {
  useEffect(() => {
    shouldShowAppOpenAd().then(async (shouldShow) => {
      if (!shouldShow) return;
      await logAppOpenAdImpression();
      await recordAppOpenAdShown();
      // TODO: trigger native App Open Ad SDK here once react-native-google-mobile-ads is wired up.
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
