# ForOffensiveCoordinator Demo GIF Scenarios

마케팅 및 문서화를 위한 데모 GIF 녹화 시나리오

---

## 녹화 설정

- **해상도**: 1280x720 (720p)
- **FPS**: 30fps
- **길이**: 각 GIF 15-30초
- **포맷**: GIF 또는 WebM
- **도구**: LICEcap, Kap, ScreenToGif

---

## GIF 1: Onboarding Flow (10초)

**파일명**: `onboarding-flow.gif`
**용도**: README, Landing Page

### 시나리오:

```
[0s] Hard Onboarding Modal 표시
     → 3개 컨셉 카드 보임 (Power, Flood, Stick)
[3s] 마우스가 "Power" 카드로 이동
[4s] 카드 hover 효과
[5s] 클릭
[6s] Modal 닫힘
[7s] Editor 화면 표시
[8s] Shotgun 포메이션 + 11명 플레이어 표시
[10s] 끝
```

### 포인트:
- 깔끔한 전환 애니메이션
- 카드 hover 효과 강조
- Editor 진입 시 "즉시 사용 가능" 느낌

---

## GIF 2: Auto-build Magic (15초)

**파일명**: `autobuild-magic.gif`
**용도**: Feature Highlight, Twitter/X

### 시나리오:

```
[0s] Editor 화면 (빈 포메이션)
[2s] Suggestions Panel 열기
[4s] Pass 탭 선택
[5s] "Flood" 컨셉 클릭
[6s] Concept 상세 표시
[7s] "Build" 버튼 클릭
[8s] 로딩 스피너 (0.5초)
[9s] 모든 플레이어에 Route가 그려짐
     → 애니메이션 효과 (순차적 그리기)
[12s] 완성된 플레이 표시
[14s] Success toast "Concept applied!"
[15s] 끝
```

### 포인트:
- Build 버튼 → 결과 간의 "마법" 느낌
- Route가 그려지는 애니메이션 강조
- Before/After 대비

---

## GIF 3: Why This Concept? (12초)

**파일명**: `why-concept.gif`
**용도**: Feature Explanation

### 시나리오:

```
[0s] Suggestions Panel 열림 상태
[2s] 컨셉 카드에서 "Why?" 버튼 hover
[3s] 클릭
[4s] Why 섹션 확장
     → 3개 이유 목록 표시
     - "Beats Cover 2"
     - "Creates horizontal stretch"
     - "Quick release vs pressure"
[8s] 잠시 멈춤 (읽을 시간)
[10s] Why 섹션 닫기
[12s] 끝
```

### 포인트:
- 추천 시스템의 "지능" 강조
- 코치에게 실질적 도움이 되는 정보

---

## GIF 4: Export PNG (8초)

**파일명**: `export-png.gif`
**용도**: Quick Demo

### 시나리오:

```
[0s] 완성된 플레이 화면
[2s] "Export PNG" 버튼 클릭
[3s] 다운로드 시작 (브라우저 다운로드 표시)
[4s] Success toast
[5s] 다운로드 완료
[6s] 다운로드 폴더에서 PNG 파일 표시
[8s] 끝
```

### 포인트:
- 빠른 내보내기 플로우
- 결과물 품질 미리보기

---

## GIF 5: Install Focus Drills (12초)

**파일명**: `install-focus.gif`
**용도**: Feature Highlight

### 시나리오:

```
[0s] 플레이 빌드 완료 상태
[2s] Install Focus Panel 열기
[3s] 패널 확장 (3개 Failure Points 표시)
[5s] 첫 번째 항목 클릭하여 확장
[6s] Drill 정보 표시
     - Name: "3-Step Drop Timing"
     - Purpose: "Ensure QB releases before pressure"
[9s] 비디오 링크 hover (있는 경우)
[11s] 클릭 (새 탭 아이콘 표시)
[12s] 끝
```

### 포인트:
- "플레이 그리기 → 연습 추천" 연결
- 실질적 코칭 도구로서의 가치

