# User Flow Spec (UFS) — Football Playbook Builder & Concept Recommender (ForOffenseCoach)
버전: v1.0 (MVP 기준)  
작성 목적: 코치(OC)가 “플레이를 만들고, 추천을 받고, 출력/공유”하는 전 과정을 **UX 흐름과 상태 전이**로 고정한다.  
원칙: **빠르다(속도)** / **틀리지 않는다(문법)** / **출력 가능하다(현장성)**

---

## 0) 문서 범위 / 비범위

### 0.1 범위 (In Scope: MVP)
- 온라인 에디터(SVG 기반 가정)에서 플레이 다이어그램 생성/수정
- Formation 프리셋 선택 및 선수 배치
- Pass/Run Concept 추천(정답 제시가 아닌 “가능 후보 지도”)
- 컨셉 클릭 → 자동 생성 → 코치 수정
- Export: PNG / PDF(플레이북)
- Share: 링크 공유(View-only), Fork(복제) 가능
- Team 워크스페이스(최소): 개인/팀 공간 구분 + 공유 권한(간단)

### 0.2 비범위 (Out of Scope: MVP에서 금지)
- 성공률 예측, 플레이 평가 점수, AI 장문 리포트
- 수비 자동 생성/자동 대응/풀 시뮬레이션
- 애니메이션(선수 이동 재생), 영상 태깅, 플레이콜 시뮬레이션
- 동시 편집(실시간 Google Docs 수준)
- 고급 분석(다운/거리별 효율, tendency 분석)

---

## 1) 핵심 사용자 / 목표

### 1.1 Primary Persona: 오펜스 코디(OC)
- 목적: **짧은 시간**에 플레이를 만들고 플레이북에 넣고 출력/공유
- 특징: 밤늦게 작업, 시간이 부족, 완성도보다 “현장 사용 가능”이 중요

### 1.2 Secondary Persona: 포지션 코치(QB/WR/OL)
- 목적: 기존 플레이를 열어 세부 수정, 주석, 출력

### 1.3 Tertiary Persona: 선수(View-only)
- 목적: 링크로 플레이북/플레이 확인(편집 불가)

---

## 2) UX 성능 목표(정량)
- Time-to-first-play: 가입 후 **3분 이내** 첫 플레이 생성 완료
- Time-to-draw-core-run: Inside Zone/Power/Counter **30초 내 생성**
- 추천 → 자동생성 체감: 클릭 후 **1초 내** 다이어그램 생성
- Export: PNG 3초 이내, PDF(10장) 10초 이내(환경 의존)

---

## 3) 정보 구조(IA) / 내비게이션

### 3.1 최상위 네비게이션
- Dashboard
  - Recent Plays
  - Recent Playbooks
  - Templates/Concept Library
- Playbooks
- Plays
- Concept Library
  - Pass Concepts
  - Run Concepts
- Team(Team 플랜에서 노출)
  - Members
  - Roles/Permissions
- Settings

### 3.2 기본 엔터티
- Play (단일 다이어그램)
- Playbook (플레이 모음 + 목차/출력 설정)
- Concept (패스/런 템플릿)
- Formation (프리셋 배치 규칙)
- Team Workspace (공유/권한)

---

## 4) 공통 UX 규칙(에디터 전역)

### 4.1 모드(Mode) — 반드시 분리 (MVP 필수)
- Select: 선택/이동/리사이즈/그룹
- Route: 루트 생성/수정(컨트롤포인트)
- Block: 블로킹 화살표 생성/대상 지정
- Motion: 프리스냅 모션 점선 경로
- Text/Note: 주석/콜네임

> 모드 없는 “자유 드로잉”은 금지. 코치 속도/정확성이 떨어짐.

### 4.2 스냅(Snap) & 가이드(Guide)
- LOS, Hash, Numbers(필드 라인) 스냅
- OL 정렬 프리셋(센터 기준, 가드/태클 간격 고정)
- WR 스플릿 프리셋: Wide / Normal / Reduced / Slot
- Moves: 드래그 중 자동 정렬 가이드 표시(수평/수직/간격)

### 4.3 Undo/Redo (MVP 필수)
- 최소 50스텝
- 모든 편집 액션(배치/이동/삭제/루트 수정/텍스트 포함) 기록

