# ForOffensiveCoordinator MVP - 전체 기능 요약 v2.0

**한국어** | [English](MVP_SUMMARY.md)

> 최종 업데이트: 2026-01-18

## 개요

ForOffensiveCoordinator는 코치를 위한 풋볼 플레이 다이어그램 도구입니다. 상황 인식 컨셉 추천과 자동 생성 기능으로 3분 안에 전문적인 플레이 다이어그램을 만들 수 있습니다.

---

## 코어 기능

### 1. 플레이 에디터

| 기능 | 상태 | 비고 |
|------|------|------|
| SVG 기반 필드 렌더링 | 완료 | FIELD_WIDTH/HEIGHT 상수 |
| 플레이어 드래그 앤 드롭 | 완료 | 11명 배치 |
| 액션 시스템 | 완료 | Route, Block, Motion, Text, Landmark |
| 다중 선택 (Shift+Click) | 완료 | selectedPlayerIds[], selectedActionIds[] |
| 일괄 삭제 (Del/Backspace) | 완료 | removeSelectedActions() |
| 복사/붙여넣기 (Ctrl+C/V) | 완료 | useClipboard 훅, 크로스 탭 지원 |
| 정렬 가이드 | 완료 | 드래그 시 스냅 가이드 |
| 실행 취소/다시 실행 (Ctrl+Z/Y) | 완료 | History 스택 |
| 플레이어 그룹화 (OL/Backs/WR) | v1.1 | 현재는 개별 선택만 |
| WR 스플릿 프리셋 (Wide/Slot) | v1.1 | 정렬 가이드로 대체 |

### 2. 자동 생성 시스템

| 기능 | 상태 | 비고 |
|------|------|------|
| 컨셉 기반 자동 생성 | 완료 | buildPlayFromConcept() |
| 포메이션 검증 | 완료 | 필수 역할 체크 |
| 스플릿 리시버 체크 | 완료 | 7 on LOS 규칙 |
| 에러/경고 시스템 | 완료 | BuildError, warnings[] |
| Replace vs Append | 완료 | Append + Undo 정책 (기존 액션 유지) |

### 3. 추천 패널

| 기능 | 상태 | 비고 |
|------|------|------|
| 상황 기반 추천 | 완료 | playType, boxCount, front |
| Why 설명 (3줄) | 완료 | reasons[] |
| Install Focus 연결 | 완료 | drills, coachingPoints |

---

## 플레이북 시스템

### 4. 플레이북 관리

| 기능 | 상태 | 비고 |
|------|------|------|
| 멀티 섹션 플레이북 | 완료 | sections[] with plays |
| 태그 & 필터 | 완료 | 태그 기반 조직 |
| 플레이 통계 | 완료 | 사용량 추적 |
| 플레이북 목록 뷰 | 완료 | /playbooks 라우트 |

### 5. Install Plan 생성기

| 기능 | 상태 | 비고 |
|------|------|------|
| 일별 계획 | 완료 | Install 스케줄 |
| 코칭 강조점 | 완료 | 세션별 포커스 포인트 |
| 드릴 링크 | 완료 | 컨셉에 연결 |
| 시즌 엔티티 | Non-goal | MVP는 주 단위만 |

---

## 포메이션 시스템

### 6. 포메이션 패널

| 기능 | 상태 | 비고 |
|------|------|------|
| 포메이션 프리셋 | 완료 | 12개 이상 템플릿 |
| 인원 표시 | 완료 | 11/12/21 등 |
| 상황 기반 추천 | 완료 | 컨텍스트 인식 |

### 7. 포메이션 패키지

| 패키지 | 설명 | 상태 |
|--------|------|------|
| Trips | 한 쪽에 3 WR | 완료 |
| Bunch | 밀집 클러스터 | 완료 |
| Empty | RB 없음 | 완료 |
| 12 Personnel | 1 RB, 2 TE | 완료 |
| Motion-based | 프리 스냅 모션 | 완료 |

