# PRD — Football Playbook Builder & Concept Recommender (ForOffenseCoach)
버전: v1.0 (MVP)  
기반 문서: User Flow Spec v1.0 (Activation / Formation→Concept 추천 / Export / Share/Fork 흐름)  
작성 목적: MVP 범위, 요구사항, 성공 기준, 우선순위를 **고정**하여 스코프 폭발을 차단한다.

---

## 0) Executive Summary (한 페이지 요약)

### 제품 한 줄 정의
**미식축구 코치가 “플레이를 그리는 시간”과 “플레이 아이디어 탐색 시간”을 줄이는 온라인 플레이북 제작 SaaS**  
핵심 차별: **Formation → Pass/Run Concept 추천 → 클릭 즉시 다이어그램 자동 생성 → 출력/공유**

### MVP에서 반드시 증명해야 할 것(Proof)
1) 코치가 **3분 안에 첫 플레이를 만들고 PNG를 뽑을 수 있다** (Activation)
2) 코치가 **Formation에서 가능한 컨셉을 빠르게 탐색**하고 클릭으로 생성한다 (추천 체감)
3) 코치가 **플레이북을 PDF로 출력**하고 팀에 공유할 수 있다 (현장성)
4) 코치가 **플레이별 Install Focus를 확인**하고 연습 연결까지 한다 (실행 보장)

### MVP에서 절대 하지 말 것(Non-goals)
- “AI가 정답을 고르는 추천” / 성공률 예측 / 애니메이션 / 수비 자동 대응 / 실시간 공동편집

---

## 1) Problem Statement (문제 정의)

### 1.1 사용자가 겪는 핵심 문제
- 코치의 플레이 제작은 범용 드로잉 툴(PPT/Figma/draw.io)로는 느리다.
- 플레이북은 파일로 흩어져 관리/버전/공유/출력이 비효율적이다.
- "이 포메이션에서 어떤 패스 조합/런 컨셉이 가능한지" 탐색이 번거롭다.
- 기존 대안은 **도메인 문법(포지션/루트/블로킹/모션)을 객체로 다루지 못함**.
- **플레이 설계와 연습이 단절**되어 있다: 플레이는 만들었지만 "어떻게 가르칠지"는 별개 작업.

### 1.2 근본 원인(Root Cause)
- 다이어그램은 “그림”이 아니라 **미식축구 문법(DSL)** 이다.
- DSL이 없으면:
  - 편집 속도 개선 불가
  - 추천 엔진 구축 불가
  - 출력/버전/공유 파이프라인이 취약

---

## 2) Goals & Success Metrics (목표 및 성공 지표)

### 2.1 MVP 제품 목표(Goals)
G1. **Speed**: 코치가 플레이 1개를 “빠르게” 만들 수 있다.  
G2. **Guidance**: Formation 기반으로 Pass/Run 컨셉 후보를 “좁혀” 보여줄 수 있다.  
G3. **Field-readiness**: 플레이북을 “출력/공유”하여 현장에서 쓸 수 있다.

### 2.2 성공 지표(KPIs) — 반드시 측정
- Activation:
  - `first_play_created_rate` (가입 후 24시간 내 첫 플레이 생성 비율)
  - `time_to_first_play` (목표: 3분 이내 중앙값)
  - `first_export_png_rate` (첫 세션 내 PNG export 비율)
- Recommendation:
  - `suggestions_opened_rate`
  - `concept_click_rate` (추천 패널 열기 대비 컨셉 클릭 비율)
  - `auto_build_success_rate` (자동 생성 성공률)
  - `undo_after_autobuild_rate` (품질 지표: 너무 높으면 추천 불신/자동생성 품질 문제)
- Output/Sharing:
  - `export_pdf_rate` (플레이북 생성 대비)
  - `share_link_created_rate`
  - `fork_rate`
- Retention:
  - Weekly Active Coaches(WAC)
  - 7-day retention (초기 목표: 20~30% 수준 가정)

---

## 3) Personas & Use Cases (사용자/유스케이스)

### 3.1 Primary Persona: 오펜스 코디(OC)
- 주 업무: 플레이 설계, 플레이북 관리, 설치/프린트 준비
- 핵심 가치: 시간 단축, 출력, “가능한 선택지” 확보

### 3.2 Secondary: 포지션 코치(QB/WR/OL)
- 주 업무: 플레이 디테일 수정, 코칭 포인트 작성, 공유