### 4.4 자동 저장(Auto-save)
- 5초마다 or 의미 있는 변경 발생 시 debounce 1초
- 네트워크 실패 시 “로컬 임시 저장” 표시

### 4.5 권한(간단)
- Owner: 전체 권한
- Editor: 편집/Export/Share
- Viewer: 보기만(Export 가능 여부는 플랜에 따라)

---

## 5) 핵심 사용자 여정 (Happy Path)

## Flow A: 첫 방문 → 첫 플레이 생성(Activation)
### 목표
- 신규 사용자가 **3분 안에** “플레이 1개 생성 + PNG export”까지

### A0. Landing → Sign up
1. 사용자가 Landing 방문
2. “Start Free” 클릭
3. Sign up(이메일/소셜) 완료
4. 온보딩 선택지(1개만 선택)
   - “I’m an OC” / “Position Coach” / “Player”
   - 목적: 기본 템플릿 추천만 조절(기능 잠금 없음)

**시스템 결과**
- 기본 워크스페이스 생성(Personal)
- 예시 템플릿 3개 자동 제공(데모)

### A1. “Quick Start” 선택 (초기 분기)
- 화면: Quick Start 카드 2개
  1) “Start from Formation”
  2) “Start from Concept (Recommended)”

**MVP 추천**: 사용자가 고민하지 않게 2) 강조(Primary)

### A2. Start from Concept (Recommended)
1. Concept Library 미리보기(Top 6)
   - Pass: Stick, Flood, Mesh
   - Run: Inside Zone, Power, Counter
2. “Power” 클릭
3. 시스템이 자동으로:
   - 기본 Formation(Ace or I 등) 선택
   - 선수 배치(OL/RB/TE 등)
   - 블로킹 스킴 자동 생성
4. 사용자는 콜네임 입력(예: “Ace Right Power”)
5. 저장(자동) + “Export PNG” 버튼 노출

**완료 조건**
- Play 생성
- PNG export 1회 완료

**실패/이탈 방지**
- “Skip naming” 허용(자동 생성 이름 부여)
- Export 버튼은 즉시 노출(성취감)

---

## Flow B: Formation 기반으로 플레이 만들기(수동 제작)
### 목표
- 코치가 원하는 포메이션에서 빠르게 설계

### B0. Dashboard → New Play
1. Dashboard에서 “New Play” 클릭
2. “Start from Formation” 선택

### B1. Formation 선택
- Formation Grid
  - 2x2 / 3x1 / Bunch / I / Ace / Double / Trips etc.
- 선택 시 오른쪽 패널에 미리보기 + 설명 1줄

**시스템 동작**
- Formation 선택 즉시 필드에 선수 자동 배치
- 기본 스냅 룰 적용

### B2. 기본 구성 수정(선수 이동)
- Select 모드에서 특정 선수 클릭
- 드래그로 위치 이동
- 스냅 가이드 표시
- “Reset Formation” 버튼 제공(복구)

### B3. 패스/런 중 선택
- 상단 탭: Run / Pass / (Play-action: v1에서는 Pass에 포함)
- 선택 시 오른쪽 패널이 해당 도구로 전환

### B4. Run 수동 생성
1) Block 모드 선택
2) “Scheme preset” 드롭다운:
   - Inside Zone / Duo / Power / Counter / Trap / Split Zone / Wham
3) preset 선택 시:
   - 기본 블로킹(화살표, 더블팀 표시)
   - Puller path 표시(점선)
   - Aim point 표시(A/B/C)
4) 코치가 수정:
   - 특정 OL 블록 대상 변경
   - 백 트랙(러닝 라인) 조정
5) Notes:
   - “Coaching Points” 텍스트 영역(짧게)

### B5. Pass 수동 생성
1) Route 모드 선택
2) “Route preset” 혹은 자유 드래그
   - Quick: hitch/out/slant
   - Intermediate: dig/curl/cross
   - Deep: go/post/corner
3) 루트 생성 방식
   - 선수 선택 → 필드 드래그 → 종료점 클릭
   - 필요 시 컨트롤 포인트 자동 추가(커브)