> 같은 철학, 다른 대응 - 패키지별 추천 이유 설명 포함

---

## 데이터 & 영속성

### 8. 자동 저장 시스템

| 기능 | 상태 | 비고 |
|------|------|------|
| 로컬 드래프트 | 완료 | localStorage 폴백 |
| 클라우드 동기화 | 완료 | 온라인 시 서버 동기화 |
| 오프라인 지원 | 완료 | 오프라인 작업 가능 |
| 충돌 해결 | 완료 | 로컬/서버 충돌 처리 |

### 9. 저장 상태 인디케이터

| 상태 | 시각 | 구현 |
|------|------|------|
| Saved | 녹색 체크마크 | 완료 |
| Saving | 스피너 | 완료 |
| Unsaved | 노란색 경고 | 완료 |
| Offline | 회색 아이콘 | 완료 |

---

## 내보내기 & 공유

### 10. 내보내기 시스템

| 기능 | 상태 | 비고 |
|------|------|------|
| PNG 내보내기 | 완료 | 2배 스케일, 고해상도 |
| PDF 내보내기 | 완료 | 플레이북 PDF |
| 10페이지 제한 | 완료 | 플랜 티어별 |
| 텔레메트리 추적 | 완료 | export_png, export_pdf |
| 플랜 제한 체크 | 완료 | maxExports |
| 오버레이 옵션 | 완료 | Defense/Landmarks 토글 |

### 11. 공유 시스템

| 기능 | 상태 | 비고 |
|------|------|------|
| View-only 링크 | 완료 | 토큰 기반 |
| View + Download | 완료 | 플랜 티어별 권한 |
| Fork 기능 | 완료 | 자신의 워크스페이스로 복사 |
| 워터마크 | 완료 | "Shared via ForOffenseCoach" |
| 출처 표시 | 완료 | "Powered by ForOffenseCoach" |

### 12. 공유 뷰어 (모바일 최적화)

| 기능 | 상태 | 비고 |
|------|------|------|
| 터치 제스처 | 완료 | useTouchGestures 훅 |
| 핀치 줌/팬 | 완료 | 0.5배 - 3배 스케일 |
| 전체 화면 모드 | 완료 | 모바일 전체 화면 |
| 뷰 옵션 | 완료 | Defense/Labels/Landmarks |

---

## 수익화

### 13. 플랜 티어 시스템

| 티어 | 플레이 | 플레이북 | 내보내기 | 컨셉 | 다운로드 공유 |
|------|--------|----------|----------|------|---------------|
| Free | 5 | 1 | 10/월 | Core 15 | View only |
| Team | 50 | 10 | 100/월 | +Team Pack | 가능 |
| Season | 무제한 | 무제한 | 무제한 | All Packs | 가능 |

### 14. 사용량 추적

| 컴포넌트 | 설명 | 상태 |
|----------|------|------|
| PlanBadge | 현재 티어 표시 | 완료 |
| UsageIndicator | 사용량 Progress bar | 완료 |
| UpgradePrompt | 제한 도달 시 모달 | 완료 |

### 15. 컨셉 팩

| 팩 | 컨셉 | 가격 | 상태 |
|----|------|------|------|
| Core | 15개 기본 | 무료 | 완료 |
| Team | +15개 | $19/월 | 완료 |
| Season | 전체 | $49/월 | 완료 |

---

## 분석 & 텔레메트리

### 16. 텔레메트리 시스템 (24개 이벤트)

```
Pre-Context:     intent_selected, context_initialized, context_adjusted
Onboarding:      onboarding_completed, onboarding_skipped, first_play_created
Suggestions:     suggestions_opened, concept_clicked, why_viewed
Formation:       formation_reco_shown, formation_reco_selected, formation_applied
Auto-build:      autobuild_success, autobuild_fail, undo_after_autobuild
Validation:      validation_error_viewed, export_blocked_by_validation
Export:          export_png, export_pdf, export_overlay_mode_selected
Share:           share_link_created, share_view_opened, fork_created
Install Focus:   install_focus_opened, drill_video_clicked
```