---

## GIF 6: Share Link (10초)

**파일명**: `share-link.gif`
**용도**: Collaboration Feature

### 시나리오:

```
[0s] 완성된 플레이 화면
[2s] "Share" 버튼 클릭
[3s] 로딩 (0.5초)
[4s] Toast: "Share link copied!"
[5s] 새 브라우저 탭 열기
[6s] URL 붙여넣기
[7s] 페이지 로딩
[8s] View-only 플레이 표시
[9s] "View Only" 배지 강조
[10s] 끝
```

### 포인트:
- 원클릭 공유의 편리함
- View-only 보안

---

## GIF 7: Formation Swap (8초)

**파일명**: `formation-swap.gif`
**용도**: Flexibility Demo

### 시나리오:

```
[0s] 현재 포메이션: I-Form
[2s] Formation 드롭다운 클릭
[3s] 드롭다운 열림 (6개 포메이션 표시)
[4s] "Shotgun Spread" 선택
[5s] 플레이어 위치 변경 애니메이션
[6s] 새 포메이션 적용 완료
[7s] 액션(Route)도 유지됨 표시
[8s] 끝
```

### 포인트:
- 포메이션 변경의 유연성
- 액션 유지 기능

---

## GIF 8: Validation Warning (10초)

**파일명**: `validation-warning.gif`
**용도**: Quality Assurance Feature

### 시나리오:

```
[0s] 플레이 화면 (일부 플레이어 액션 없음)
[2s] Validation Panel에 경고 표시 (2 warnings)
[3s] Panel 확장
[4s] 경고 목록 표시
     - "Player X has no action"
     - "Center not assigned"
[6s] "Export PDF" 버튼 클릭 시도
[7s] Export 차단 메시지 표시
[8s] 경고 해결 (액션 추가)
[9s] Validation 패스 표시
[10s] 끝
```

### 포인트:
- 품질 보장 시스템
- 실수 방지 기능

---

## Hero GIF: Full Flow (30초)

**파일명**: `hero-demo.gif`
**용도**: Landing Page Hero Section

### 시나리오:

```
[0s] 앱 로고/스플래시
[2s] Onboarding Modal (빠르게)
[4s] 컨셉 선택 → Editor 진입
[6s] Suggestions Panel 열기
[8s] 컨셉 선택 + Why 확인
[12s] Auto-build 실행
[15s] 결과 확인 (완성된 플레이)
[18s] Install Focus 열기
[21s] Drill 확인
[24s] Export PNG
[27s] 다운로드 완료
[29s] 완성된 PNG 이미지 표시
[30s] 끝 (로고 페이드)
```

### 포인트:
- 전체 플로우를 30초 안에 압축
- "아이디어 → 완성 플레이" 과정 시연
- 제품의 핵심 가치 전달

---

## 녹화 팁

1. **커서 강조**: 클릭 시 원형 효과 추가
2. **속도 조절**: 중요 장면은 느리게, 전환은 빠르게
3. **깔끔한 상태**: 불필요한 UI 요소 숨기기
4. **일관된 데이터**: 미리 준비된 예시 데이터 사용
5. **에러 방지**: 녹화 전 전체 플로우 리허설

---

## 체크리스트

- [ ] GIF 1: Onboarding Flow
- [ ] GIF 2: Auto-build Magic
- [ ] GIF 3: Why This Concept?
- [ ] GIF 4: Export PNG
- [ ] GIF 5: Install Focus Drills
- [ ] GIF 6: Share Link
- [ ] GIF 7: Formation Swap
- [ ] GIF 8: Validation Warning
- [ ] Hero GIF: Full Flow

---

## 파일 위치

```
/public/demo/
├── onboarding-flow.gif
├── autobuild-magic.gif
├── why-concept.gif
├── export-png.gif
├── install-focus.gif
├── share-link.gif
├── formation-swap.gif
├── validation-warning.gif
└── hero-demo.gif
```
