# 개발 진행상황

마지막 업데이트: 2026-09-10

## 프로젝트 개요
참수리퀴즈. 세 개의 형제 저장소로 구성:
- `chamsuri_quiz` — 모바일 앱 (Expo/React Native), public repo
- `chamsuri_quiz_backend` — API 서버 (Spring Boot 4 / Kotlin / PostgreSQL), private repo
- `chamsuri_quiz_admin` — 관리자 페이지 (Next.js 16 / TypeScript), private repo
블로그는 기존에 운영 중.

## 백엔드 (`chamsuri_quiz_backend`)
- 엔티티 13개 + Flyway `V1__init_schema.sql` 완료 (배포 전까지는 V1 직접 수정, 배포 후부터 V2+ 추가 규칙)
- Repository 12개, Service 레이어 완료: 채점(NFC·공백 제거·소문자 비교), XP/레벨업, 포인트 적립·차감(원장 기록), 출석/스트릭/복구, 오답노트(제출 기록 기반), 리더보드(전체/일간/주간). 규칙 상세는 `PLAN.md` 참고
- 2026-09-10 코드 검수(6개 전문 리뷰 + 자동 수정) 반영: 행 잠금·유니크 인덱스로 동시 제출/이중 적립 차단, 오늘 공개 세트만 채점, RETRY는 틀린 문제만, 출석 복구 7일 제한, EXTRA 기능 제거, 엔티티 길이/인덱스 정리
- 적대적 검토(Claude 서브에이전트 + Codex 2종) 반영: 잠금 후 자격 검사·단일 시각 사용, lock/statement timeout, 답안 없는 문제 차단, 중복 예외를 유니크 인덱스 위반에만 매핑, 코드포인트 길이 검증, 공백 제거→NFC 순서, 리더보드 프로젝션·동점 순서·탈퇴 유저 제외, 이의제기가 제출 기록 FK 참조, DB 자격증명 환경변수화
- 단위 테스트 44개 통과(`./gradlew test --tests 'com.chamsuri.quiz.service.*'`). 컨텍스트 로드 테스트와 동시성 통합 테스트는 Docker Postgres 필요
- 백엔드 변경분은 아직 커밋 전(untracked, intent-to-add 상태)
- 미착수: REST Controller, 구글 idToken 검증/JWT 발급, 관리자용 API, 배지 획득 규칙

## 관리자 페이지 (`chamsuri_quiz_admin`)
- 대시보드 / 퀴즈 관리(세트 목록·문제·허용 답안 편집) / 레벨 관리 화면 완료, mock 데이터로 동작
- `npm run build`, eslint 통과
- 미착수: 백엔드 관리자 API 연동, 관리자 인증

## 모바일 앱 (`chamsuri_quiz`)

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
