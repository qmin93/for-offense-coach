# ForOffensiveCoordinator Soft Launch Test Scenarios

P1.5 Soft Launch (5명 테스터) 검증용 시나리오

---

## 테스터 페르소나

| # | 역할 | 경험 수준 | 주요 테스트 포커스 |
|---|------|----------|-------------------|
| T1 | 고교 OC | 초보 | Onboarding Flow, 기본 UX |
| T2 | 대학 GA | 중급 | Suggestions, Auto-build |
| T3 | 프로 스카우트 | 고급 | Export, Share, Snapshot |
| T4 | Youth 코치 | 초보 | 모바일 반응형, 접근성 |
| T5 | QA 엔지니어 | - | Edge cases, 에러 핸들링 |

---

## 테스트 시나리오

### Scenario 1: First-Time User Activation (T1, T4)

**목표**: 신규 유저가 첫 플레이 생성까지 도달하는지 검증

**단계**:
1. 새 브라우저 세션에서 앱 접속
2. Hard Onboarding Modal 표시 확인
3. 3가지 컨셉 중 하나 선택 (Power/Flood/Stick)
4. Editor 진입 확인
5. 선택한 컨셉으로 Auto-build 실행
6. 결과 확인 후 PNG Export

**검증 포인트**:
- [ ] Onboarding Modal이 처음 방문 시 표시됨
- [ ] 컨셉 선택 후 Editor로 즉시 진입
- [ ] Auto-build가 5초 이내에 완료
- [ ] PNG Export 성공

**Telemetry 확인** (Console에서):
```javascript
__telemetry.setDebug(true)
// 플로우 완료 후
__telemetry.verifyActivation()
```

예상 이벤트:
- `onboarding_completed`
- `concept_clicked`
- `autobuild_success`
- `export_png`

---

### Scenario 2: Concept Discovery Flow (T2)

**목표**: 추천 시스템을 통한 컨셉 탐색 플로우 검증

**단계**:
1. Editor에서 포메이션 선택 (Shotgun Spread)
2. Suggestions Panel 열기
3. Pass 탭에서 컨셉 목록 확인
4. "Why" 버튼 클릭하여 이유 확인
5. 다른 컨셉 클릭
6. Auto-build 실행

**검증 포인트**:
- [ ] Suggestions Panel에 최소 5개 컨셉 표시
- [ ] Why 확장 시 이유 목록 표시
- [ ] 컨셉 클릭 시 상세 정보 표시
- [ ] Auto-build 성공

**Telemetry 확인**:
```javascript
__telemetry.getEvents('suggestions_opened')
__telemetry.getEvents('concept_clicked')
__telemetry.getEvents('why_viewed')
```

---

### Scenario 3: Auto-build Failure & Undo (T2, T5)

**목표**: Auto-build 실패 케이스와 Undo 플로우 검증

**단계**:
1. 부적합한 포메이션 선택 (예: WR 부족)
2. Pass 컨셉 Auto-build 시도
3. 실패 메시지 확인
4. 다른 포메이션으로 변경
5. Auto-build 성공
6. 30초 이내에 Undo (Ctrl+Z)

**검증 포인트**:
- [ ] 실패 시 명확한 에러 메시지 (missing roles)
- [ ] 실패 후 다른 컨셉 시도 가능
- [ ] Undo가 빌드 결과를 되돌림

**Telemetry 확인**:
```javascript
__telemetry.verifyFail() // autobuild_fail 확인
__telemetry.verifyUndo() // undo_after_autobuild 확인
```

---

### Scenario 4: Validation & Export Block (T3, T5)

**목표**: Validation 경고와 Export 차단 플로우 검증

**단계**:
1. 플레이 생성 후 일부 플레이어 삭제
2. Validation Panel 확인 (에러 표시)
3. PDF Export 시도
4. Export 차단 메시지 확인
5. 플레이어 복구 후 Export 성공

**검증 포인트**:
- [ ] Validation Panel에 에러 표시
- [ ] 에러 있을 때 Export 차단
- [ ] 차단 사유 명확히 표시
- [ ] 수정 후 Export 가능

**Telemetry 확인**:
```javascript
__telemetry.getEvents('validation_error_viewed')
__telemetry.getEvents('export_blocked_by_validation')
__telemetry.getEvents('export_pdf')
```

---

### Scenario 5: Share Link Flow (T3)

**목표**: Share Link 생성 및 공유 플로우 검증

