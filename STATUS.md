# 개발 진행상황

마지막 업데이트: 2026-09-10

## 프로젝트 개요
참수리퀴즈. 세 개의 형제 저장소로 구성:
- `chamsuri_quiz` — 모바일 앱 (Expo SDK 57 / React Native / expo-router), public repo `github.com/Hyuk/chamsuri_quiz`
- `chamsuri_quiz_backend` — API 서버 (Spring Boot 4.1 / Kotlin / PostgreSQL 16 / Flyway), private repo `github.com/Hyuk/chamsuri_quiz_backend`
- `chamsuri_quiz_admin` — 관리자 페이지 (Next.js 16 / TypeScript / Tailwind), private repo `github.com/Hyuk/chamsuri_quiz_admin`
블로그는 기존에 운영 중. 확정된 규칙과 미결 사항은 `PLAN.md` 참고.

## 실행 전에 필요한 것

### 1. Google Cloud Console에서 OAuth 클라이언트 ID 발급
Google Cloud Console > API 및 서비스 > 사용자 인증 정보에서 아래 3종을 만든다.
| 종류 | 용도 | 어디에 넣나 |
|---|---|---|
| 웹 애플리케이션 | 앱이 idToken을 받을 때 `webClientId`로 사용 (필수) | 앱 `.env` `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, 백엔드 `GOOGLE_CLIENT_IDS` |
| iOS (번들 ID `com.chamsuri.quiz` 등 app.json에 맞춤) | iOS 네이티브 로그인 | 앱 `.env` `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `GOOGLE_IOS_URL_SCHEME`(=ID를 뒤집은 `com.googleusercontent.apps.<id>`), 백엔드 `GOOGLE_CLIENT_IDS` |
| Android (패키지명 + 디버그/릴리스 SHA-1) | Android 네이티브 로그인 | 백엔드 `GOOGLE_CLIENT_IDS` |
백엔드 `GOOGLE_CLIENT_IDS`는 쉼표 구분 목록. 비어 있으면 모든 로그인이 거부된다.

### 2. 백엔드 실행
```bash
cd chamsuri_quiz_backend
docker compose up -d                     # 컨테이너명 chamsuri_quiz, localhost:5432
export GOOGLE_CLIENT_IDS="<web>,<ios>,<android>"
export APP_JWT_SECRET="<32바이트 이상 임의 문자열>"   # 미설정 시 개발용 기본값 사용
./gradlew bootRun                        # 첫 기동 시 Flyway V1 적용 + Hibernate 스키마 검증
```
- 아직 실제 DB에 기동해 본 적이 없다. 첫 `bootRun`에서 Flyway/Hibernate 검증 오류가 나면 V1 SQL을 직접 고친다(배포 전까지는 V1 직접 수정, 배포 후부터 V2+ 규칙).
- 스키마를 갈아엎을 때: `docker compose down -v && docker compose up -d`.
- 테스트: `./gradlew test --tests 'com.chamsuri.quiz.service.*' --tests 'com.chamsuri.quiz.auth.*' --tests 'com.chamsuri.quiz.api.*'` (DB 불필요). `contextLoads`와 동시성 통합 테스트는 DB 필요.

### 3. 모바일 앱 실행
```bash
cd chamsuri_quiz
cp .env.example .env                     # EXPO_PUBLIC_API_BASE_URL, 구글 클라이언트 ID 3개 채우기
npm install --legacy-peer-deps
npx expo prebuild                        # 구글 로그인은 네이티브 모듈이라 Expo Go 불가
npx expo run:ios    # 또는 npx expo run:android
```
- `EXPO_PUBLIC_API_BASE_URL`을 비워 두면 mock 데이터 + "개발용 mock 로그인" 버튼으로 백엔드 없이 동작한다.
- 실기기/시뮬레이터에서 백엔드에 붙일 때 `EXPO_PUBLIC_API_BASE_URL`은 `http://<맥 IP>:8080` 형태(시뮬레이터는 `http://localhost:8080`).

### 4. 관리자 페이지 실행
```bash
cd chamsuri_quiz_admin
npm install
npm run dev                              # NEXT_PUBLIC_API_BASE_URL 비우면 mock 동작
```
- 백엔드에 관리자 API(`/v1/admin/*`)가 아직 없어 실제 저장은 불가. 관리자 인증도 없음(배포 전 필수).

