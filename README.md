# Local Note

Vite, SvelteKit, TypeScript를 활용한 로컬 메모장 웹 애플리케이션입니다.

## 특징

- 🚀 **SvelteKit + TypeScript**: 현대적인 웹 프레임워크와 타입 안정성
- 💾 **IndexedDB**: 서버 없이 브라우저에서 모든 데이터를 로컬 저장
- ⚡ **Vite**: 빠른 개발 서버와 빌드 시스템
- 📱 **PWA 지원**: 오프라인 사용 가능한 Progressive Web App
- 🌐 **Vercel 배포**: 원클릭 배포 지원
- 📱 **반응형 디자인**: 모바일과 데스크톱 모두 지원

## 개발 환경 설정

프로젝트를 클론하고 의존성을 설치합니다:

```bash
cd local-note
pnpm install
```

## 개발 서버 실행

개발 서버를 시작합니다:

```bash
pnpm dev
```

기본적으로 `http://localhost:3035`에서 실행됩니다.

## 빌드

프로덕션 빌드를 생성합니다:

```bash
pnpm build
```

빌드 결과를 미리보기:

```bash
pnpm preview
```

## Vercel 배포

Vercel에서 자동으로 배포됩니다:

```bash
pnpm vercel-build
```

또는 Vercel CLI를 사용하여:

```bash
vercel --prod
```

## PWA 기능

- **오프라인 지원**: Service Worker를 통한 오프라인 캐싱
- **앱 설치**: 브라우저에서 앱으로 설치 가능
- **푸시 알림**: 향후 알림 기능 지원 예정
- **백그라운드 동기화**: 오프라인 상태에서도 데이터 동기화

## 기술 스택

- **Frontend**: SvelteKit, TypeScript
- **Build Tool**: Vite
- **Storage**: IndexedDB
- **PWA**: Workbox, Service Worker
- **Deployment**: Vercel
- **Package Manager**: pnpm

## 프로젝트 구조

```
local-note/
├── src/
│   ├── routes/          # 페이지 라우팅
│   ├── lib/             # 공통 라이브러리
│   ├── sw.ts            # Service Worker
│   ├── app.html         # HTML 템플릿
│   ├── app.css          # 글로벌 스타일
│   └── app.d.ts         # TypeScript 선언
├── static/              # 정적 파일
│   ├── icon-192.png     # PWA 아이콘 (192x192)
│   ├── icon-512.png     # PWA 아이콘 (512x512)
│   └── favicon.svg      # 파비콘
├── vercel.json          # Vercel 배포 설정
└── package.json
```

## 개발 가이드

### PWA 아이콘 교체

`static/` 디렉토리의 아이콘 파일들을 실제 PNG 이미지로 교체하세요:
- `icon-192.png`: 192x192 픽셀
- `icon-512.png`: 512x512 픽셀

### Service Worker 수정

PWA 기능을 커스터마이징하려면 `src/sw.ts` 파일을 수정하세요.
