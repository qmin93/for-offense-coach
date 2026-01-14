# Football Playbook Builder & Concept Recommender (ForOffenseCoach) — Business Plan (상세본)

> 목적: **미식축구 코치가 “그리는 시간”과 “생각 정리 시간”을 줄이는** 온라인 플레이북 제작 SaaS  
> 핵심 차별: 단순 다이어그램 툴이 아니라 **Formation → Concept(패스/런) 추천 → 즉시 다이어그램 생성**까지 이어지는 “코치 문법 기반 엔진”

---

## 0. 한 줄 정의 / 포지셔닝
- **“코치가 만든 코치용 플레이북 제작기 + 컨셉 추천 엔진”**
- 기존: “그림을 그리는 툴”  
- 본 서비스: **“플레이북을 ‘설계’하게 해주는 툴”** (추천은 ‘정답’이 아니라 **선택지 지도**)

---

## 1. 문제 정의 (Problem)
### 1.1 코치의 실제 페인포인트
1) **플레이 다이어그램 제작이 느리다**
- 포지션 오브젝트/스냅/프리셋이 없어 매번 복붙
- 루트/블로킹/모션/리드가 “축구 문법”으로 추상화되어 있지 않음

2) **플레이북 관리가 불편하다**
- 파일(PPT/PDF/이미지)로 흩어짐
- 버전, 태그, 코멘트, 공유(선수/코치) 흐름이 약함

3) **아이디어 탐색이 어렵다**
- "이 포메이션에서 가능한 패스 조합 / 런 컨셉"을 빠르게 훑기 어려움
- NFL/상위레벨에서 쓰는 컨셉의 "구조적 레퍼런스"가 분산됨

4) **플레이 설계와 연습이 단절되어 있다**
- 플레이는 만들었지만 "어떻게 가르칠지"는 별개 작업
- 드릴 영상/자료가 흩어져 있어 찾는 데 시간 소모
- 결국 플레이북은 있지만 현장에서 안 쓰이거나, 예전 방식으로 회귀

### 1.2 왜 기존 툴이 해결 못하는가 (Root Cause)
- 미식축구 다이어그램은 범용 그래픽 문제가 아니라 **도메인 문법(DSL) 문제**
- “Route / Block / Motion / Read / Surface / Box”를 객체로 다루지 않으면  
  어떤 UX도 근본적으로 느리다

---

## 2. 해결책 (Solution)
### 2.1 제품 핵심
1) **Play Diagram Editor (온라인)**
- 포지션 팔레트 + 프리셋 포메이션 + 스냅 규칙
- Route/Block/Motion/Assignment를 “미식축구 문법”으로 빠르게 생성/수정
- 출력(PNG/PDF) & 공유 링크

2) **Concept Library (패스/런)**
- 컨셉을 “플레이”가 아니라 **구조(Concept)** 로 정의
- `Used in NFL-style` 같은 권위 태그(브랜드 오해 유발 요소 배제)

3) **Formation → Concept 추천 엔진**
- AI가 정답을 말하는 방식 ❌
- **구조적으로 가능한 후보를 좁혀주고**, 코치가 최종 선택 ✅
- 클릭 즉시 다이어그램 자동 생성(수정 가능)

4) **Drill 추천 시스템 (Install Focus)**
- 플레이 설계 → 연습 연결의 **마지막 다리**
- 플레이별 **실패 포인트(Failure Point)** 기반 드릴 제안
- Instagram 영상 레퍼런스 연결 (호스팅 ❌, 링크만 ✅)
- "이 플레이를 가르치려면 뭘 연습해야 하지?" 질문에 즉답

---

## 3. 타깃 고객 / 페르소나 (Target)
### 3.1 1차 타깃 (가장 현실적 결제자)
- 대학/사회인/고교 OC, QB코치, 오펜시브 스탭
- “플레이북을 실제로 직접 제작”하고 “출력/공유”가 잦은 집단

### 3.2 2차 타깃 (확장)
- DC/포지션 코치(스카우팅 카드/상대 분석)
- 유소년/클럽 팀(코치가 1인 다역 수행 → 시간이 더 부족)

### 3.3 구매 단위
- 개인 구독보다 **팀/시즌 결제**가 더 자연스럽다
- “팀 플랜”이 LTV를 밀어 올리는 핵심