4) 개별 루트 수정
   - 포인트 드래그
   - 변형(깊이/각도) 슬라이더(선택)

### 완료 조건
- Play 저장
- Playbook에 추가(선택)

---

## Flow C: Formation → Concept 추천(핵심 차별 흐름)
### 목표
- 코치가 “가능한 선택지 지도”를 보고 클릭 한 번으로 생성

### C0. 전제
- 사용자는 Formation을 선택했고(또는 배치 완료),
- 상단에서 Pass/Run을 선택한 상태

### C1. “Suggestions” 열기
- 버튼: “Suggestions”
- 패널이 오른쪽에서 슬라이드 인

### C2. Pass Suggestions (v1)
#### 입력(자동/선택)
- 자동: Formation, Eligible receivers count
- 선택 토글:
  - Quick Game / Dropback / Screen
  - Man-beater / Zone-beater (MVP에서는 “추천 필터”로만)

#### 출력
- 카테고리 별 컨셉 카드 8~12개
  - Quick: Stick, Spacing, Slant/Flat
  - Intermediate: Mesh, Drive, Levels
  - Deep: Flood, Verts, Dagger
  - Special: Screens

#### 카드 구성(고정)
- Concept name
- 1줄 요약(최대 12단어)
- 배지: “NFL-style”(권위 태그)
- “Auto-build” 버튼(카드 전체 클릭으로 대체 가능)

### C3. Run Suggestions (v1)
#### 입력(사용자 최소 입력)
- Box: 6/7/8 (필수)
- Front: Odd/Even (필수)
- 3T: Strong/Weak/None (선택이지만 권장)
- Strength: Strong/Weak (선택)

#### 출력
- Top 5 런 컨셉 + 근거 3줄
- 근거 템플릿(고정)
  1) Numbers: “Box 6 → light”
  2) Angle: “3T strong → trap/power angle favorable”
  3) Surface: “TE surface available”

### C4. 컨셉 클릭 → 자동 생성
1) 사용자가 컨셉 카드 클릭
2) 시스템은 즉시:
   - 플레이를 현재 포메이션 위에 생성(덮어쓰기 경고)
   - 루트/블록/모션/aim point 자동 삽입
3) “Keep / Undo” 토스트 표시(즉시 되돌리기)

#### 덮어쓰기 정책
- 기존 액션이 있다면:
  - 기본: “New layer”로 추가(겹침 시 경고)
  - 옵션: Replace existing actions(사용자 선택)

### 완료 조건
- 컨셉 기반 플레이 생성 + 저장

---

## Flow D: 플레이북 생성/관리/출력(PDF)
### 목표
- 코치가 플레이를 모아 목차를 만들고 PDF로 뽑는다

### D0. Playbook 생성
1) Playbooks 탭 → “New Playbook”
2) 기본 설정:
   - 제목(필수)
   - 시즌/상대/버전 태그(선택)
3) 생성 완료 후 Playbook 편집 화면 진입

### D1. 플레이 추가
- Add Plays 버튼
- 소스 선택:
  - From My Plays
  - From Templates
  - From Shared (Team)

### D2. 정리(Information Management)
- 섹션(폴더) 생성:
  - Run / Pass / RPO / Redzone / Short Yardage
- 드래그로 재정렬
- 각 플레이에 태그:
  - personnel(11/12/21)
  - formation(2x2/3x1)
  - concept(Power/Mesh)
  - 상황(3rd&short 등)

### D3. 출력(PDF Export)
- “Export PDF” 클릭
- PDF 옵션:
  - Page style: Classic / Minimal
  - Include notes: yes/no
  - Include alignment grid: yes/no
  - Footer: play name + page #

### D4. 공유
- Share link 생성
- 권한:
  - View-only
  - View + Download (플랜)
- 만료 옵션은 MVP에서는 생략 가능(후순위)

### 완료 조건
- PDF 생성 완료
- 링크 공유 가능

---

## Flow E: 공유 링크로 보기(View-only) & Fork
### 목표
- 선수/코치가 링크로 접근하고(보기),
- 코치는 복제(Fork)하여 자기 버전으로 만든다

