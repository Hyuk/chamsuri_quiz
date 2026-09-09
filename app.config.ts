import type { ConfigContext, ExpoConfig } from 'expo/config';

// app.json을 기반으로 환경변수가 필요한 설정(구글 로그인 URL 스킴)만 여기서 덧붙인다.
// iosUrlScheme은 구글 클라우드 콘솔 iOS 클라이언트 ID를 뒤집은 값(com.googleusercontent.apps.<id>)이다.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'chamsuri_quiz',
  slug: config.slug ?? 'chamsuri_quiz',
  plugins: [
    ...(config.plugins ?? []),
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme:
          process.env.GOOGLE_IOS_URL_SCHEME ?? 'com.googleusercontent.apps.REPLACE_WITH_IOS_CLIENT_ID',
      },
    ],
  ],
});