---

## 4. 제품 구성 (Product)
## 4.1 MVP 기능 스코프 (돈 되는 최소치)
### A. 다이어그램 제작
- 포지션 팔레트(QB/RB/FB/OL/WR/TE/DEF 등)
- 프리셋 포메이션: 2x2 / 3x1 / Bunch / I / Ace / Double 등
- 편집 모드: Select / Route / Block / Motion / Text
- 스냅: LOS/Hash/스플릿/OL 정렬
- Undo/Redo, 복제, 정렬, 그룹

### B. 출력/공유
- PNG export
- PDF export(플레이북 페이지네이션)
- 공유 링크(public/private/team)

### C. 추천(초기 버전)
- Formation 기반 “Pass Concepts / Run Concepts” 리스트 제공
- 컨셉 클릭 → 자동 배치(루트/블로킹 포함), 코치가 즉시 수정

---

## 4.2 “추천” 기능 설계 원칙 (제품 생존 규칙)
- 추천은 **판단**이 아니라 **필터/탐색**이어야 한다
- 결과에 “근거 3줄”만 제공 (장문 설명 금지)
- “AI가 골라줍니다” 문구 금지  
  → 코치는 신뢰하지 않는다  
- “가능한 것”과 “우선순위”를 분리
  - 1단계: 구조적 가능 후보
  - 2단계: 상황 입력(박스/프론트 등) 시 우선순위 정렬

---

## 5. 컨셉 라이브러리 (Pass + Run) — 추천 엔진의 재료

### 5.1 Pass Concept Library (초기 20개 권장)
> 표기: (Required) 필요한 리시버 수 / (Stress) 수비 스트레스 / (Fit) 적합 포메이션

1) **Stick** — Required 2~3 / Stress: underneath conflict / Fit: 2x2, 3x1  
2) **Spacing** — 3~4 / horizontal spacing / 2x2, trips  
3) **Smash** — 2 / corner-flat conflict / 2x2, bunch  
4) **Flood** — 3 / cover3 outside stretch / trips, bunch  
5) **Mesh** — 3~4 / man-beater cross / 2x2, trips  
6) **Drive (Shallow Cross)** — 3 / intermediate + shallow / 2x2, 3x1  
7) **Levels** — 3 / zone layer / trips, 2x2  
8) **All Curls** — 4 / zone soft spot / 2x2  
9) **Dagger** — 2~3 / MOF + deep in / 2x2  
10) **Y-Cross** — 3 / MOF + cross / 3x1  
11) **Sail** — 2~3 / outside layer / trips, 2x2  
12) **Quick Out/Flat** — 1~2 / quick game / any  
13) **Slant/Flat** — 2 / flat defender conflict / 2x2  
14) **Curl/Flat** — 2 / flat defender conflict / 2x2  
15) **Hitch/Seam** — 2 / seam stress / 2x2  
16) **Post/Dig** — 2 / MOF read / 2x2  
17) **Verts (4 Verts)** — 3~4 / deep stress / 2x2, 3x1  
18) **Switch Verts** — 3 / leverage confusion / trips  
19) **Spear/Glance(RPO tag)** — 1~2 / box conflict / any  
20) **Screen Package (RB/WR)** — 1~2 / pressure punish / any

> 각 컨셉은 “플레이”가 아니라 **루트 역할(Role) 템플릿**으로 저장  
> 예: Flood = {Clear(Go), Intermediate(Out/DeepOut), Flat(Arrow)}

---

### 5.2 Run Concept Library (초기 20개 권장)
> 표기: (Needs) 요구 자원 / (Best vs) 유리한 프론트/기술 / (Target) 목표 포인트

**A. Core Inside (안정적 주력)**
1) **Inside Zone** — Needs: 5OL / Best vs: even/odd 모두 / Target: A/B  
2) **Split Zone** — Needs: TE/H-back slice / Best vs: edge crash / Target: B, cutback  
3) **Duo** — Needs: double teams / Best vs: 2-high, light box / Target: A/B  
4) **Iso/Lead** — Needs: FB/H-back lead / Best vs: 2-high, downhill / Target: A/B  
5) **Mid Zone** — Needs: combo + vertical push / Best vs: 4-down / Target: B

