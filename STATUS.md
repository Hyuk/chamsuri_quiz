# 개발 진행상황

마지막 업데이트: 2026-09-07

## 프로젝트 개요
참수리퀴즈 모바일 앱. Expo(React Native) + Expo Router. 외부 API 서버는 별도 프로젝트(미착수), 블로그는 기존에 운영 중, 관리자 페이지도 별도 프로젝트.

## 완료
- Expo Router 스캐폴딩: `app/_layout.tsx`, `(auth)/login`, `(tabs)` 그룹(오늘의 퀴즈/기록/프로필)
- 오늘의 퀴즈 화면: 단어 글자수 기반 빈칸 미리보기(`BlankAnswerPreview`), 힌트 버튼(문제별 `hintSourceType`에 따라 블로그/제휴 페이지로 분기, `expo-web-browser`로 인앱 오픈), 답안 제출, 채점 결과 표시
- 진행상황 화면: 레벨/XP/연속참여일/배지/오답노트 개수
- 프로필 화면: 로그아웃 스텁
- API 레이어(`src/api/`): `EXPO_PUBLIC_API_BASE_URL` 미설정 시 mock 데이터로 자동 동작, 값 채우면 그대로 실 서버 전환
- 인증: `expo-secure-store` 기반 토큰 저장 스텁(`AuthProvider`/`useAuth`), 실제 로그인 SDK는 미연동
- App Open Ad 게이팅: 로컬 규칙(설치 후 첫 3회 노출 면제, 최소 4시간 간격) 구현, 실제 AdMob SDK는 미연동
- 검증 완료: `tsc --noEmit` 클린, `expo-doctor` 18/18 통과, `expo export --platform ios` 번들 성공

## 미착수 / 다음 단계
- AdMob 실 SDK 연동 (`react-native-google-mobile-ads`)
- 실제 소셜/이메일 로그인 플로우
- 이의제기(dispute) 제출 화면 UI (API 함수 `submitDispute`는 존재, 화면 없음)
- 랭킹 / 명예의 전당 화면
- 푸시 알림 (다음날 퀴즈 리마인드, `expo-notifications`)
- 외부 API 서버 (별도 프로젝트, 스펙 미확정)
- git 커밋 아직 없음 (전체 파일 untracked 상태)

## 설계 메모
- 답안 입력은 글자별 입력창이 아닌 단일 텍스트 필드 + 시각적 빈칸 표시로 처리 (한글 IME 조합 버그 회피 목적)
- 광고 시청/제휴 클릭이 퀴즈 정답·보상·확률에 영향을 주지 않도록 설계 (법적 리스크 회피)
- 디자인은 별도 단계 없이 기본 스타일로 바로 개발 진행하기로 결정
