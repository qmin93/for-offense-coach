# ForOffensiveCoordinator Deployment Guide

Soft Launch 배포를 위한 가이드

---

## 배포 옵션

### Option 1: Vercel (권장)

1. **GitHub 연동**
   ```bash
   git remote add origin https://github.com/your-org/foroffensivecoordinator.git
   git push -u origin main
   ```

2. **Vercel 프로젝트 생성**
   - https://vercel.com/new 접속
   - GitHub 저장소 선택
   - Framework: Next.js (자동 감지)

3. **환경 변수 설정**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/foroffensecoach
   ```

4. **배포**
   - "Deploy" 클릭
   - 배포 URL: `https://your-app.vercel.app`

### Option 2: 로컬 서버 (테스트용)

1. **환경 변수 설정**
   ```bash
   cp .env.example .env.local
   # .env.local 파일 수정
   ```

2. **데이터베이스 설정**
   ```bash
   npm run db:generate
   npm run db:push
   ```

3. **빌드 및 실행**
   ```bash
   npm run build
   npm run start
   ```

4. **ngrok으로 외부 접근 허용** (옵션)
   ```bash
   ngrok http 3000
   ```

---

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `DATABASE_URL` | O | PostgreSQL 연결 문자열 |
| `NEXT_PUBLIC_SUPABASE_URL` | X | Supabase Auth용 (미사용) |
| `NEXT_PUBLIC_POSTHOG_KEY` | X | 분석용 (미사용) |

---

## 데이터베이스 설정

### Supabase (권장)

1. https://supabase.com 에서 프로젝트 생성
2. Settings > Database > Connection string 복사
3. `DATABASE_URL`에 설정

### Neon (대안)

1. https://neon.tech 에서 프로젝트 생성
2. Connection string 복사
3. `DATABASE_URL`에 설정

### 스키마 마이그레이션

```bash
# Prisma 클라이언트 생성
npm run db:generate

# 스키마 Push
npm run db:push

# (옵션) Prisma Studio로 데이터 확인
npm run db:studio
```

---

## 배포 전 체크리스트

### 빌드 확인
- [ ] `npm run build` 성공
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 최소화

### 환경 설정
- [ ] DATABASE_URL 설정됨
- [ ] DB 마이그레이션 완료
- [ ] .env.local이 .gitignore에 포함됨

### 기능 검증
- [ ] `/editor/new` 접속 가능
- [ ] Hard Onboarding 표시됨
- [ ] Auto-build 동작함
- [ ] PNG Export 동작함
- [ ] Share 링크 생성됨

### Telemetry 검증
- [ ] 콘솔에서 `__telemetry` 접근 가능
- [ ] `__telemetry.setDebug(true)` 동작
- [ ] `__telemetry.export()` JSON 출력

---

## Soft Launch URL 형식

배포 후 테스터에게 제공할 URL:

```
https://[your-domain]/editor/new
```

예시:
- Vercel: `https://foroffensecoach.vercel.app/editor/new`
- ngrok: `https://abc123.ngrok.io/editor/new`

---

## 모니터링

### 서버 로그
```bash
# Vercel
vercel logs

# 로컬
npm run start 2>&1 | tee server.log
```

### 에러 트래킹
- 현재: console.error로 기록
- 향후: Sentry 연동 예정

---

## 롤백 절차

### Vercel
1. Deployments 탭 접속
2. 이전 배포 선택
3. "Promote to Production" 클릭

### 로컬
```bash
git checkout HEAD~1
npm run build
npm run start
```

---

## 문제 해결

### "Database connection failed"
- DATABASE_URL 확인
- IP 화이트리스트 확인 (Supabase: Settings > Database > Network)

### "Build failed"
```bash
# 캐시 삭제 후 재시도
rm -rf .next
npm run build
```

### "Telemetry not working"
- 브라우저 콘솔 에러 확인
- 새로고침 후 재시도
- localStorage 초기화: `localStorage.clear()`