### 3.3 Viewer: 선수/스태프(View-only)
- 주 업무: 링크로 플레이 확인

### 3.4 대표 유스케이스(상위 6개)
1) 컨셉을 클릭해 자동 생성하고 빠르게 내보낸다 (Activation)
2) 포메이션에서 가능한 패스 컨셉을 훑고 하나를 채택한다
3) 박스/프론트만 입력하고 런 후보 Top5를 받는다
4) 플레이를 모아 플레이북을 구성하고 PDF로 출력한다
5) 링크로 공유하고 다른 코치가 Fork 한다
6) 템플릿(컨셉 라이브러리)을 복제하여 우리 팀 버전으로 만든다

---

## 4) Principles (제품 원칙)

P1. **추천은 판단이 아니라 필터링**이다.  
P2. 자동 생성은 항상 **Undo**를 동반한다.  
P3. “많이”가 아니라 “**줄여서**” 보여준다(추천 결과 8~12).  
P4. 출력/공유가 MVP의 1급 기능이다(현장성).  
P5. 도메인 모델(DSL)이 제품의 핵심 IP다.

---

## 5) Scope (MVP 범위)

### 5.1 MVP Feature List (Must Have)
A. **Editor Core**
- Formation 프리셋 선택 및 자동 배치
- 포지션 팔레트 배치/이동(스냅 포함)
- 모드 분리: Select / Route / Block / Motion / Text
- Undo/Redo (최소 50스텝)
- Auto-save + 로컬 드래프트(네트워크 실패 대비)

B. **Concept Library**
- Pass Concepts 20개 (초기 고정 세트)
- Run Concepts 20개 (초기 고정 세트)
- 컨셉 카드: 이름/1줄 요약/배지(NFL-style)/Build 버튼

C. **Suggestions (추천)**
- Pass Suggestions: Formation 기반 매핑 + 필터(Quick/Dropback/Screen 토글)
- Run Suggestions: 입력 4개 토글(박스/프론트/3T/strength) + Top5 + 근거3줄
- 컨셉 클릭 → 자동 생성(Auto-build) + Undo 토스트

D. **Playbook**
- Playbook 생성/섹션/정렬/태그(최소)
- 플레이 추가(내 플레이/템플릿/공유)
- PDF Export (페이지네이션, 목차 옵션은 후순위)

E. **Export / Share**
- PNG export (고해상도)
- Share link 생성(View-only)
- Fork to my workspace

F. **Auth / Workspace**
- Personal workspace 기본
- Team workspace(간단): 멤버 초대(이메일), 권한(Owner/Editor/Viewer)

G. **Install Focus (Drill 추천)**
- 플레이별 실패 포인트(Failure Point) 3개 자동 매핑
- 각 포인트에 드릴 이름/목적/연습 단계 표시
- Instagram 영상 레퍼런스 연결 (링크만, 호스팅 ❌)
- 읽기 전용 (수정/편집 불가)

---

## 6) Non-goals (이번 릴리즈에서 금지)
- 플레이 성공률, 기대야드, AI 평가 점수
- 수비 자동 생성/수비 대응 자동 추천
- 애니메이션 재생
- 실시간 공동편집(동시 편집)
- 고급 스카우팅(상대 tendency 자동 분석)
- 경기 필름 연동
- **Drill 에디터/편집 기능**
- **Drill 스케줄러/성취도 트래킹**
- **Drill 플레이북 (별도 관리)**

---

## 7) User Stories (User Flow Spec 기반 상세)

### 7.1 Activation (A-Flow)
**US-A1**: 신규 OC로서, 템플릿 컨셉을 클릭해 1초 내 플레이가 자동 생성되길 원한다.  
- AC:
  - 컨셉 클릭 후 1초 내 캔버스에 액션 렌더
  - 플레이 이름은 자동 생성되며, 사용자는 나중에 바꿀 수 있음
  - 생성 직후 Undo 토스트 노출

**US-A2**: 신규 사용자로서, 첫 세션에서 PNG를 뽑아보고 싶다.  
- AC:
  - Export PNG 버튼은 상단 고정
  - PNG 해상도/텍스트 깨짐 없음

### 7.2 Formation 기반 제작 (B-Flow)
**US-B1**: OC로서 포메이션을 고르면 선수들이 자동 배치되길 원한다.  
- AC:
  - Formation 선택 즉시 필드에 배치(OL 간격 규칙 포함)
  - Reset Formation 가능

