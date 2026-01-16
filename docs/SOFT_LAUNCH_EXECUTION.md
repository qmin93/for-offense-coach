# Soft Launch 실행 가이드

5명 테스터 대상 Soft Launch 실행 플랜

---

## 테스터 배정

| ID | 역할 | 연락처 | 과제 |
|----|------|--------|------|
| T1 | 고교 OC | - | A, B |
| T2 | 대학 GA | - | A, B |
| T3 | 프로 스카우트 | - | A, B |
| T4 | Youth 코치 | - | A |
| T5 | QA 엔지니어 | - | A, B |

---

## 과제 정의

### 과제 A: 30초 히어로 플로우 (전원 필수)

**목표**: Concept → Auto-build → PNG Export → Share 링크 열기

**단계**:
1. 앱 접속 (새 브라우저 세션)
2. Hard Onboarding에서 컨셉 선택 (Power/Flood/Stick)
3. Auto-build 결과 확인
4. "Export PNG" 클릭 → 파일 저장
5. "Share" 클릭 → 링크 복사
6. 새 탭에서 Share 링크 열기 → 플레이 확인

**예상 소요**: 2-3분

**완료 기준**: Share 링크에서 플레이가 보이면 성공

---

### 과제 B: Playbook PDF Export (T1, T2, T3, T5)

**목표**: 6개 플레이 → Playbook → PDF Export

**단계**:
1. 6개 플레이 생성 (각기 다른 컨셉)
2. Playbook으로 묶기
3. PDF Export (Classic 스타일)
4. PDF 파일 확인
5. PDF Export (Minimal 스타일)
6. 두 PDF 비교

**예상 소요**: 10-15분

**완료 기준**: 2개 PDF 파일 생성 및 인쇄 가능 품질 확인

---

## 테스터 안내 메시지 (복붙용)

```
안녕하세요, ForOffensiveCoordinator 테스트에 참여해 주셔서 감사합니다!

📋 테스트 방법:
1. 아래 링크로 앱에 접속하세요
   [앱 URL]

2. 과제를 수행하세요 (아래 참조)

3. 완료 후 브라우저 콘솔(F12)에서 다음 명령어 실행:
   __telemetry.export()

4. 출력된 JSON을 복사해서 저에게 보내주세요

5. 아래 3문항에 답변해 주세요

📝 과제 A (필수, 3분):
- 앱 접속 → 컨셉 선택 → Auto-build → PNG Export → Share 링크 열기

📝 과제 B (선택, 15분):
- 6개 플레이 생성 → Playbook → PDF Export (Classic/Minimal 둘 다)

❓ 피드백 3문항:
1. 추천 이유가 설득력 있었나요? (1~5점)
2. 자동생성 결과가 수정해서라도 쓸만했나요? (1~5점)
3. PDF 출력물이 현장에서 쓸 퀄리티인가요? (1~5점)

감사합니다!
```

---

## Telemetry 로그 수집

### 테스터가 실행할 명령어

```javascript
// 브라우저 콘솔(F12)에서 실행
__telemetry.export()
```

### 출력 형식 (JSON)

```json
{
  "exportedAt": "2024-01-16T10:30:00.000Z",
  "stats": {
    "totalEvents": 15,
    "eventCounts": {
      "onboarding_completed": 1,
      "concept_clicked": 2,
      "autobuild_success": 2,
      "export_png": 1,
      "share_link_created": 1
    },
    "sessionDuration": 180000
  },
  "events": [...]
}
```

### 로그 저장 위치

```
/telemetry-logs/
├── T1_2024-01-16.json
├── T2_2024-01-16.json
├── T3_2024-01-16.json
├── T4_2024-01-16.json
└── T5_2024-01-16.json
```

---

## 피드백 수집

### 3문항 응답 기록

| 테스터 | Q1 추천이유 | Q2 자동생성 | Q3 PDF품질 | 비고 |
|--------|------------|------------|-----------|------|
| T1 | /5 | /5 | /5 | |
| T2 | /5 | /5 | /5 | |
| T3 | /5 | /5 | /5 | |
| T4 | /5 | /5 | N/A | 과제B 미수행 |
| T5 | /5 | /5 | /5 | |

### 평균 점수 목표

- Q1 추천이유: **4.0 이상**
- Q2 자동생성: **3.5 이상** (수정해서라도 쓸만)
- Q3 PDF품질: **4.0 이상**

---

## KPI 확인 (24시간 내)

### 1. Activation 성공률

```javascript
// 각 테스터 로그에서 확인
const logs = [T1, T2, T3, T4, T5]; // 수집된 로그
const activationSuccess = logs.filter(log => {
  const events = new Set(log.events.map(e => e.event));
  return events.has('onboarding_completed') &&
         events.has('concept_clicked') &&
         events.has('autobuild_success') &&
         events.has('export_png');
}).length;

console.log(`Activation 성공률: ${activationSuccess}/5 (${activationSuccess*20}%)`);
```

**목표**: 80% 이상 (4/5)

---

### 2. Auto-build 실패율 + Top 실패 코드

