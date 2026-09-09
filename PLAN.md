# 기획 메모

## 포인트 사용처 전략 (2026-09-07)

포인트(비현금 보상, XP와는 별도 소모성 재화로 검토)를 아래 용도로 사용하는 방향:

1. **출석체크 복구** — 놓친 출석(연속참여 스트릭 등)을 포인트로 복구
2. ~~**추가 문제 풀기** — 오늘의 기본 문제 외에 추가로 10문제 더 풀 수 있게 오픈~~ (2026-09-10 제거 결정)
3. **오답 다시 풀기** — 틀렸던 문제를 다시 풀 수 있게 오픈

## 확인/설계 필요 사항 (다음에 구체화)
- 포인트 획득 경로 (정답 시 지급량, 연속참여 보너스 등)
- 각 사용처별 소모 포인트 비용
- 위 기능들이 게임산업법상 "확률형 보상"이나 "환금성"으로 해석되지 않도록 비현금·비확률 구조 유지 필요 (원본 사업 아이디어 문서의 법적 제약과 연결)
- 서버(백엔드) 쪽에 포인트 잔액/사용 이력 테이블 필요 — `chamsuri_quiz_backend`에서 처리

## SSO 로그인 (2026-09-07, 2026-09-10 업데이트)

지원 예정 소셜 로그인: 최종적으로는 **카카오, 네이버, 구글, 애플**을 목표로 하되, **1차 구현은 구글만** 진행. `AuthProvider` enum으로 확장 가능하게 설계해둠 (`chamsuri_quiz_backend`).

## 확인/설계 필요 사항 (다음에 구체화)
- 구글 OAuth 클라이언트 ID/시크릿 발급 (Google Cloud Console) — iOS/Android/Web 클라이언트 각각 필요
- 카카오/네이버/애플 추가 시점 및 우선순위 (애플은 iOS 앱스토어에 다른 소셜 로그인을 제공하면 Sign in with Apple 필수 포함 요건이 있음 — 정식 출시 전 재확인 필요)
- Expo 앱에서는 `expo-auth-session`으로 구글 OAuth 플로우 처리 후, 백엔드로 idToken 전달 → 서버에서 검증 및 자체 세션/JWT 발급하는 구조로 설계
- 최초 가입 시 필요한 최소 정보(닉네임 등) 별도 온보딩 화면 필요 여부 검토

## 백엔드 엔티티 설계 (2026-09-10)

`chamsuri_quiz_backend`에 1차 엔티티 설계 완료 (`src/main/kotlin/com/chamsuri/quiz/domain/`), Flyway `V1__init_schema.sql`로 스키마 확정. 컴파일 검증 완료.

**확정된 설계 결정**
- XP와 포인트는 완전히 별개 재화. XP는 `UserProgress.totalXp`에 누적만 되고 레벨/리더보드 산정 기준. 포인트는 `UserProgress.totalPoints`(잔액 캐시) + `PointLedger`(적립/차감 이력, 감사 추적용)로 관리.
- 레벨은 `LevelThreshold` 테이블(레벨별 필요 누적 XP)로 관리 — 코드 수정 없이 밸런스 조정 가능하도록. 초기값 1~10레벨 시드 데이터 포함.
- 리더보드는 전체 누적 XP(전체 기간) + 일간/주간 랭킹까지 처음부터 지원하기로 결정. 별도 리더보드 테이블 없이 `AnswerSubmission.xpAwarded`를 `createdAt` 기준으로 집계하는 쿼리로 구현 (성능 이슈 생기면 그때 캐시 테이블 추가 검토).
- 주관식 정답은 `QuestionAnswer`로 문제당 여러 허용 답안(동의어/변형) 등록 가능, 정확히 하나는 `isPrimary=true`. 빈칸 미리보기(단어별 글자수)는 DB에 저장하지 않고 API 계층에서 primary 답안을 공백 기준으로 쪼개 계산.
- 출석 복구/추가 10문제/오답 다시풀기는 `Attendance`(출석 기록 + 포인트 복구 여부) + `AnswerSubmission.submissionType`(DAILY/EXTRA/RETRY)로 구분해 처리.

