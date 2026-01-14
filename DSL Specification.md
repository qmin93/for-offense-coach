# DSL Specification — Football Play Diagram & Playbook Data Model (ForOffenseCoach DSL)
버전: 1.0 (MVP)  
목적: 플레이를 “그림”이 아니라 **데이터**로 표현하는 표준을 정의한다.  
이 DSL은 다음 기능의 공통 기반이다:
- Editor 렌더링/편집(좌표, 오브젝트, Undo/Redo)
- Concept 템플릿(패스/런 자동 생성)
- Suggestions(추천 엔진의 필터/점수화)
- 저장/버전/공유/Fork
- Export(PNG/PDF)

---

## 0) 설계 원칙 (Design Principles)

### P0. “그래픽”이 아니라 “도메인 모델”
- 단순 선/도형 집합이 아니라,
- **Player / Route / Block / Motion / Assignment / Read / Surface** 같은 미식축구 문법 객체로 표현한다.

### P1. 편집 친화성(Editability) 우선
- 데이터는 “렌더링 결과”가 아니라 “편집 가능한 의도”를 저장해야 한다.
- 예: 루트는 polyline 좌표만 저장하지 말고, `pattern`/`depth`/`breakAngle` 등을 함께 저장.

### P2. 안정적 버저닝(Versioning)
- `schemaVersion` 필수.
- 이후 스키마 변경 시 마이그레이션 가능하도록 설계.

### P3. 최소 강제, 최대 확장
- MVP에 필요한 필수 필드만 강제.
- 확장 필드는 optional + `extensions`로 수용.

### P4. 좌표 시스템은 단일 표준
- 모든 오브젝트는 동일한 좌표계에서 정의되어야 하며,
- Export/Zoom/Pan이 일관돼야 한다.

---

## 1) 문서 범위 / 비범위

### 1.1 범위 (MVP)
- Play(단일 다이어그램) 표현
- Formation 프리셋/배치 정보
- Actions: Route / Block / Motion / Landmark(Aim point) / Text / Group
- Concept 템플릿(패스/런) 정의
- Suggestion 관련 메타(필요 리시버 수, 추천 포메이션, 런 조건 태그)
- Playbook(플레이 모음) 최소 구조

### 1.2 비범위 (MVP에서 저장하지 않음)
- 애니메이션 타임라인(프레임/시간 기반)
- 성공률/기대야드/고급 분석 수치
- 영상/필름 타임코드
- 실시간 공동편집 CRDT/OT 메타

---

## 2) 공통 타입/규칙

### 2.1 식별자 규칙
- 모든 주요 객체는 `id`(string) 필수.
- 권장: ULID/UUID.  
- 참조는 id로만 수행(객체 중복 금지).

### 2.2 스키마 버전
- 최상위 `schemaVersion: "1.0"`
- 하위 호환을 위해 `minReaderVersion`, `minWriterVersion` 옵션 제공 가능(후순위)

### 2.3 시간/작성자 메타
- `createdAt`, `updatedAt`: ISO-8601 string
- `createdBy`, `updatedBy`: userId

### 2.4 확장 필드
- 모든 최상위 엔터티에 `extensions?: Record<string, any>` 허용
- 네임스페이스 권장: `vendor.foroffensecoach.*`

---

## 3) 좌표 시스템 (Coordinate System)

### 3.1 캔버스 기준
- 필드는 **정규화 좌표(Normalized Field Coordinates)** 로 표현한다.
- X축: 필드 가로 방향 (좌 → 우) : `0.0 ~ 1.0`
- Y축: LOS 기준 세로 방향 (스크리미지 라인 중심) : `-1.0 ~ +1.0`
  - `y = 0`이 LOS
  - `y < 0`는 백필드(오펜스 뒤)
  - `y > 0`는 디펜스 방향(오펜스 진행 방향)

> 장점: 화면 크기/해상도에 독립적, export 안정적.

### 3.2 방향(Orientation)
- 기본: offense moves toward +Y.
- 반대 방향이 필요하면:
  - `field.orientation: "up" | "down"`
  - 혹은 렌더러에서 flip.
- 데이터는 기본적으로 **항상 +Y 진행**을 권장(저장 일관성).