**B. Gap/Pull (각도 기반, 추천 가치 큼)**
6) **Power (G-Pull)** — Needs: puller / Best vs: over/under에서 각도 / Target: C/B  
7) **Counter (GT)** — Needs: 2 pullers / Best vs: fast-flow, spill / Target: B/C  
8) **Tackle Trap** — Needs: trap angle / Best vs: penetrating 3T / Target: B  
9) **Guard Trap** — Needs: quick hitter / Best vs: upfield 3T/2i / Target: A/B  
10) **Pin-Pull** — Needs: perimeter surface / Best vs: wide front / Target: edge

**C. Perimeter (조건 입력이 있으면 강력)**
11) **Outside Zone** — Needs: edge leverage / Best vs: light edge / Target: edge, cutback  
12) **Stretch (Wide Zone)** — Needs: speed + seal / Best vs: slow force / Target: edge  
13) **Toss** — Needs: crack/lead / Best vs: soft corner / Target: edge  
14) **Sweep (Jet/Orbit)** — Needs: motion timing / Best vs: slow alley / Target: edge  
15) **Buck Sweep** — Needs: pull/edge / Best vs: aggressive DL / Target: edge

**D. Specialty (상대 성향 카운터)**
16) **Wham** — Needs: TE/FB wham / Best vs: dominant 1T/3T / Target: A/B  
17) **Insert (RB/WR insert)** — Needs: insert blocker / Best vs: odd front / Target: A/B  
18) **QB Keep/Power** — Needs: QB run threat / Best vs: numbers / Target: B/C  
19) **Read Option (Zone Read)** — Needs: QB read / Best vs: edge crash / Target: B/edge  
20) **RPO Run-Base** — Needs: tag route / Best vs: box conflict / Target: inside

---

## 6. 추천 엔진 설계 (핵심 IP)

## 6.1 추천의 출력 형태
- 추천 리스트는 “플레이 이름”이 아니라 **컨셉 카드**
- 카드에는 근거 3개만 표시:
  1) **Numbers**: 박스(6/7/8) vs 블로커  
  2) **Technique/Angle**: 3T/5T/9, Over/Under, odd/even  
  3) **Surface**: TE/Trips/Reduced split 등

---

## 6.2 Pass 추천 로직 v1 (Formation 기반 필터링)
### 입력
- Formation (2x2, 3x1, bunch 등)
- Eligible receivers count (2~4)
- (옵션) Quick game / Dropback / Play-action 토글

### 처리
- Formation → Allowed Pass Concepts(정적 매핑)
- 리시버 수/정렬 조건으로 2차 필터
- 결과를 카테고리로 묶어 보여줌:
  - Quick Game / Intermediate / Deep / Man-beaters / Screens

### 출력
- Top 8~12 컨셉(너무 많으면 선택 피로)
- 클릭 시 자동 다이어그램 생성(루트 역할 기반)

---

## 6.3 Run 추천 로직 v1 (Formation + 간단 수비 입력)
### 최소 입력 (코치가 입력 가능한 수준으로 축소)
- Box count: 6 / 7 / 8
- Front type: odd(3-down) / even(4-down)
- 3T 위치: strong / weak / none
- Strength(강/약) 선택

### 처리 개요
1) **구조 필터**
- Personnel/Formation 상 불가능한 런 제거  
  예) FB 없는 Iso 제거, puller 없는 GT 제거(혹은 “가능: 단, insert 필요”로 표시)

2) **점수 기반 우선순위**
- 점수 = Numbers fit + Angle fit + Surface fit + 팀 선호도(선택)
- 결과 상위 5개 노출

### 출력
- Top 5 Run Concepts + 근거 3줄
- 클릭 시 블로킹 스킴 자동 생성(기본 규칙)

---

## 6.4 v2 추천 (상황/성향 입력 확장)
- Down/Distance, Hash, 상대 tendency(Over/Under 비율, blitz 성향), 우리 팀 주력 런/패스 6개
- 추천 품질은 상승하지만, **MVP에선 금지** (복잡성 폭발)

---

## 7. 수익화 모델 (Monetization)