**단계**:
1. 플레이 저장 (Save 버튼)
2. Share 버튼 클릭
3. 링크가 클립보드에 복사됨 확인
4. 새 브라우저/시크릿 모드에서 링크 열기
5. View-only 모드로 플레이 확인

**검증 포인트**:
- [ ] Share 링크 생성 성공
- [ ] 클립보드 복사 성공 (toast 표시)
- [ ] 링크 접속 시 플레이 표시
- [ ] View-only 모드에서 수정 불가

**Telemetry 확인**:
```javascript
__telemetry.getEvents('share_link_created')
```

---

### Scenario 6: Install Focus Panel (T2)

**목표**: Install Focus 패널 활용 플로우 검증

**단계**:
1. 컨셉 Auto-build 완료
2. Install Focus 패널 열기
3. Failure Points 목록 확인
4. 각 항목 확장하여 Drill 정보 확인
5. 비디오 링크 클릭 (있는 경우)

**검증 포인트**:
- [ ] Install Focus 패널에 Failure Points 표시
- [ ] Drill 정보 (name, purpose) 표시
- [ ] 비디오 링크 동작 (새 탭 열림)

**Telemetry 확인**:
```javascript
__telemetry.getEvents('install_focus_opened')
__telemetry.getEvents('drill_video_clicked')
```

---

### Scenario 7: Snapshot Management (T3, T5)

**목표**: Snapshot 저장/로드/삭제 플로우 검증

**단계**:
1. 플레이 생성 및 수정
2. Snapshot 저장 (이름 지정)
3. 추가 수정
4. 다른 Snapshot 저장
5. 첫 번째 Snapshot 로드
6. 이전 상태로 복구 확인
7. Snapshot 삭제

**검증 포인트**:
- [ ] Snapshot 저장 성공
- [ ] 여러 Snapshot 관리 가능
- [ ] Snapshot 로드 시 정확한 상태 복구
- [ ] Snapshot 삭제 성공

---

### Scenario 8: Mobile Responsive (T4)

**목표**: 모바일/태블릿 환경에서의 기본 사용성 검증

**단계**:
1. 모바일 해상도로 앱 접속 (375px)
2. Onboarding 완료
3. 캔버스 핀치 줌/드래그
4. Suggestions Panel 열기/닫기
5. PNG Export

**검증 포인트**:
- [ ] UI 요소가 터치 가능한 크기
- [ ] 캔버스 제스처 동작
- [ ] 패널이 적절히 표시/숨김
- [ ] Export 동작

---

## Edge Cases (T5 전용)

### E1: 빈 포메이션 Auto-build
- 플레이어 0명 상태에서 Auto-build 시도
- 예상: 명확한 에러 메시지

### E2: 네트워크 끊김 상태 저장
- 오프라인 상태에서 Save 시도
- 예상: 에러 처리 및 로컬 백업

### E3: 동시 편집 시도
- 같은 플레이 두 탭에서 편집
- 예상: 충돌 방지 또는 경고

### E4: 최대 플레이어 수 초과
- 11명 이상 플레이어 추가 시도
- 예상: 추가 차단 및 메시지

### E5: 긴 텍스트 입력
- 플레이 이름에 200자 입력
- 예상: 적절한 truncation 또는 제한

---

## Telemetry QA Report 실행

모든 테스트 완료 후:

```javascript
// 브라우저 콘솔에서 실행
__telemetry.setDebug(true)  // 디버그 모드 활성화
__telemetry.qaReport()       // 전체 QA 리포트 출력
__telemetry.export()         // JSON 로그 내보내기 (버그 리포트 첨부용)
```

---

## 피드백 수집 양식

각 테스터는 다음 정보를 제공:

1. **테스터 ID**: T1-T5
2. **디바이스**: (예: MacBook M2, iPhone 15, Galaxy S24)
3. **브라우저**: (예: Chrome 130, Safari 18)
4. **시나리오 결과**: PASS / FAIL / PARTIAL
5. **버그 설명**: (FAIL 시)
6. **스크린샷/비디오**: (가능한 경우)
7. **Telemetry Export**: `__telemetry.export()` 결과

---

## Success Criteria

Soft Launch 통과 조건:
- [ ] 모든 시나리오 최소 1회 PASS
- [ ] Critical 버그 0개 (앱 크래시, 데이터 손실)
- [ ] Major 버그 3개 이하
- [ ] Telemetry 이벤트 100% 발생 확인