### 3.3 스냅/가이드용 참조선
- `field.hashMarks`: left/right hash x 좌표
- `field.numbers`: number 영역 x 좌표
- `field.losY`: 0 고정

> MVP에서 hash/number는 렌더러 설정값으로도 가능.  
> DSL에는 기본 프리셋만 둔다.

---

## 4) 최상위 엔터티

## 4.1 Play (단일 플레이 다이어그램)
```json
{
  "schemaVersion": "1.0",
  "type": "play",
  "id": "play_01H...",
  "name": "Ace Right Power",
  "description": "Short-yardage power to strong",
  "tags": ["run", "short-yardage", "21p", "ace", "power"],
  "meta": {
    "personnel": "21",
    "unit": "offense",
    "strength": "right",
    "formationId": "formation_ace_right",
    "conceptId": "concept_run_power",
    "nflStyle": true
  },
  "field": {
    "orientation": "up",
    "showGrid": true,
    "showHash": true
  },
  "roster": {
    "players": [],
    "groups": []
  },
  "actions": [],
  "notes": {
    "callName": "Ace Rt Power",
    "coachingPoints": [
      "Backside G pull & kick",
      "TE down block",
      "RB aim point inside leg of TE"
    ]
  },
  "history": {
    "version": 3,
    "derivedFrom": {
      "sourcePlayId": null,
      "sourceConceptId": "concept_run_power",
      "sourceTeamId": null
    }
  },
  "createdAt": "2026-01-12T12:00:00Z",
  "updatedAt": "2026-01-12T12:10:00Z",
  "createdBy": "user_123",
  "updatedBy": "user_123",
  "extensions": {}
}
````

### 4.1.1 Play 필드 정의

* `name` (required): 사용자 표시명
* `tags` (optional): 검색/필터용
* `meta` (optional but recommended)

  * `personnel`: "10"|"11"|"12"|"20"|"21"|"22"|...
  * `unit`: "offense"|"defense"|"special"
  * `strength`: "left"|"right"|"none"
  * `formationId`: 참조 id
  * `conceptId`: 참조 id
  * `nflStyle`: boolean(권위 태그)
* `field`: 렌더 옵션(데이터 자체가 아닌 “표시” 설정)
* `roster.players`: 선수(오브젝트) 집합
* `actions`: 루트/블록 등 “행동” 집합
* `notes`: 코치 노트(텍스트)

---

## 4.2 Playbook (플레이 모음)

```json
{
  "schemaVersion": "1.0",
  "type": "playbook",
  "id": "pb_01H...",
  "name": "2026 Offense Base",
  "tags": ["2026", "base", "offense"],
  "sections": [
    {
      "id": "sec_run",
      "name": "Run",
      "playIds": ["play_01H...", "play_01H..."]
    },
    {
      "id": "sec_pass",
      "name": "Pass",
      "playIds": ["play_01H..."]
    }
  ],
  "exportSettings": {
    "pageStyle": "classic",
    "includeNotes": true,
    "includeGrid": false,
    "footer": "playName+page"
  },
  "createdAt": "2026-01-12T12:00:00Z",
  "updatedAt": "2026-01-12T12:10:00Z",
  "createdBy": "user_123",
  "updatedBy": "user_123"
}
```

---

## 4.3 Formation (프리셋 배치 템플릿)

> Formation은 “플레이 생성의 초기 상태”를 제공한다.

```json
{
  "schemaVersion": "1.0",
  "type": "formation",
  "id": "formation_ace_right",
  "name": "Ace Right",
  "meta": {
    "personnelHint": ["11", "12"],
    "structure": "2x2",
    "strength": "right"
  },
  "defaults": {
    "players": [
      { "id": "p_qb", "role": "QB", "label": "QB", "x": 0.5, "y": -0.25 },
      { "id": "p_rb", "role": "RB", "label": "RB", "x": 0.55, "y": -0.45 },
      { "id": "p_c",  "role": "C",  "label": "C",  "x": 0.5, "y": 0.0 },
      { "id": "p_rg", "role": "RG", "label": "RG", "x": 0.54, "y": 0.0 },
      { "id": "p_rt", "role": "RT", "label": "RT", "x": 0.58, "y": 0.0 },
      { "id": "p_lg", "role": "LG", "label": "LG", "x": 0.46, "y": 0.0 },
      { "id": "p_lt", "role": "LT", "label": "LT", "x": 0.42, "y": 0.0 },
      { "id": "p_y",  "role": "Y",  "label": "Y",  "x": 0.66, "y": -0.02 },
      { "id": "p_x",  "role": "X",  "label": "X",  "x": 0.15, "y": 0.02 },
      { "id": "p_z",  "role": "Z",  "label": "Z",  "x": 0.85, "y": 0.02 }
    ],
    "snapRules": {
      "olSpacingPreset": "standard",
      "wrSplitPreset": "normal",
      "lockCenterToHash": false
    }
  }
}
```

---

## 4.4 Concept (컨셉 템플릿: Pass/Run)

> Concept는 추천/자동생성의 “레시피”다.

```json
{
  "schemaVersion": "1.0",
  "type": "concept",
  "id": "concept_pass_flood",
  "name": "Flood",
  "conceptType": "pass",
  "summary": "3-level outside stretch vs zone",
  "badges": ["nfl_style"],
  "requirements": {
    "minEligibleReceivers": 3,
    "preferredStructures": ["3x1", "bunch"],
    "personnelHints": ["11", "12"]
  },
  "template": {
    "roles": [
      { "roleName": "CLEAR", "appliesTo": ["Z", "X"], "defaultRoute": { "pattern": "go", "depth": 18 } },
      { "roleName": "INTERMEDIATE", "appliesTo": ["Y"], "defaultRoute": { "pattern": "deep_out", "depth": 12 } },
      { "roleName": "FLAT", "appliesTo": ["RB"], "defaultRoute": { "pattern": "arrow", "depth": 2 } }
    ],
    "buildPolicy": {
      "placementStrategy": "relative_to_alignment",
      "defaultSide": "strength"
    }
  },
  "suggestionHints": {
    "category": "deep",
    "coverageStress": ["horizontal", "flat_conflict"]
  },
  "installFocus": {
    "failurePoints": [
      {
        "id": "fp_clear_depth",
        "name": "Clear route depth 부족",
        "drill": {
          "name": "Vertical Stem Drill",
          "purpose": "Clear route의 vertical stem 18yd 확보 연습",
          "phase": "indy"
        },
        "videoRefs": [
          {
            "platform": "instagram",
            "url": "https://instagram.com/p/xxx",
            "accountName": "@wrdrill",
            "hashtags": ["#verticalroute", "#wrdrill"]
          }
        ]
      }
    ]
  }
}
```

---

## 5) Roster Model (Players / Groups)

## 5.1 Player Object

```json
{
  "id": "p_x",
  "role": "X",
  "label": "X",
  "unit": "offense",
  "alignment": {
    "x": 0.15,
    "y": 0.02,
    "facing": "up",
    "stance": "two_point",
    "splitPreset": "wide"
  },
  "appearance": {
    "icon": "circle",
    "colorToken": "offense",
    "showLabel": true
  },
  "lock": {
    "positionLocked": false
  },
  "extensions": {}
}
```

### 5.1.1 필드 정의

* `role` (required): 포지션/역할 식별자

  * offense 예: QB, RB, FB, X, Z, Y, H, LT, LG, C, RG, RT
  * defense 예: DE, DT, OLB, MLB, CB, S
* `alignment.x/y` (required)
* `alignment.facing` (optional): "up"|"down"|"left"|"right"
* `stance` (optional): "two_point"|"three_point"|"none"
* `splitPreset` (optional): "wide"|"normal"|"reduced"|"slot"

## 5.2 Group Object (선수 그룹)

> 그룹은 선택/이동/정렬/일괄 적용 편의를 위해 사용.

```json
{
  "id": "g_ol",
  "name": "Offensive Line",
  "memberIds": ["p_lt", "p_lg", "p_c", "p_rg", "p_rt"],
  "type": "unit_group"
}
```

---

## 6) Action Model (Routes / Blocks / Motions / Markers)

### 6.1 공통 Action Base

```json
{
  "id": "a_01",
  "actionType": "route",
  "fromPlayerId": "p_x",
  "layer": "primary",
  "style": { },
  "meta": { },
  "extensions": { }
}
```

#### 공통 필드

* `actionType` (required): "route"|"block"|"motion"|"landmark"|"text"|"assignment"|"path"
* `fromPlayerId` (optional): 주체가 선수일 때
* `layer` (optional): "primary"|"secondary"|"alt"

  * 덮어쓰기 충돌 시 “새 레이어” 전략에 사용
* `style` (optional): 렌더 규칙 토큰

---

## 6.2 Route Action

> “polyline”만 저장하지 말고, **패턴/깊이/브레이크**를 저장해야 편집/자동생성에 유리.

```json
{
  "id": "a_route_x",
  "actionType": "route",
  "fromPlayerId": "p_x",
  "route": {
    "pattern": "slant",
    "depth": 6,
    "breakAngleDeg": 45,
    "direction": "inside",
    "controlPoints": [
      { "x": 0.15, "y": 0.02 },
      { "x": 0.15, "y": 0.20 },
      { "x": 0.22, "y": 0.30 }
    ],
    "endMarker": "arrow"
  },
  "timing": {
    "phase": "post_snap",
    "delayMs": 0
  },
  "style": {
    "line": "solid",
    "thickness": "normal"
  },
  "meta": {
    "conceptRole": "UNDER"
  }
}
```

#### Route.pattern (enum + custom)

* 기본 enum(권장):

  * quick: hitch, speed_out, quick_out, slant, arrow, flat
  * intermediate: curl, dig, out, cross, shallow, whip
  * deep: go, post, corner, deep_out, seam
  * special: wheel, return, pivot
* `pattern: "custom"` 허용 + `controlPoints`로 표현

#### Route.controlPoints

* 최소 2개(시작/끝)
* 커브는 렌더러가 bezier 변환 가능
* 편집기에서 control point 드래그로 수정

---

## 6.3 Block Action

> 블로킹은 “대상”이 없을 수도 있다(존블록). 따라서 `toPlayerId`는 optional.

```json
{
  "id": "a_block_rg",
  "actionType": "block",
  "fromPlayerId": "p_rg",
  "block": {
    "scheme": "pull_kick",
    "target": {
      "toPlayerId": null,
      "landmark": { "x": 0.62, "y": 0.12 }
    },
    "notes": "Kick EMOL",
    "pathPoints": [
      { "x": 0.54, "y": 0.0 },
      { "x": 0.58, "y": 0.05 },
      { "x": 0.62, "y": 0.12 }
    ]
  },
  "style": {
    "line": "solid",
    "endMarker": "arrow"
  },
  "meta": {
    "runRole": "PULLER"
  }
}
```

#### Block.scheme (enum)

* zone 계열: reach, zone_step, combo, climb
* gap/pull: down, kick, wrap, pull_lead, pull_kick, trap
* specialty: wham, arc, sift, seal

#### Block.target

* `toPlayerId`: 수비 오브젝트가 있을 때만
* `landmark`: 없으면 좌표 기반 목표점
* MVP에서는 defense를 안 넣을 가능성이 높으므로 landmark 중심 설계가 안전

---

## 6.4 Motion Action (Pre-snap)

```json
{
  "id": "a_motion_z",
  "actionType": "motion",
  "fromPlayerId": "p_z",
  "motion": {
    "motionType": "jet",
    "pathPoints": [
      { "x": 0.85, "y": 0.02 },
      { "x": 0.55, "y": 0.02 }
    ],
    "endAlignment": { "x": 0.55, "y": 0.02 }
  },
  "timing": { "phase": "pre_snap" },
  "style": { "line": "dashed", "endMarker": "none" }
}
```

#### motionType (enum)

* jet, orbit, return, shift, short, custom

---

## 6.5 Landmark Action (Aim Point / Read Key)

```json
{
  "id": "a_aim",
  "actionType": "landmark",
  "landmark": {
    "kind": "aim_point",
    "label": "Aim: B-gap",
    "x": 0.60,
    "y": 0.10
  },
  "style": { "icon": "dot", "size": "small" }
}
```

landmark.kind (enum)

* aim_point, read_key, landmark, cone, alert

---

## 6.6 Text Action (주석)

```json
{
  "id": "a_text_1",
  "actionType": "text",
  "text": {
    "value": "RB: Press C, cut back if 3T widens",
    "x": 0.10,
    "y": -0.70,
    "width": 0.35,
    "align": "left"
  },
  "style": { "fontSize": "sm", "box": true }
}
```

---

## 7) Styling Tokens (렌더링 일관성)

### 7.1 Style Token 원칙

* 실제 색상/두께는 UI 테마에서 정의.
* DSL에는 “토큰”만 저장.

### 7.2 추천 토큰

* line: solid | dashed | dotted
* thickness: thin | normal | thick
* endMarker: arrow | none | circle
* icon: dot | cross | cone | shield
* colorToken: offense | defense | note | highlight

---

## 8) Suggestion / Recommendation Hints (추천 엔진용 메타)

## 8.1 Concept.requirements

* `minEligibleReceivers`
* `preferredStructures` (2x2, 3x1, bunch, I, ace)
* `personnelHints`
* `needsTE` boolean (optional)
* `needsPuller` enum: none | G | T | GT
* `boxTolerance`: 6_ok | 7_ok | 8_risky (run)

## 8.2 Run-specific hints (v1)

```json
{
  "runHints": {
    "bestVsFront": ["even", "odd"],
    "bestVs3T": ["strong", "weak", "none"],
    "bestWhenBox": ["6", "7"],
    "surfaceNeeds": ["te_surface_optional"],
    "aim": "b_gap",
    "category": "gap"
  }
}
```

## 8.3 Pass-specific hints (v1)

```json
{
  "passHints": {
    "category": "intermediate",
    "manBeater": true,
    "zoneBeater": true,
    "stress": ["flat_conflict", "mof"]
  }
}
```

---

## 8.4 Install Focus Model (Drill 추천용 메타데이터)

> Install Focus는 "플레이 설계 → 연습 연결"의 마지막 다리다.
> Concept에 매핑되며, 읽기 전용이다.

### 8.4.1 설계 원칙
- **Failure Point 기반**: 플레이가 아니라 "이 플레이를 망치는 지점"을 겨냥
- **읽기 전용**: 사용자가 수정/편집 불가
- **영상 링크만**: 호스팅 ❌, Instagram 외부 링크만 제공

### 8.4.2 FailurePoint Object

```json
{
  "id": "fp_puller_timing",
  "name": "Puller timing & path",
  "drill": {
    "name": "Pull & Kick Drill",
    "purpose": "Guard가 pull 후 kick 타이밍 연습",
    "phase": "indy"
  },
  "videoRefs": [
    {
      "platform": "instagram",
      "url": "https://instagram.com/p/xxx",
      "thumbnailUrl": "https://...",
      "accountName": "@olinedrills",
      "hashtags": ["#pullblock", "#counterdrill"]
    }
  ]
}
```

#### 필드 정의
* `id` (required): 고유 식별자
* `name` (required): 실패 포인트 이름 (코치에게 표시)
* `drill.name` (required): 드릴 이름
* `drill.purpose` (required): 1줄 목적 설명
* `drill.phase` (required): "indy" | "group" | "team"
* `videoRefs[]` (optional): Instagram 영상 참조 배열 (최대 2개 권장)

#### phase enum
* `indy`: 개인 연습 (Individual)
* `group`: 포지션 그룹 연습
* `team`: 팀 전체 연습

### 8.4.3 VideoRef Object

```json
{
  "platform": "instagram",
  "url": "https://instagram.com/p/xxx",
  "thumbnailUrl": "https://...",
  "accountName": "@coachX",
  "hashtags": ["#floodconcept", "#passinggame"]
}
```

#### 필드 정의
* `platform` (required): "instagram" (향후 확장: youtube, tiktok)
* `url` (required): 외부 링크
* `thumbnailUrl` (optional): 캐시된 썸네일 URL
* `accountName` (required): 출처 계정명
* `hashtags[]` (optional): 수집에 사용된 해시태그

### 8.4.4 Concept 내 installFocus 배치

```json
{
  "type": "concept",
  "id": "concept_run_counter",
  "name": "GT Counter",
  "conceptType": "run",
  // ... 기존 필드들 ...
  "installFocus": {
    "failurePoints": [
      { "id": "fp_1", "name": "Puller timing & path", ... },
      { "id": "fp_2", "name": "RB press & cut decision", ... },
      { "id": "fp_3", "name": "Kick vs Log recognition", ... }
    ]
  }
}
```

> **제한**: 1 Concept당 failurePoints 최대 3개

---

## 9) Build Policies (컨셉 자동 생성 규칙)

### 9.1 Concept.template.buildPolicy

```json
{
  "buildPolicy": {
    "placementStrategy": "relative_to_alignment",
    "defaultSide": "strength",
    "conflictPolicy": "add_layer",
    "routeDepthScale": 1.0,
    "runLandmarks": true
  }
}
```

#### placementStrategy (enum)

* relative_to_alignment: 현재 선수 정렬을 기준으로 루트 배치
* absolute_template: 템플릿 좌표를 그대로 적용(권장X, 포메이션 다양성 낮음)
* hybrid: 일부 절대 + 일부 상대

#### conflictPolicy (enum)

* add_layer (MVP 기본): 기존 액션 유지 + 새 액션은 layer=secondary
* replace_actions: 기존 액션 삭제 후 새 액션 적용 (확인 필요)

---

## 10) Validation Rules (유효성 규칙)

### 10.1 Play validation (저장 전/Export 전)

* schemaVersion 존재
* players 최소 1명 이상
* 모든 action의 `fromPlayerId`는 roster.players에 존재해야 함(있을 때)
* route.controlPoints는 최소 2개
* motion은 pre_snap일 때 dashed 스타일 권장(강제는 아님)

### 10.2 Concept validation

* conceptType pass/run 필수
* requirements.minEligibleReceivers는 pass에 필수
* run concept은 runHints 중 최소 1개 이상 존재 권장

---

## 11) Migration Strategy (버전 변경 대응)

* `schemaVersion`이 바뀌면 마이그레이터가 수행할 수 있도록:

  * enum 값은 가능한 한 안정적으로 유지
  * 확장 필드로 임시 수용 후 정식 필드로 승격
* 권장: v1.1에서 defense units 추가 가능 (toPlayerId 활용 강화)

---

## 12) Example Payloads (실전 예시)

## 12.1 Pass Example — Trips Right Flood

* Formation: trips(3x1)
* Routes: clear/intermediate/flat
* Motion: optional

(요약 구조)

* players: QB, RB, X, Y, Z + OL
* actions:

  * Z go (CLEAR)
  * Y deep_out (INTERMEDIATE)
  * RB arrow (FLAT)
  * X backside dig(optional)

## 12.2 Run Example — Ace Right Power

* blocks:

  * playside down blocks
  * backside guard pull_kick
  * RB aim point B/C

(요약 구조)

* actions:

  * block LT down, LG down, C combo, RG pull_kick, RT down
  * landmark aim_point
  * text coaching points

---

## 13) Implementation Notes (에디터 구현에 미치는 영향)

* Editor는 DSL을 “소스 오브 트루스”로 삼고,

  * 화면 상태(선택, 드래그 중 임시 상태)는 별도 UI state로 유지
* Undo/Redo는

  * (A) 명령 기반(command) 또는
  * (B) DSL 스냅샷 기반
  * 둘 중 선택하되, 저장되는 것은 항상 DSL

---

# 최종 결론

ForOffenseCoach DSL v1.0은 "그림 저장"이 아니라 **코칭 가능한 의도**를 저장한다.
이 DSL이 탄탄하면:

* 추천은 룰 기반으로 확장되고,
* 템플릿/컨셉은 재사용되며,
* 출력/공유/버전이 자연스럽게 연결되고,
* **Install Focus로 플레이 설계 → 연습까지 연결된다.**

> DSL에 `installFocus`가 포함됨으로써 ForOffenseCoach은 "설계 도구"가 아니라
> **"오늘 밤 설계 → 내일 연습까지 연결해주는 코치 플랫폼"**의 기반을 갖춘다.