```javascript
const allEvents = logs.flatMap(l => l.events);
const buildSuccess = allEvents.filter(e => e.event === 'autobuild_success').length;
const buildFail = allEvents.filter(e => e.event === 'autobuild_fail').length;
const failRate = buildFail / (buildSuccess + buildFail) * 100;

console.log(`Auto-build 실패율: ${failRate.toFixed(1)}%`);

// Top 실패 코드
const failCodes = allEvents
  .filter(e => e.event === 'autobuild_fail')
  .map(e => e.payload.code);
console.log('실패 코드:', failCodes);
```

**목표**: 20% 미만

**액션 규칙**:
- 20% 이상 → suggestion 필터 강화 (불가능한 컨셉 노출 줄이기)

---

### 3. Undo After Autobuild 비율

```javascript
const undoAfterBuild = allEvents.filter(e => e.event === 'undo_after_autobuild').length;
const undoRate = undoAfterBuild / buildSuccess * 100;

console.log(`Undo after autobuild 비율: ${undoRate.toFixed(1)}%`);
```

**목표**: 30% 미만

**액션 규칙**:
- 30% 이상 → 추천 품질 문제가 아니라 **auto-build 템플릿 품질** 문제
- 컨셉별 템플릿(루트 각도/깊이) 손보기

---

### 4. Export 성공률 (PNG/PDF 각각)

```javascript
const pngEvents = allEvents.filter(e => e.event === 'export_png');
const pngSuccess = pngEvents.filter(e => e.payload.success).length;
const pngFailRate = (pngEvents.length - pngSuccess) / pngEvents.length * 100;

const pdfEvents = allEvents.filter(e => e.event === 'export_pdf');
const pdfSuccess = pdfEvents.filter(e => e.payload.success).length;
const pdfFailRate = (pdfEvents.length - pdfSuccess) / pdfEvents.length * 100;

console.log(`PNG Export 실패율: ${pngFailRate.toFixed(1)}%`);
console.log(`PDF Export 실패율: ${pdfFailRate.toFixed(1)}%`);
```

**목표**: 5% 미만

**액션 규칙**:
- 5% 이상 → 캡처 안정화(폰트/렌더/메모리) 우선 패치

---

### 5. Validation Error로 막힌 비율

```javascript
const exportBlocked = allEvents.filter(e => e.event === 'export_blocked_by_validation').length;
const totalExportAttempts = pngEvents.length + pdfEvents.length + exportBlocked;
const blockedRate = exportBlocked / totalExportAttempts * 100;

console.log(`Export blocked by validation: ${blockedRate.toFixed(1)}%`);
```

**목표**: 10% 미만

---

## 액션 결정 매트릭스

| KPI | 현재 | 목표 | 상태 | 액션 |
|-----|------|------|------|------|
| Activation 성공률 | ?% | 80%+ | | |
| Auto-build 실패율 | ?% | <20% | | |
| Undo after autobuild | ?% | <30% | | |
| Export 실패율 | ?% | <5% | | |
| Validation blocked | ?% | <10% | | |

---

## P1.2 폴리싱 스프린트 (1일)

### 규칙
- **테스터 로그 기반 상위 3개 문제만 고침**
- 나머지는 절대 안 건드림 (스코프 폭발 금지)

### 흔한 Top 3 후보

1. **Auto-build 템플릿 품질**
   - 특정 컨셉 루트 각도/깊이 어색
   - 해결: concepts-pass.ts / concepts-run.ts 템플릿 수정

2. **Run Suggestion 입력 UX**
   - Box/Front 선택이 귀찮음
   - 해결: 기본값 자동 선택 또는 UI 단순화

3. **Export 렌더링 깨짐**
   - 폰트/라인 가끔 깨짐
   - 해결: SVG 직렬화 안정화, 폰트 임베딩

---

## P2 방향 결정

### 결정 기준

| 상황 | P2 방향 |
|------|---------|
| Activation 좋음 + 계속 쓸 이유 약함 | Install Focus 확장 (10개 컨셉) |
| Activation 낮음 + 시작부터 헤맴 | TeamProfile → FormationPackage |
| Auto-build 실패/Undo 높음 | P1.2에서 템플릿 품질 먼저 |

---

## 체크리스트

### Soft Launch 전
- [ ] 테스터 5명 연락처 확보
- [ ] 앱 배포 URL 준비
- [ ] 테스터 안내 메시지 전송

### Soft Launch 중
- [ ] T1 과제 A 완료 + 로그 수집
- [ ] T2 과제 A 완료 + 로그 수집
- [ ] T3 과제 A 완료 + 로그 수집
- [ ] T4 과제 A 완료 + 로그 수집
- [ ] T5 과제 A 완료 + 로그 수집
- [ ] T1 과제 B 완료 + 로그 수집
- [ ] T2 과제 B 완료 + 로그 수집
- [ ] T3 과제 B 완료 + 로그 수집
- [ ] T5 과제 B 완료 + 로그 수집

### Soft Launch 후 (24시간 내)
- [ ] 모든 로그 수집 완료
- [ ] KPI 5개 계산 완료
- [ ] 피드백 3문항 평균 계산
- [ ] 상위 3개 문제 식별
- [ ] P1.2 폴리싱 완료
- [ ] P2 방향 확정
