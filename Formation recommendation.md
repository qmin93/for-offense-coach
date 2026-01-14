# Team Profile–Driven Formation Recommendation Spec  
부제: **Roster & Capability 기반 포메이션 자동 추천 엔진 설계 문서**  
버전: v1.0 (MVP 확장 문서)  
연결 문서: PRD v1.0 / User Flow Spec v1.0 / PlaybookDSL v1.0

---

## 0) 문서 목적 (Why this document exists)

이 문서는 다음 질문에 **일관된 로직으로 답하기 위한 별도 규격**이다.

> “우리 팀 인원/전력 기준에서 **실제로 쓸 수 있고, 잘 맞는 포메이션**은 무엇인가?”

핵심 전제:
- 이 기능은 **AI 추천**이 아니다.
- **불가능한 선택지를 제거**하고, **적합한 선택지를 점수화**하는 **Roster/Capability 기반 결정 엔진**이다.
- 추천 결과는 “정답”이 아니라 **Top Formation Packages + 근거**다.

---

## 1) 설계 원칙 (Non-Negotiable Rules)

### R1. Feasibility First (불가능 제거 우선)
- 인원/포지션이 안 맞는 포메이션은 **절대 추천하지 않는다**.
- “대체안”은 명확히 분리해서 표기한다.

### R2. Capability-Driven, Not Fantasy-Driven
- “NFL에서 쓰니까”는 근거가 아니다.
- **우리 팀 전력 태그**와 연결되지 않는 추천은 금지.

### R3. 입력은 코치 기준 2분 내 완료
- 복잡한 수치 입력 금지
- 5점 척도 + 토글 중심

### R4. 결과는 항상 ‘왜’가 보인다
- 모든 추천에는 **3줄 근거**가 고정 포맷으로 포함된다.

---

## 2) Team Profile 개념 정의

### 2.1 Team Profile이란?
Team Profile은 **우리 팀의 현실적 제약과 강점을 데이터로 고정**한 객체다.  
Formation / Pass / Run 추천의 **최상위 필터 & 가중치 입력값**으로 사용된다.

---

## 3) TeamProfile DSL 스키마

```json
{
  "schemaVersion": "1.0",
  "type": "team_profile",
  "id": "team_profile_2026",
  "teamName": "Tigers Offense 2026",

  "rosterAvailability": {
    "QB": { "count": 1, "starterQuality": 4 },
    "RB": { "count": 3, "starterQuality": 4 },
    "FB": { "count": 1, "starterQuality": 3 },
    "WR": { "count": 4, "starterQuality": 3 },
    "TE": { "count": 0, "starterQuality": 0 },
    "OL": { "count": 7, "starterQuality": 4 }
  },

  "unitStrength": {
    "olRunBlock": 4,
    "olPassPro": 3,
    "rbVision": 4,
    "wrSeparation": 2,
    "qbArm": 3,
    "qbDecision": 4,
    "teBlock": 0,
    "teRoute": 0
  },

  "stylePreferences": {
    "runPassBalance": "run_heavy",
    "underCenterUsage": "medium",
    "motionUsage": "high",
    "tempo": "medium",
    "riskTolerance": "conservative"
  },

  "notes": [
    "OL is strength, WR separation is limited",
    "Prefer downhill run and play-action"
  ],

  "createdAt": "2026-01-12T13:00:00Z",
  "updatedAt": "2026-01-12T13:00:00Z"
}
```

---

## 4) 입력 항목 상세 정의

### 4.1 Roster Availability (가용 인원)

**목적**
퍼스널/포메이션 가능 여부를 기계적으로 판별

**규칙**
- `count = 0` → 해당 포지션 필수 포메이션은 즉시 제외
- `count = 1` → 필수는 가능, 부상 리스크 태그 부여
- `starterQuality`는 1~5 (추천 가중치에만 사용)

**포지션 표준**
QB, RB, FB(H), WR, TE, OL

---

### 4.2 Unit Strength (전력 지표)

**설계 원칙**
- 숫자는 정밀 측정값이 아니라 상대 비교용
- 1~5 단일 척도 고정

**항목 정의**

| 항목 | 설명 |
|------|------|
| olRunBlock | 다운힐/존/갭 러닝 기반 |
| olPassPro | 드랍백/엣지 대응 |
| rbVision | 컷백/읽기 |
| wrSeparation | 1on1 분리 능력 |
| qbArm | 깊은 패스/아웃 |
| qbDecision | RPO/진행 |
| teBlock | 있을 경우만 |
| teRoute | 있을 경우만 |

---

### 4.3 Style Preferences (철학/성향)

**목적**
"할 수 있음" 중에서 "하고 싶은 방향" 반영

**고정 옵션**
- `runPassBalance`: run_heavy | balanced | pass_heavy
- `underCenterUsage`: low | medium | high
- `motionUsage`: low | medium | high
- `tempo`: low | medium | high
- `riskTolerance`: conservative | normal | aggressive

---

## 5) Formation Library 요구 스펙 (추천 대상)