**엔티티 목록**
- `User`, `SocialAccount`(provider+providerUserId 유니크, 구글만 우선 지원)
- `UserProgress`(XP/레벨/포인트잔액/스트릭), `LevelThreshold`, `Attendance`
- `QuizSet`, `Question`, `QuestionAnswer`, `AnswerSubmission`
- `PointLedger`
- `Badge`, `UserBadge`
- `Dispute`

**확인/설계 필요 사항**
- 배지 획득 조건(연속참여 N일, 정답 수 등) 규칙 정의
- 로컬 Docker Postgres에 실제 마이그레이션 적용/검증은 아직 안 함 (Docker 데몬 미실행 상태였음 — 다음 작업 시 `docker compose up -d` 후 `./gradlew bootRun`으로 검증 필요)

## 백엔드 Service 레이어 규칙 (2026-09-10 확정)

`chamsuri_quiz_backend/src/main/kotlin/com/chamsuri/quiz/service/`에 구현됨.

- **채점 (`AnswerGradingService`)**: 제출 답안과 허용 답안 모두 NFC 정규화 → 공백(전각 공백 포함) 전부 제거 → 소문자 치환 후 완전 일치하면 정답. 프론트는 띄어쓰기를 반영한 한 글자 네모칸 입력 UI를 쓰지만 서버 채점은 공백에 관대함.
- **제출 가능 조건**: 문제가 속한 세트가 `published`여야 하고, DAILY는 세트 날짜가 오늘(KST)일 때만. 유저·문제당 DAILY는 1회(앱 exists 체크 + DB 부분 유니크 인덱스 `uq_answer_submissions_once`).
- **XP/포인트 지급**: DAILY 정답 시 `Question.xpReward`/`pointReward` 지급. RETRY는 정답이어도 지급 없음(포인트로 XP를 재생산하는 어뷰징 방지). XP 변동 시 `LevelThreshold`로 레벨 재계산.
- **RETRY(오답 다시풀기)**: DAILY로 틀렸고 아직 어떤 제출로도 맞히지 못한 문제만 가능. 문제당 10P 차감 후 채점, 맞추면 종료. (틀린 적 없는 문제를 RETRY로 찍어보는 "유료 정답 오라클" 차단)
- **오답노트**: 별도 카운터 없이 제출 기록에서 계산 — DAILY 오답이 있고 정답 제출이 없는 문제 목록(`AnswerSubmissionRepository.findUnresolvedWrongQuestions`).
- **포인트 소모 비용 (`PointCosts`)**: 출석 복구 30P / 오답 다시풀기 문제당 10P. 추후 조정 가능.
- **출석/스트릭 (`AttendanceService`)**: DAILY 제출이 있으면 정답 여부와 무관하게 그날 출석 인정(1일 1건). 스트릭은 출석 기록 전체를 날짜순으로 재계산. 복구는 최근 7일 이내·가입일 이후·오늘 이전 날짜만(스트릭 구매 방지). 기준 시간대 Asia/Seoul.
- **동시성**: XP/포인트를 바꾸는 트랜잭션은 `UserProgressRepository.findByIdForUpdate`(행 잠금)로 시작. `PointService`/`AttendanceService`는 `Propagation.MANDATORY`라 트랜잭션 밖에서 호출하면 즉시 실패. DB에 `total_points >= 0` CHECK.
- **리더보드 (`LeaderboardService`)**: 전체 = `UserProgress.totalXp` 내림차순, 일간/주간 = 해당 기간 `AnswerSubmission.xpAwarded` 합계(닉네임 포함, limit 1~100). 주는 월요일 시작, Asia/Seoul 기준. "오늘"은 `Clock` 빈 주입으로 테스트에서 고정 가능.
- **테스트**: `src/test/kotlin/.../service/` 단위 테스트 37개(채점·포인트·레벨·스트릭/복구·제출 매트릭스), DB 없이 Mockito로 실행. 동시성(행 잠금·유니크 인덱스) 검증은 Docker Postgres 켠 뒤 통합 테스트로 별도 필요.