**US-B2**: OC로서 Route/Block/Motion을 모드로 구분해 빠르게 편집하길 원한다.  
- AC:
  - 모드 전환이 명확
  - 모드별 커서/툴팁 제공

### 7.3 Suggestions (C-Flow)
**US-C1 (Pass)**: OC로서 현재 포메이션에서 가능한 패스 컨셉만 보고 싶다.  
- AC:
  - 추천 결과 8~12개
  - 카테고리(Quick/Intermediate/Deep/Screens)로 그룹
  - 컨셉 카드 클릭 시 자동 루트 배치

**US-C2 (Run)**: OC로서 수비 박스/프론트만 입력하면 런 후보 Top5를 받고 싶다.  
- AC:
  - box/front는 필수, 미입력 시 입력 UI 강제
  - 결과에 근거 3줄(고정 템플릿) 노출
  - 클릭 시 블로킹 스킴 자동 생성

### 7.4 Playbook / Export / Share (D/E-Flow)
**US-D1**: OC로서 플레이를 모아 플레이북을 만들고 PDF로 출력하고 싶다.  
- AC:
  - 섹션 생성/정렬 가능
  - PDF 10장 생성 가능
  - include notes 옵션 제공

**US-E1**: 다른 코치에게 링크로 공유하고, 그가 Fork 해서 자신의 버전을 만들게 하고 싶다.
- AC:
  - 링크는 view-only
  - Fork 버튼은 로그인 유저에게만
  - Fork 시 원본 출처 메타 저장

### 7.5 Install Focus (F-Flow)
**US-F1**: OC로서 플레이를 만든 후 "이걸 어떻게 가르칠지" 바로 파악하고 싶다.
- AC:
  - Install Focus 패널에서 실패 포인트 3개 확인
  - 각 포인트에 드릴 이름/목적/연습 단계 표시
  - Instagram 영상 링크 클릭 시 외부로 이동

**US-F2**: 포지션 코치로서 해당 드릴의 영상 레퍼런스를 빠르게 확인하고 싶다.
- AC:
  - 영상 썸네일 + 출처 계정명 표시
  - 클릭 시 Instagram 앱/웹으로 바로 이동

---

## 8) Functional Requirements (기능 요구사항 상세)

## 8.1 Editor Requirements
### 8.1.1 Canvas & Rendering
- SVG 기반 렌더(벡터 품질 확보)
- Field 레이어: hash/LOS/yard lines on/off
- Entities:
  - Player nodes(아이콘+라벨)
  - Actions:
    - Route (solid/arrow, control points)
    - Block (solid arrow, target optional)
    - Motion (dashed)
    - Notes(Text)

### 8.1.2 Object Manipulation
- Select:
  - 단일/다중 선택(Shift)
  - 드래그 이동
  - delete
  - copy/paste (Ctrl+C/V)
- Snap:
  - hash/LOS
  - OL spacing
  - WR split presets
- Undo/Redo:
  - 상태 스냅샷 or 명령 기반(구현 선택)
  - 최소 50스텝

### 8.1.3 Autosave
- 변경 발생 → debounce 1초 → 저장
- 네트워크 장애:
  - “Local draft saved” 표시
  - 재연결 시 sync 시도

---

## 8.2 Concept Library Requirements
### 8.2.1 Concept Data Model (요구 수준)
- Concept id
- type: pass/run
- required receivers / required personnel hints
- recommended formations tags
- roles template:
  - pass: route roles (clear/under/flat/etc)
  - run: blocking scheme roles (down/reach/pull/trap)
- 1-line description
- badges: nfl_style, college_common 등 (브랜딩 오해 방지)

### 8.2.2 UI
- 필터: pass/run, formation fit
- 카드: name/summary/badge/build

---

## 8.3 Suggestions Requirements
### 8.3.1 Pass Suggestions (v1)
- Input:
  - current formation id
  - eligible receivers count (현재 배치에서 계산)
  - toggles: quick/dropback/screen
- Logic:
  - formation → allowed concepts mapping table
  - filter by eligible receiver count
- Output:
  - 8~12 concepts
  - grouped categories

### 8.3.2 Run Suggestions (v1)
- Input:
  - box (required): 6/7/8
  - front (required): odd/even
  - 3T: strong/weak/none
  - strength: strong/weak