각 포메이션은 아래 메타를 반드시 가진다.

```json
{
  "formationId": "formation_trips",
  "name": "Trips",
  "personnel": ["10", "11"],
  "structure": "3x1",
  "requiredRoster": {
    "WR": 3,
    "RB": 1,
    "TE": 0,
    "FB": 0,
    "OL": 5
  },
  "tags": ["spread", "pass_friendly", "spacing"],
  "strengthBias": "none",
  "riskTags": ["pass_pro_stress"]
}
```

---

## 6) Formation Recommendation Engine

### 6.1 전체 흐름 (Pipeline)

```
TeamProfile
   ↓
[1] Feasibility Filter
   ↓
[2] Capability Scoring
   ↓
[3] Style Adjustment
   ↓
Top Formation Packages + Rationale
```

---

### 6.2 Step 1 — Feasibility Filter (절대 규칙)

**예시 규칙**
- `TE.count == 0` → 12/13 personnel 포메이션 제거
- `FB.count == 0` → I-formation 제거 (단, "RB motion 대체안"으로 별도 표기 가능)
- `OL.count < 6` → Heavy/Unbalanced 태그 제거
- `WR.count < 3` → Trips/Spread 제거

> 이 단계에서 추천 후보의 40~60%가 제거되는 것이 정상이다.

---

### 6.3 Step 2 — Capability Scoring (0~100)

**점수 구성**

| 항목 | 최대 |
|------|------|
| Run Fit | 40 |
| Pass Fit | 40 |
| Style Fit | 20 |
| **Total** | **100** |

#### 6.3.1 Run Fit (0~40)

```
(olRunBlock × 5)
+ (rbVision × 3)
+ (teBlock × 2, if applicable)
```

#### 6.3.2 Pass Fit (0~40)

```
(olPassPro × 4)
+ (wrSeparation × 4)
+ (qbDecision × 2)
```

#### 6.3.3 Style Fit (0~20)

- `run_heavy + run_friendly formation` → +10
- `motion_high + bunch/stack` → +5
- `conservative + heavy protection` → +5

---

### 6.4 Step 3 — Formation Package 구성

- 단일 포메이션 ❌
- Formation Package ✅

**예시 패키지:**

```json
{
  "packageId": "pkg_11p_spread",
  "name": "11 Personnel Spread Package",
  "formations": ["Trips", "2x2", "Bunch"],
  "score": 78,
  "rationale": [
    "Feasible: WR depth sufficient, TE not required",
    "Fit: OL run block strength supports inside run/RPO",
    "Style: Motion-heavy preference aligns with bunch"
  ],
  "tags": ["primary_package", "spread", "motion_friendly"]
}
```

---

## 7) 출력 UX 규격

### 7.1 추천 결과 화면

**Top 5 Formation Packages**

각 패키지:
- 이름
- 포함 포메이션
- 점수(숫자 + 바)
- 근거 3줄(고정)

---

### 7.2 즉시 연결

패키지 클릭 → Formation 자동 배치

이어서:
- Pass Suggestions
- Run Suggestions
- **Install Focus** (Concept 선택 후 자동 활성화)

자동 활성화

> **전체 흐름**: Formation Package → Pass/Run Concept → Auto-build → **Install Focus** → 연습 연결

---

## 8) Edge Cases / 예외 처리

### 8.1 인원은 되지만 전력 미스매치

- 추천은 유지
- 단, Risk Tag 표시:
  - "WR separation limited → prefer bunch/quick game"

---

### 8.2 대체안 처리

FB 없음 + I-formation 철학 선택:
- 기본 추천 ❌
- "Alternative: RB insert motion" 패키지로 별도 노출

---

## 9) MVP 범위 고정 (중요)

### MVP 포함
- Roster count
- Unit strength (5점)
- Style toggles
- Formation package 추천

### MVP 제외
- 개별 선수 능력
- 부상 시뮬레이션
- 상대 수비 반영
- 시즌 중 동적 변화

---

## 10) 성공 기준 (이 기능의 KPI)

- TeamProfile 입력 완료율 ≥ 70%
- Formation Package 클릭률 ≥ 40%
- Formation 추천 이후:
  - Pass/Run Suggestions 사용률 ≥ 60%
- "추천이 현실적이다" 피드백 ≥ 70%

---

## 최종 결론

이 문서는 "AI가 똑똑한 척하는 기능"이 아니다.
현실을 정확히 반영하는 제약 + 합리적인 점수화로
코치에게 쓸 수 있는 선택지만 남기는 엔진이다.

이 구조가 있으면:
- Formation 추천은 신뢰를 얻고,
- Pass/Run 추천의 품질도 자동으로 상승하며,
- **Install Focus와 연결되어 "설계 → 연습"까지 완성된다.**

> **핵심 가치**: Team Profile → Formation Package → Concept → **Install Focus**
> 이 흐름이 완성되면 ForOffenseCoach은 "오늘 밤 설계 → 내일 연습까지 연결해주는 코치 툴"이 된다.