## 7.1 가격 정책 (현실적 구매 단위 중심)
- **Free**: 플레이 제한(예: 10개), 워터마크, PNG만
- **Pro (개인)**: 월 $9 (또는 연 $90)
- **Team (시즌)**: 시즌 $79~$149 (팀 멤버 공유/코멘트/플레이북 PDF)
- **School/Org**: 견적(관리자/다중 팀)

> 코치의 실제 구매 행태를 고려하면 “Team/Season” 플랜이 핵심.

---

## 7.2 업셀/부가 매출
- Concept Pack(공격 철학별 번들): Spread Quick Game Pack, Gap Run Pack 등
- 커스텀 템플릿 판매(팀 전용 플레이북 스타일)

---

## 8. 시장 진입 전략 (GTM)

## 8.1 채널 우선순위
1) 코치 커뮤니티/포럼/디스코드/단톡
2) 유튜브/짧은 데모(“30초에 Counter 그리기”)
3) 전술 자료 공유형 SEO (ex: “Flood concept diagram”, “GT counter blocking rules”)
4) 대학/고교 코치 대상 직접 DM(“무료로 올려놨습니다” 방식의 B2B 콜드아웃리치)

## 8.2 초기 콘텐츠 전략 (전환형)
- “컨셉 설명” 장문 콘텐츠 ❌
- “다이어그램 + 다운로드 + 템플릿 복제” ✅
- 검색 의도: “diagram / playbook / concept / route combo / blocking scheme”

## 8.3 바이럴 루프
- 공유 링크에 “View-only + Fork” 제공
- 선수에게 공유할 때 브랜드가 노출되도록(워터마크/헤더)

---

## 9. 경쟁/대체재 분석 (Competitive Landscape)
- 범용 다이어그램: PPT/Figma/draw.io → 도메인 모델 부재
- 레거시 전용 툴: 설치형/UX 낡음/협업 약함
- 태블릿 앱: 표시 중심, 플레이북/추천/출력 약함

**차별점(핵심 4개)**
1) 코치 문법(DSL) 기반: 빠른 생성/수정
2) Formation→Concept 추천: "아이디어 탐색"이 내장
3) Playbook 출력/공유/버전: 운영 워크플로우 통합
4) Drill 추천(Install Focus): "설계 → 연습"까지 연결하는 유일한 툴

---

## 10. 제품 로드맵 (Roadmap)

### Phase 0 (0~4주): MVP
- Editor(SVG) + 포메이션 프리셋 + Route/Block/Motion + PNG/PDF
- Pass/Run Concept Library 20/20
- Formation→Concept 추천(정적 매핑) + 클릭 자동 생성

### Phase 1 (5~10주): 팀 사용성
- Team workspace, 공유/권한, 코멘트, 폴더/태그
- 플레이북 자동 목차/페이지 템플릿

### Phase 2 (11~16주): 추천 고도화 + Drill 연결
- Run 추천에 box/front/3T 입력 반영(점수화)
- "우리 팀 주력 컨셉" 핀 고정(콜시트 보조)
- **Drill 추천 시스템 v1**:
  - 플레이별 실패 포인트(Failure Point) 3개 자동 매핑
  - Instagram 영상 레퍼런스 연결(해시태그 기반)
  - Install Focus 섹션 자동 생성(읽기 전용)

### Phase 3 (그 이후): 확장
- 디펜스 스카우팅 카드, 상대 tendency 입력
- 간단 애니메이션(선택) / 설치형 export 등

---

## 11. 기술 아키텍처 (Technical Plan)

## 11.1 렌더링 선택
- **SVG 기반** 권장: 인쇄/확대/PDF 변환에 강함

## 11.2 핵심 설계: DSL(JSON) → Renderer
### 데이터 모델(개요)
- `players[]`: {id, role(QB/X/LT...), x,y, label, stance}
- `actions[]`:
  - route: {from, pattern, controlPoints, style}
  - block: {from, to, scheme(down/reach/pull), style}
  - motion: {from, path[], timing(pre/snap)}
  - assignment/read: {qbSteps[], tags[]}
- `meta`: {formationId, conceptId, tags[], notes[]}

## 11.3 저장/공유
- Play JSON을 그대로 저장(스키마 버전 포함)
- 공유 링크: playId 기반 read-only 뷰 + fork