- Logic:
  - filter concepts by feasibility
  - score concepts:
    - numbers_fit
    - angle_fit (3T side, front)
    - surface_fit (TE/Trips surface)
- Output:
  - top 5 concepts
  - reason lines 3 (Numbers/Angle/Surface)

### 8.3.3 Auto-build
- Upon click:
  - generate actions into current play
  - show Undo toast
  - conflict policy:
    - default: add as new layer
    - optional: replace existing actions (confirm)

---

## 8.4 Playbook Requirements
- Create playbook: title(required), tags(optional)
- Sections(folders): create/rename/reorder
- Add plays:
  - from my plays
  - from templates
  - from shared
- Export PDF:
  - page style (classic/minimal)
  - include notes toggle
  - footer play name + page #

---

## 8.5 Share/Fork Requirements
- Share link:
  - view-only URL
  - permission: view-only (MVP 고정)
- Viewer page:
  - play list(있을 경우)
  - zoom/pan
- Fork:
  - requires login
  - creates copy in user workspace
  - preserves attribution metadata

---

## 8.6 Auth/Workspace Requirements
- Personal workspace default
- Team workspace:
  - invite by email
  - roles: owner/editor/viewer
  - sharing within team

---

## 8.7 Install Focus (Drill 추천) Requirements

### 8.7.1 Drill 데이터 구조
- Concept에 매핑됨 (Play 개별 매핑 ❌)
- 읽기 전용 (사용자 수정 불가)
- 1 Concept당 최대 3 Failure Points

### 8.7.2 Failure Point 구조
```
- failurePointId
- name: "Puller timing & path"
- drill:
  - name: "Pull & Kick Drill"
  - purpose: "Guard가 pull 후 kick 타이밍 연습"
  - phase: "indy" | "group" | "team"
- videoRefs[]:
  - platform: "instagram"
  - url: string
  - thumbnailUrl: string (optional, 캐시)
  - accountName: "@coachX"
  - hashtags: ["#pullblock", "#olinedrill"]
```

### 8.7.3 Instagram 연동 원칙
- 영상 호스팅 ❌ (법적/기술적 리스크)
- 썸네일 + 외부 링크만 제공
- 해시태그 기반 수집: `#counterdrill`, `#floodconcept`
- 클릭 시 Instagram 앱/웹으로 이동 (임베드 선택적)

### 8.7.4 UI 요구사항
- Play Editor 하단/사이드바에 "Install Focus" 탭
- Failure Point 3개 리스트 형태
- 각 포인트에 드릴 정보 + 영상 카드 표시
- 영상 카드: 썸네일 + 계정명 + 클릭 시 외부 이동

---

## 9) Data Model Requirements (MVP 수준 정의)
> DSL Spec에서 더 상세화할 것이며, PRD에서는 요구 수준만 명시한다.

### 9.1 Play
- id, name, tags[], formationId, conceptId(optional)
- players[] (role, x,y, label)
- actions[] (route/block/motion/text)
- notes
- createdBy, updatedAt, version

### 9.2 Playbook
- id, name, sections[]
- sections: {name, playIds[]}
- export settings snapshot

### 9.3 Concept
- id, type, name, summary
- templates (roles/actions blueprint)
- mapping metadata (formations, required receivers)

---

## 10) UX Requirements (정밀)

### 10.1 “Speed”를 위한 UX 강제 조건
- 모드 분리 필수
- 추천 결과 제한(12개 이하)
- 자동생성 후 즉시 Undo 제공
- naming은 optional(자동 이름 제공)

### 10.2 “Trust”를 위한 UX 강제 조건
- 추천은 “정답” 표현 금지
- Run 추천은 “근거 3줄” 고정
- NFL 관련은 “NFL-style” 배지로만 (팀/경기 재현 금지)

---

## 11) Telemetry / Analytics Plan
필수 이벤트(최소):
- signup_complete
- first_play_created
- formation_selected
- suggestions_opened
- pass_concept_clicked
- run_inputs_set (box/front/3T/strength)
- run_concept_clicked
- auto_build_completed / auto_build_failed
- undo_after_autobuild
- export_png / export_pdf
- share_link_created
- fork_play
- install_focus_opened
- drill_video_clicked

---

## 12) Prioritization (MoSCoW)