### E0. 링크 접근
1) 링크 열기
2) 로그인 여부에 따라:
   - 비로그인: View-only, 워터마크
   - 로그인: 권한에 따라 편집 버튼 표시

### E1. View-only UI
- 왼쪽: 플레이 리스트(있는 경우)
- 가운데: 다이어그램
- 오른쪽: Notes(접힘 가능)

### E2. Fork
- “Fork to My Workspace” 버튼
- 복제 후 내 편집 화면으로 이동
- 원본 출처 표시(메타)

---

## 6) 상태 전이(시스템/화면 State Machine)

### 6.1 Play Editor State
- Empty → FormationSelected → PlayersAdjusted(optional) → ActionsAdded → Saved
- Saved → ExportedPNG / ExportedPDF
- Saved → Shared

### 6.2 Suggestion Panel State
- Closed → Open
- Open → FilterChanged → ResultsUpdated
- Open → ConceptClicked → AutoBuilt → (UndoAvailable)

### 6.3 Error/Recovery
- NetworkFail → LocalDraftSaved → Reconnect → Sync
- ExportFail → Retry + “Download as SVG”(대체 옵션, MVP에선 선택)

---

## 7) 예외 흐름(Edge Cases) / UX 처리

### 7.1 컨셉 자동 생성이 포메이션과 충돌할 때
- 예: 컨셉이 3리시버 필요인데 2x2에 2명만 배치된 경우
- 처리:
  - 자동으로 “필요 인원 추가” 안내
  - 버튼: “Auto-add eligible receiver” (MVP에서 강력 추천)
  - 또는 “Show compatible formations”로 이동

### 7.2 Run 추천 입력이 부족할 때
- Box/front 입력 안 하면 추천 불가
- 처리:
  - Run Suggestions 버튼 클릭 시 미니 입력 모달 강제
  - 선택은 10초 내 완료 가능한 UI(라디오 버튼)

### 7.3 Undo 의존
- 자동 생성은 항상 “Undo 가능” 토스트 제공
- Undo는 1회가 아니라 다단계 유지

### 7.4 너무 많은 추천 결과
- 결과는 최대 12개
- 더 많으면:
  - “More…” → 카테고리 확장(후순위)
  - MVP는 “축소가 정답”

### 7.5 모바일
- MVP에서 편집은 데스크탑 최적
- 모바일은 view-only 우선
- 최소: 줌/팬/플레이 선택은 가능

---

## 8) UI 컴포넌트 명세(화면 단위)

### 8.1 Dashboard
- CTA: New Play / New Playbook
- Recent list(플레이/플레이북)
- Templates carousel(컨셉 기반)

### 8.2 Play Editor
- Top bar:
  - Play name, tags, save indicator
  - Export (PNG/PDF), Share
- Left sidebar:
  - Position palette
  - Formation presets
- Canvas center:
  - Field + players + actions
- Right sidebar:
  - Mode tools
  - Suggestions panel (toggle)

### 8.3 Concept Library
- Filter: Pass/Run, level(NFL-style), formation fit
- Card view: concept name + 1-line description + “Build” button

### 8.4 Playbook Editor
- Left: sections + play list
- Right: play preview + notes
- Export settings modal

---

## 9) 텔레메트리(제품 학습을 위한 이벤트)
> MVP에서 최소한으로 심어야 “뭐가 돈 되는지” 알 수 있다.

- `signup_complete`
- `first_play_created`
- `formation_selected`
- `suggestions_opened`
- `pass_concept_clicked`
- `run_suggestion_input_set` (box/front/3T)
- `run_concept_clicked`
- `auto_build_completed`
- `export_png`
- `export_pdf`
- `share_link_created`
- `fork_play`
- `install_focus_opened`
- `drill_video_clicked`

---

## 10) Acceptance Criteria (QA 기준)

### Activation
- 신규 유저가 가입 후 3분 내:
  - 컨셉 클릭 → 자동 생성 → PNG export 가능

### Editor
- 스냅이 의도대로 동작
- Undo/Redo가 모든 액션에 적용
- Auto-save가 네트워크 끊겨도 드래프트 유지

