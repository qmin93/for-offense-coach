# ForOffensiveCoordinator

**한국어** | [English](README.md)

> 코치를 위한 풋볼 플레이 다이어그램 도구

상황 기반 컨셉 추천과 자동 생성 기능으로 3분 안에 전문적인 플레이 다이어그램을 만드세요.

## 빠른 시작

```bash
# 의존성 설치
npm install

# 데이터베이스 설정
npx prisma generate
npx prisma db push

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속

## 주요 기능

### 코어 에디터
- SVG 기반 필드 렌더링 + 드래그 앤 드롭
- Route, Block, Motion, Text, Landmark 액션
- 다중 선택 (Shift+Click) 및 일괄 삭제 (Del/Backspace)
- 복사/붙여넣기 (Ctrl+C/V) - 크로스 탭 지원
- 드래그 시 정렬 가이드
- 실행 취소/다시 실행 (Ctrl+Z/Y)

### 자동 생성 시스템
- 상황 인식 컨셉 추천
- 원클릭 플레이 생성
- 7 on LOS 규칙 포메이션 검증
- 에러/경고 피드백 시스템

### 플레이북 관리
- 태그와 필터가 있는 멀티 섹션 플레이북
- 일별 스케줄링이 있는 Install Plan 생성기
- 드릴 연결 및 코칭 포인트

### 포메이션 패키지
- 12개 이상의 포메이션 프리셋 (Trips, Bunch, Empty 등)
- 인원 표시 (11/12/21)
- 상황 기반 포메이션 추천

### 내보내기 & 공유
- 고해상도 PNG 내보내기 (2배 스케일)
- 10페이지 제한 PDF 내보내기
- Fork 기능이 있는 View-only 공유 링크
- 핀치 줌이 있는 모바일 최적화 뷰어

### 플랜 티어

| 티어 | 플레이 | 플레이북 | 내보내기/월 | 가격 |
|------|--------|----------|-------------|------|
| Free | 5 | 1 | 10 | $0 |
| Team | 50 | 10 | 100 | $19/월 |
| Season | 무제한 | 무제한 | 무제한 | $49/월 |

## 기술 스택

- **프론트엔드**: Next.js 14 (App Router) + React 18
- **스타일링**: Tailwind CSS
- **상태관리**: Zustand
- **데이터베이스**: Prisma + PostgreSQL
- **인증**: NextAuth.js
- **테스팅**: Playwright (E2E)

## 문서

- [MVP 요약](docs/MVP_SUMMARY.ko.md) - 전체 기능 문서
- [DSL 명세](docs/DSL_SPECIFICATION.md) - 플레이 데이터 스키마
- [PRD](docs/PRD.md) - 제품 요구사항
- [User Flow Spec](docs/USER_FLOW_SPEC.md) - 사용자 여정 문서

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── editor/[playId]/    # 플레이 에디터
│   ├── playbook/           # 플레이북 관리
│   └── s/[token]/          # 공유 뷰어
├── components/ui/          # 재사용 가능한 UI 컴포넌트
├── contexts/               # React 컨텍스트 (플랜 티어)
├── domain/
│   ├── dsl/                # DSL 타입과 스키마
│   ├── engine/             # 자동 생성, 컨셉
│   └── render/             # SVG 렌더러
├── features/
│   └── editor/             # 에디터 기능 모듈
│       ├── components/     # 에디터 컴포넌트
│       └── store.ts        # Zustand 스토어
├── hooks/                  # 커스텀 React 훅
└── lib/                    # 유틸리티 (텔레메트리 등)
```

## 테스팅

```bash
# E2E 테스트 실행
npm run test:e2e

# UI와 함께 실행
npm run test:e2e:ui
```

## 스크립트

| 스크립트 | 설명 |
|----------|------|
| `npm run dev` | 개발 서버 시작 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 시작 |
| `npm run lint` | ESLint 실행 |
| `npm run test:e2e` | Playwright E2E 테스트 실행 |

## 환경 변수

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## 라이선스

MIT

---

**MVP 상태: 99%+ 완료**

자세한 기능 문서는 [docs/MVP_SUMMARY.ko.md](docs/MVP_SUMMARY.ko.md)를 참조하세요.