### Must
- Editor core + Undo/Redo + Autosave
- Concept library 40개(패스20/런20)
- Suggestions(pass+run) + auto-build
- Export PNG
- Playbook + Export PDF
- Share link + Fork
- **Install Focus (Failure Point 3개 + Drill 표시 + 영상 링크)**

### Should
- Tagging UX 개선(빠른 필터)
- Playbook 목차/표지 템플릿
- “Reset formation” 개선(세부 옵션)

### Could
- Play 스타일 테마(필드 그리드 on/off)
- 컨셉 팩 마켓(추후)
- 코칭 포인트 템플릿

### Won't
- 애니메이션/AI 평가/수비 자동 대응/동시편집
- Drill 에디터/Drill 스케줄러/성취도 트래킹

---

## 13) Milestones (출시 기준)

### M0 — Prototype (내부)
- Formation 프리셋 + players 배치
- route/block/motion 최소 구현
- 로컬 저장 + PNG export

### M1 — MVP Alpha (클로즈드 테스트: 코치 5~10명)
- Pass Suggestions + auto-build
- Run Suggestions(박스/프론트 입력) + auto-build
- Playbook 생성 + PDF export 1차
- Share/Fork 기본

### M2 — MVP Public
- 안정화(Undo/Redo, export 품질)
- Team workspace(초대/권한) 최소
- 텔레메트리 대시보드(핵심 지표)

---

## 14) Risks & Mitigations (리스크/대응)

R1. 추천 신뢰 부족  
- 대응: “정답” 금지 + 근거 3줄 + Undo 항상 제공 + 결과 제한

R2. 스코프 폭발  
- 대응: Non-goals 명문화 + MVP 기능 외 요청은 다음 릴리즈

R3. 에디터 유지보수 지옥  
- 대응: DSL 중심 + 모드 분리 + 명령 기반 Undo 고려

R4. 저작권/브랜드 오해(NFL)  
- 대응: 팀/경기 특정 재현 금지, “NFL-style” 태그만

R5. 결제 전환 낮음  
- 대응: Team/Season 플랜 중심, export/share를 유료 기능으로 단계적 제한(후속 실험)

---

## 15) Open Questions (결정 필요 항목)
> 질문을 사용자에게 되묻기 위한 섹션이 아니라, 내부 결정 리스트다.

1) SVG vs Canvas 최종 결정(현재는 SVG 가정)
2) PDF export를 클라이언트에서 할지 서버에서 할지
3) Team 플랜에서 Viewer의 PDF 다운로드 허용 여부
4) 컨셉 40개 초기 세트의 “표준 템플릿” 스타일(아이콘/화살표 규칙)
5) 추천 충돌 정책의 기본값(Add layer vs Replace)

---

## 16) Acceptance Criteria (MVP 출시 체크리스트)
- [ ] 신규 사용자: 가입→컨셉 클릭→자동 생성→PNG export까지 3분 내 가능
- [ ] Pass Suggestions: formation 기반 8~12개 제한, 자동 생성 1초 내
- [ ] Run Suggestions: box/front 필수, Top5 + 근거3줄 표시, 자동 생성 1초 내
- [ ] Undo/Redo: 모든 편집에 적용, 최소 50스텝
- [ ] Auto-save: 네트워크 끊겨도 로컬 드래프트 유지
- [ ] Playbook: 섹션 구성 + PDF export 10장 정상
- [ ] Share/Fork: view-only 링크 + fork 후 편집 가능
- [ ] Install Focus: 플레이별 Failure Point 3개 + Drill 정보 표시
- [ ] Install Focus: Instagram 영상 링크 클릭 시 외부 이동 정상
- [ ] 텔레메트리: 핵심 이벤트 최소 12개 수집 확인 (install_focus 포함)

---

# 최종 결론 (MVP 판결)
이 PRD의 MVP는 "예쁜 드로잉 툴"이 아니라
**Formation→Concept 추천 + 클릭 생성 + Install Focus + 출력/공유**로 코치의 시간을 줄이는 제품이다.
성공 여부는 기능 추가가 아니라, **속도/신뢰/출력/실행 연결** 4요소를 MVP에서 증명하느냐에 달려 있다.

> **핵심 전환**: Install Focus가 있으면 ForOffenseCoach은 "설계 툴"이 아니라
> **"오늘 밤 설계 → 내일 연습까지 연결해주는 코치 툴"**이 된다.