### Suggestions
- Formation 기반 Pass 컨셉이 8~12개로 제한
- Run 추천은 box/front 미입력 시 입력 UI가 강제
- 컨셉 클릭 후 1초 내 자동 생성 완료
- 자동 생성 직후 Undo 토스트 항상 노출

### Export
- PNG 해상도 깨짐 없음
- PDF 10장 생성 가능, 페이지네이션 정상

### Share/Fork
- View-only 링크 접근 가능
- Fork 후 내 워크스페이스에서 편집 가능
- 원본 출처 메타 유지

---

## 11) MVP 화면 흐름 요약(한 장 요약)
1) Dashboard → New Play
2) Start from Concept(추천) → 컨셉 클릭
3) 자동 생성 → 수정(선택) → Export PNG
4) **Install Focus 확인 → Drill 영상 레퍼런스 확보**
5) Playbook 생성 → 플레이 추가 → Export PDF
6) Share link → View-only → Fork(코치)

---

## Flow F: Drill 추천 확인 (Install Focus)
### 목표
- 코치가 플레이를 만든 후 "어떻게 가르칠지" 즉시 파악
- 플레이 설계 → 연습 연결의 마지막 다리

### F0. 전제
- 플레이가 저장된 상태
- 플레이에 conceptId가 연결되어 있음

### F1. Install Focus 패널 열기
- 플레이 에디터 하단 또는 사이드바:
  - "Install Focus" 탭/버튼
- 클릭 시 패널 슬라이드 인

### F2. Failure Point 기반 드릴 표시
#### 출력 구조 (고정 포맷)
```
Install Focus (3)
├─ 1. [Failure Point 이름]
│    └─ Drill: [드릴 이름]
│    └─ 목적: 1줄 설명
│    └─ 연습 단계: Indy / Group / Team
│    └─ 영상: Instagram 썸네일 + 링크
├─ 2. ...
└─ 3. ...
```

#### 예시: GT Counter
```
Install Focus (3)
1. Puller timing & path
   - Drill: Pull & Kick Drill
   - 목적: Guard가 pull 후 kick 타이밍 연습
   - 연습 단계: Indy → Group
   - 영상: [Instagram 썸네일] @coachX

2. RB press & cut decision
   - Drill: Press Read Drill
   - 목적: RB가 C-gap press 후 cutback 판단
   - 연습 단계: Group
   - 영상: [Instagram 썸네일] @runningbackcoach

3. Kick vs Log recognition
   - Drill: DE Read Drill
   - 목적: DE 반응에 따른 kick/log 판단
   - 연습 단계: Group → Team
   - 영상: [Instagram 썸네일] @olinedrills
```

### F3. Instagram 영상 연결
#### UX 원칙
- 영상 호스팅 ❌ (법적/기술적 리스크)
- 썸네일 + 외부 링크만 제공
- 해시태그 기반 수집: `#counterdrill`, `#pullblock`, `#olinedrills`

#### 영상 카드 구성
- 썸네일 이미지
- 출처 계정명 (@username)
- 클릭 시 Instagram 앱/웹으로 이동

### F4. Drill 데이터 특성 (MVP)
- 읽기 전용 (수정/편집 불가)
- 1 Play당 최대 3 Drills
- Drill은 Concept에 매핑됨 (Play 개별 매핑 ❌)

### 완료 조건
- 코치가 Install Focus를 확인
- 필요시 영상 링크 클릭으로 연습 레퍼런스 확보

---

## 12) 향후 확장 포인트(문서에만 기록, MVP 금지)
- Down/Distance/Hash 기반 추천 점수 고도화
- 팀 성향(주력 6개 컨셉) 가중치
- 방어 프론트 상세(5T/9/ILB stack) 입력 확장
- 애니메이션(선수 경로 재생)
- 동시 편집/코멘트 스레드

---

# 결론
이 User Flow는 "빠르게 그리기"가 아니라
**Formation → Concept 탐색 → 클릭으로 생성 → Install Focus로 연습 연결**을 핵심 루프로 고정한다.
추천은 판단이 아니라 **선택지 축소**이며, 모든 자동 생성에는 **Undo**가 동반되어야 한다.

> **핵심 전환점**: 플레이 설계 후 "그래서 이걸 어떻게 가르치지?" 질문에 Install Focus가 즉답한다.