## 백엔드 (`chamsuri_quiz_backend`)
- 엔티티 14개(`ad_impressions` 포함) + Flyway `V1__init_schema.sql`
- Service: 채점(공백 제거→NFC→소문자), XP/레벨업, 포인트 원장, 출석/스트릭/복구(7일·가입일 제한), 오답노트(제출 기록 기반), 리더보드(전체/일간/주간, 탈퇴 유저 제외)
- 동시성: `UserProgress` 행 잠금(`findByIdForUpdate`), DAILY 부분 유니크 인덱스, idempotencyKey 유니크, `lock_timeout 5s`/`statement_timeout 30s`, 트랜잭션 timeout 10s
- 인증: `POST /v1/auth/google`(구글 JWKS로 서명·iss·aud 검증 → 자체 HS256 JWT 30일). 무상태 Bearer, CSRF 없음, 리프레시 토큰 없음
- API: `GET /v1/quiz/today`, `POST /v1/answers`, `GET /v1/me/progress`, `GET /v1/me/wrong-answers`, `POST /v1/me/attendance/recover`, `GET /v1/leaderboard?period=ALL|DAILY|WEEKLY&limit=`, `POST /v1/disputes`, `POST /v1/ads/app-open-log`. 오류는 ProblemDetail + `code`
- 설정: `DB_URL`/`DB_USERNAME`/`DB_PASSWORD`, `GOOGLE_CLIENT_IDS`, `APP_JWT_SECRET`, `APP_JWT_TTL`
- 테스트 54개 통과(서비스 44, AuthService 5, QuizController WebMvc 5)
- 2026-09-10 코드 검수(전문 리뷰 6종 + 적대적 검토 3종) 반영 완료. 미결 사항은 `PLAN.md`
- 미착수: 관리자용 API, 배지 획득 규칙, 리프레시 토큰, 실제 DB 기동 검증

## 관리자 페이지 (`chamsuri_quiz_admin`)
- 대시보드 / 퀴즈 관리(세트·문제·허용 답안 편집, 대표 답안, 빈칸 미리보기) / 레벨 관리 화면 완료, mock 동작
- `npm run build`, eslint 통과
- 미착수: 백엔드 관리자 API 연동, 관리자 인증

## 모바일 앱 (`chamsuri_quiz`)
- 화면: 로그인(구글 / 개발용 mock), 오늘의 퀴즈(빈칸 미리보기, 힌트 인앱 브라우저, 제출·채점, 이미 푼 문제 표시), 기록(레벨/XP/포인트/연속참여/배지/오답노트 수), 프로필(닉네임·이메일·로그아웃)
- 구글 로그인: `@react-native-google-signin/google-signin` 16.x. `app.config.ts`가 `.env`의 `GOOGLE_IOS_URL_SCHEME`을 config plugin에 주입
- API 클라이언트: Bearer 토큰 자동 첨부, 401이면 세션 정리, ProblemDetail `code`를 `ApiError`로 노출. 응답 타입은 백엔드 DTO와 동일
- App Open Ad 게이팅: 루트 레이아웃에서 콜드 스타트마다 1회 판정(첫 3회 면제, 4시간 간격). AdMob SDK 미연동
- 검증: `tsc --noEmit`, `expo export --platform ios` 통과. `expo lint`는 eslint 설정 설치 프롬프트 문제로 미실행
- 알려진 문제: npm 트리에 react/react-dom peer 불일치가 있어 `--legacy-peer-deps`로 설치 중

## 다음 단계 후보
- Docker 켜고 백엔드 실제 기동 → 앱과 E2E 연결 확인
- 관리자 API(`/v1/admin/quiz-sets`, `/v1/admin/levels`) + 관리자 인증 → 관리자 페이지 연동
- 오답 다시풀기(RETRY) 화면, 리더보드 화면, 이의제기 화면
- AdMob App Open Ad 실 연동, 푸시 알림(`expo-notifications`)
- 배지 획득 규칙, 리프레시 토큰
- 동시성 통합 테스트(Testcontainers)

## 설계 메모
- 답안 입력은 글자별 입력창이 아닌 단일 텍스트 필드 + 시각적 빈칸 표시로 처리 (한글 IME 조합 버그 회피 목적)
- 광고 시청/제휴 클릭이 퀴즈 정답·보상·확률에 영향을 주지 않도록 설계 (법적 리스크 회피)
- 디자인은 별도 단계 없이 기본 스타일로 바로 개발 진행하기로 결정
- 추가 문제(EXTRA) 기능은 2026-09-10 제거. 포인트 사용처는 출석 복구·오답 다시풀기 두 가지
