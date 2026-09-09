import * as SecureStore from 'expo-secure-store';

const LAUNCH_COUNT_KEY = 'chamsuri_launch_count';
const LAST_AD_SHOWN_AT_KEY = 'chamsuri_last_ad_shown_at';

const FREE_LAUNCH_COUNT = 3;
const MIN_INTERVAL_MS = 4 * 60 * 60 * 1000;

function parseStoredNumber(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function recordAppLaunch(): Promise<number> {
  const current = parseStoredNumber(await SecureStore.getItemAsync(LAUNCH_COUNT_KEY)) ?? 0;
  const next = current + 1;
  await SecureStore.setItemAsync(LAUNCH_COUNT_KEY, String(next));
  return next;
}

/** 콜드 스타트마다 정확히 한 번만 호출해야 한다 (탭 화면 마운트가 아니라 루트 레이아웃에서). */
export async function shouldShowAppOpenAd(): Promise<boolean> {
  const launchCount = await recordAppLaunch();
  if (launchCount <= FREE_LAUNCH_COUNT) return false;

  const lastShownAt = parseStoredNumber(await SecureStore.getItemAsync(LAST_AD_SHOWN_AT_KEY));
  if (lastShownAt === null) return true;

  return Date.now() - lastShownAt >= MIN_INTERVAL_MS;
}

export async function recordAppOpenAdShown(): Promise<void> {
  await SecureStore.setItemAsync(LAST_AD_SHOWN_AT_KEY, String(Date.now()));
}