### 17. 세션 추적

| 기능 | 상태 |
|------|------|
| Session ID | 완료 |
| Debounce/Dedup | 완료 |
| Error Reporting | 완료 (Sentry 준비) |
| KPI Dashboard | 완료 |

---

## DSL 명세

### 18. 좌표계

```
+----------------------------------+
|          OFFENSE (+Y)            |
|               ^                  |
|               |                  |
|  <----------- LOS ------------>  |  y = 0
|            (y = 0)               |
|               |                  |
|               v                  |
|          DEFENSE (-Y)            |
+----------------------------------+

x: 0.0 (왼쪽) -> 1.0 (오른쪽)  // 정규화
y: 0.0 (LOS) -> +/-0.5 (엔드존)
```

### 19. 스키마 버전관리

| 속성 | 값 | 비고 |
|------|-----|------|
| schemaVersion | "1.0" | MVP 고정 |
| Migration | 연기 | v1.1 예정 |

```typescript
interface Play {
  schemaVersion: "1.0";  // MVP 고정
  id: string;
  name: string;
  players: Player[];
  actions: Action[];
  // ...
}
```

---

## 품질 보증

### 20. E2E 테스트 (Playwright)

| 테스트 파일 | 커버리지 |
|-------------|----------|
| activation-flow.spec.ts | 온보딩 -> 첫 플레이 |
| editor.spec.ts | 에디터 전체 기능 |
| export.spec.ts | PNG/PDF 내보내기 |
| mobile.spec.ts | 모바일 UX |
| suggestions.spec.ts | 추천 시스템 |

### 21. 검증 시스템

| 레벨 | 설명 | 상태 |
|------|------|------|
| Error | 차단 (내보내기 불가) | 완료 |
| Warning | 경고 (내보내기 가능) | 완료 |
| Info | 정보 | 완료 |

---

## KPI 목표

| 지표 | 목표 | 측정 |
|------|------|------|
| 활성화율 | 30%+ | 방문 -> 첫 플레이 생성 |
| 3분 컷 성공률 | 50%+ | Landing -> Auto-build -> Export <= 3분 |
| Day-7 리텐션 | 20%+ | 7일 후 재방문 |
| 내보내기율 | 50%+ | 플레이 생성 -> 내보내기 |
| Free -> Paid | 5%+ | 유료 전환율 |

---

## 명시적 Non-Goal (MVP 제외)

| 기능 | 이유 | 목표 버전 |
|------|------|-----------|
| 플레이어 그룹화 (OL/WR 단위) | 다중 선택으로 대체 | v1.1 |
| WR 스플릿 프리셋 버튼 | 정렬 가이드로 대체 | v1.1 |
| 기존 액션 교체 옵션 | Append + Undo 정책 채택 | - |
| 시즌 엔티티 | MVP는 주 단위만 | v2.0 |
| DSL 마이그레이션 | schemaVersion 1.0 고정 | v1.1 |
| 주간 콘텐츠 루프 | 컨셉 팩으로 대체 | v1.1 |

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프론트엔드 | Next.js 14 (App Router) + React 18 |
| 스타일링 | Tailwind CSS |
| 상태관리 | Zustand |
| 데이터베이스 | Prisma + PostgreSQL |
| 인증 | NextAuth.js (준비됨) |
| 테스팅 | Playwright (E2E) |
| 텔레메트리 | Custom + KPI Dashboard |

---

## 최종 통계

| 지표 | 값 |
|------|-----|
| 변경된 파일 | 36+ |
| 추가된 라인 | ~4,000+ |
| 이벤트 타입 | 24 |
| 테스트 파일 | 5 |
| MVP 완성도 | 99%+ |