## 11.4 추천 엔진 구현 방식
- v1: 정적 테이블 + 규칙 기반 필터  
- v2: 점수화(룰 기반) + 팀 선호도 가중치  
- “AI”는 **후순위** (초기 신뢰/품질/비용 리스크)

---

## 12. 운영 계획 (Ops)
- 사용자 지원: 템플릿/영상 가이드 중심(문서 최소)
- 버그 우선순위: 편집기 안정성(Undo/Redo, 스냅) 최상위
- 템플릿 업데이트: 주 1회 컨셉 팩 추가(가치 유지)

---

## 13. 리스크 & 대응 (Risks)

1) **시장 규모/지불의사 제한**
- 대응: Team/Season 플랜 중심, 코치 워크플로우(출력/공유)로 락인

2) **추천 신뢰**
- 대응: “정답” 표현 금지, 근거 3줄, 후보 축소 방식

3) **복잡성 폭발**
- 대응: MVP 범위 잔인하게 제한(애니/분석/AI 장문 금지)

4) **저작권/브랜딩 오해**
- 대응: NFL 팀/경기 특정 재현 금지, “NFL-style” 같은 일반 태그만

---

## 14. KPI / 성공 기준 (Metrics)
- Activation: 가입 후 24시간 내 “첫 플레이 생성” 비율
- Time-to-first-play: 첫 플레이 생성까지 걸리는 시간(목표: 3분 이하)
- Weekly retention: 주간 재방문
- Export rate: PNG/PDF 내보내기 비율(가치 지표)
- Conversion: Free → Pro/Team 전환율
- Team adoption: 팀 워크스페이스 생성 비율

---

## 15. 단위 경제성 (Unit Economics) — 가정 기반 시나리오
> 아래는 계산 검산 포함 “가정치” 예시. 실제는 트래픽/전환에 따라 변동.

### 15.1 가격 가정
- Pro(개인): $9/월
- Team(시즌): $99/시즌

### 15.2 간단 시나리오 A (개인 중심)
- 유료 개인 200명 × $9/월 = $1,800/월
  - 계산: 200 × 9 = 1,800 ✅

### 15.3 시나리오 B (팀 중심)
- 팀 60개 × $99/시즌 = $5,940/시즌
  - 계산: 60 × 99 = 5,940 ✅
- 시즌을 4개월로 환산 시 월 평균: $5,940 ÷ 4 = $1,485/월 ✅

### 15.4 결론
- 초기는 개인 구독이 현금흐름을 만들고,
- 장기적으로 팀/시즌 결제가 LTV를 올린다.

---

## 16. 실행 우선순위 (Actionable Verdict)
### “지금 당장” 해야 하는 5가지
1) **MVP Editor**: 포지션+스냅+Route/Block/Motion + PNG export
2) **Concept 40개(패스20/런20)**: 템플릿化
3) **Formation→Concept 매핑 테이블**: 추천의 첫 엔진
4) **클릭→자동생성**: 추천의 체감 가치
5) **Team/Season 플랜**: 결제 단위를 맞추기

---

## 부록 A. Formation × Concept 매핑(예시)
- Trips(3x1): Flood, Stick, Spacing, Mesh, Y-Cross, Verts
- 2x2: Stick, Smash, All Curls, Dagger, Verts, Drive
- Bunch: Flood, Smash, Mesh, Levels
- I/Ace(PA): Sail, Flood, Cross, Screens

## 부록 B. Run 추천 입력 UX(초기)
- 토글 4개만:
  - Box: 6/7/8
  - Front: Odd/Even
  - 3T: Strong/Weak/None
  - Strength: Strong/Weak
- 출력: Top5 + 근거3줄 + 자동생성

---

# 최종 결론
이 사업은 "그림 툴"로 포지셔닝하면 대체재에 눌린다.
**Editor(속도) + Concept Library(권위) + 추천(탐색 단축) + Drill 연결(실행 보장)** 4개가 결합될 때만 결제 이유가 생긴다.

> ForOffenseCoach은 "플레이를 그리는 앱"이 아니라
> **"오늘 밤 설계 → 내일 연습까지 연결해주는 코치 툴"**이다.