**결정 (2026-09-10 코드 검수 후)**
- **추가 문제(EXTRA) 기능은 제거.** 포인트 사용처는 출석 복구·오답 다시풀기 두 가지만. (`SubmissionType.EXTRA`, `ExtraQuestionService`, `PointReason.EXTRA_QUESTIONS` 삭제)

**미결 사항 (컨트롤러 단계에서 반드시 처리)**
- REST Controller / 인증(구글 idToken 검증) 레이어 미구현. `spring-boot-starter-security` 기본 설정은 CSRF가 켜져 있고 임시 비밀번호를 로그에 찍으므로 `SecurityFilterChain`을 명시적으로 구성해야 함. `userId`는 항상 인증 주체에서 꺼내고 요청 본문에서 받지 않는다.
- 응답은 엔티티가 아닌 DTO로: `submitAnswer`가 돌려주는 `AnswerSubmission → question → acceptedAnswers`(정답 목록), `findUnresolvedWrongQuestions`의 `Question`, `User.email`이 그대로 직렬화되면 정답 키·개인정보 유출.
- RETRY 재전송 멱등성: 오답 RETRY가 커밋된 뒤 클라이언트가 응답을 잃고 재전송하면 10P가 또 차감됨. 컨트롤러에서 클라이언트 생성 idempotency key를 받아 (user_id, key) 유니크로 막고 원래 응답을 재반환.
- 관리자 저장 검증: 문제마다 비어 있지 않은 답안 최소 1개, hint_url/source_url은 http(s)만, 보상 음수 금지(DB CHECK는 있음).
- 채점 정규화 범위(제품 결정 필요): 지금은 공백 제거 + NFC + 소문자. ZWSP/BOM 같은 서식 문자(Cf)와 전각 영숫자(ＡＢＣ→ABC, NFKC)는 다르게 취급됨 — 붙여넣기 입력을 감안해 Cf 제거·NFKC 채택 여부 결정.
- 레벨 캐시: `UserProgress.level`은 XP 적립 때만 갱신되므로 관리자가 `level_thresholds`를 바꾸면 다음 정답까지 옛 레벨이 보임. 임계값 저장 시 전체 재계산 배치 또는 조회 시 계산으로 전환 검토.
- XP 조정 경로 없음: 이의제기 승인 시 XP를 소급 지급하려면 별도 XP 원장 또는 보정 제출 row가 필요(현재 DAILY 유니크 인덱스가 재제출을 막음). 승인 정책과 함께 설계.
- 탈퇴 유저가 같은 구글 계정으로 재가입하면 `users.email` UNIQUE와 충돌 — 탈퇴 시 이메일 익명화 또는 재활성화 정책 필요.
- 배지 획득 조건 규칙 정의.
- 동시성 통합 테스트(행 잠금·유니크 인덱스·lock_timeout)는 Docker Postgres 켠 뒤 Testcontainers로 추가.

## 관리자 페이지 (2026-09-10)

`chamsuri_quiz_admin` (형제 폴더, Next.js 16 + TypeScript + Tailwind, 비공개 GitHub 저장소).

- 화면: 대시보드 / 퀴즈 관리(날짜별 세트 목록, 문제·힌트·해설·XP·포인트·허용 답안 편집, 대표 답안 지정, 빈칸 미리보기) / 레벨 관리(레벨별 필요 XP 편집, 단조 증가 검증)
- 데이터: `NEXT_PUBLIC_API_BASE_URL` 미설정 시 mock(in-memory)으로 동작. 백엔드에 관리자용 엔드포인트(`/v1/admin/quiz-sets`, `/v1/admin/levels`)는 아직 없음 — 백엔드 Controller 작업 시 함께 추가 필요.
- 관리자 인증 없음 — 배포 전 반드시 추가(백엔드 관리자 계정 또는 구글 로그인 + 허용 이메일 화이트리스트 검토).
