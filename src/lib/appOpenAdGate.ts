import * as SecureStore from 'expo-secure-store';

const LAUNCH_COUNT_KEY = 'chamsuri_launch_count';
const LAST_AD_SHOWN_AT_KEY = 'chamsuri_last_ad_shown_at';

const FREE_LAUNCH_COUNT = 3;
const MIN_INTERVAL_MS = 4 * 60 * 60 * 1000;

export async function recordAppLaunch(): Promise<number> {
  const current = await SecureStore.getItemAsync(LAUNCH_COUNT_KEY);
  const next = (current ? parseInt(current, 10) : 0) + 1;
  await SecureStore.setItemAsync(LAUNCH_COUNT_KEY, String(next));
  return next;
}

export async function shouldShowAppOpenAd(): Promise<boolean> {
  const launchCount = await recordAppLaunch();
  if (launchCount <= FREE_LAUNCH_COUNT) return false;

  const lastShownAt = await SecureStore.getItemAsync(LAST_AD_SHOWN_AT_KEY);
  if (!lastShownAt) return true;

  const elapsed = Date.now() - Number(lastShownAt);
  return elapsed >= MIN_INTERVAL_MS;
}

export async function recordAppOpenAdShown(): Promise<void> {
  await SecureStore.setItemAsync(LAST_AD_SHOWN_AT_KEY, String(Date.now()));
}
