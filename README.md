# DevTools - Mini Toolkit

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/dev-tools)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/dev-tools)

개발자를 위한 미니 도구 모음 웹 애플리케이션. 자주 사용하는 인코딩, 포맷팅, 변환, 비교 도구를 하나의 인터페이스에서 빠르게 사용할 수 있습니다.

## 도구 목록

### Encoders / Decoders

| 도구 | 설명 |
|------|------|
| **Base64** | 텍스트 Base64 인코딩/디코딩, 입출력 스왑 |
| **URL** | URL 인코딩/디코딩, 쿼리스트링 파서 |

### Generators

| 도구 | 설명 |
|------|------|
| **UUID** | UUID v4 생성 (1/5/10개 일괄), 대소문자/하이픈 옵션 |
| **Hash** | MD5, SHA-1, SHA-256, SHA-512 해시 동시 생성 |

### Formatters

| 도구 | 설명 |
|------|------|
| **JSON** | JSON 포맷팅(Beautify/Minify), 들여쓰기 설정, 유효성 검증 |
| **Timestamp** | Unix 타임스탬프 ↔ 날짜 변환, 타임존/단위 선택, 실시간 현재 시간 |

### Text Tools

| 도구 | 설명 |
|------|------|
| **Diff** | 두 텍스트 라인 단위 비교, Side-by-side/Inline 뷰, 대소문자/공백 무시 옵션 |
| **Case** | camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE 등 8종 케이스 변환 |
| **Markdown** | 마크다운 에디터 + 실시간 미리보기, GFM 지원, HTML 복사 |

### Development

| 도구 | 설명 |
|------|------|
| **Regex** | 정규식 테스트, 플래그 토글, 매치 하이라이트 및 그룹 표시 |
| **Color** | 컬러 피커, HEX/RGB/HSL 상호 변환, 슬라이더 조절 |

---

## 기술 스택

- **React** 19 + **Vite** 7
- **Tailwind CSS** 4 (커스텀 디자인 토큰)
- **uuid** - UUID v4 생성
- **crypto-js** - 해시 알고리즘
- **diff** - 텍스트 비교
- **change-case** - 케이스 변환
- **marked** - 마크다운 파싱

---

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

---

## 배포 가이드

### 배포 플랫폼 비교

| 플랫폼 | 무료 티어 | 장점 | 단점 |
|--------|----------|------|------|
| **Vercel** | 무제한 | 가장 빠른 배포, 자동 HTTPS, 글로벌 CDN | 상용 프로젝트 제한 |
| **Netlify** | 월 100GB | 쉬운 설정, 폼/함수 지원 | 빌드 시간 제한 |
| **GitHub Pages** | 완전 무료 | GitHub 통합, 무제한 | SPA 라우팅 설정 필요 |
| **Docker + Cloud** | 유료 | 완전한 제어, 확장성 | 설정 복잡, 비용 발생 |

---

### 1. Vercel 배포 (추천)

#### 원클릭 배포
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/dev-tools)

#### CLI 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포 (프로덕션)
vercel --prod
```

#### 환경변수 설정 (선택)

Vercel 대시보드에서 설정:
- `VITE_GA_ID` - Google Analytics ID (예: G-XXXXXXXXXX)

#### 커스텀 도메인 연결

1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. 도메인 입력 (예: devtools.yourdomain.com)
3. DNS 설정:
   - **A Record**: `76.76.21.21`
   - **CNAME**: `cname.vercel-dns.com`

---

### 2. Netlify 배포

#### 원클릭 배포
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/dev-tools)

#### CLI 배포

```bash
# Netlify CLI 설치
npm i -g netlify-cli

# 로그인
netlify login

# 배포
netlify deploy --prod
```

#### 설정 파일
`netlify.toml`이 프로젝트에 포함되어 있어 자동으로 설정됩니다.

---

### 3. GitHub Pages 배포

#### 설정

1. `vite.config.js`에 base 경로 추가:

```js
export default defineConfig({
  base: '/dev-tools/', // 저장소 이름
  // ... 기존 설정
})
```

2. GitHub Actions 워크플로우 생성:

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

3. Repository Settings → Pages → Source: "gh-pages" 브랜치 선택

---

### 4. Docker 배포

#### 로컬 빌드 및 실행

```bash
# 이미지 빌드
docker build -t devtools .

# 컨테이너 실행
docker run -d -p 8080:80 devtools

# 브라우저에서 http://localhost:8080 접속
```

#### Docker Compose

`docker-compose.yml`:
```yaml
version: '3.8'
services:
  devtools:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

```bash
docker-compose up -d
```

#### AWS ECS / GCP Cloud Run 배포

```bash
# AWS ECR에 푸시
aws ecr get-login-password | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com
docker tag devtools:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/devtools:latest
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/devtools:latest

# GCP Artifact Registry에 푸시
gcloud auth configure-docker REGION-docker.pkg.dev
docker tag devtools:latest REGION-docker.pkg.dev/PROJECT_ID/devtools/devtools:latest
docker push REGION-docker.pkg.dev/PROJECT_ID/devtools/devtools:latest
```

---

## 프로덕션 최적화

### 적용된 최적화

- **코드 스플리팅**: 각 도구 컴포넌트 lazy loading
- **청크 분리**: React, crypto, text 라이브러리 별도 청크
- **에셋 캐싱**: 1년 캐시 + immutable 헤더
- **Gzip 압축**: Nginx/CDN 레벨 압축
- **PWA 지원**: Service Worker, 오프라인 캐싱, 설치 가능

### 번들 분석

```bash
# 번들 사이즈 확인
npm run build

# 상세 분석 (vite-bundle-visualizer 설치 필요)
npx vite-bundle-visualizer
```

---

## PWA 아이콘 생성

`public/icons/` 디렉토리에 아이콘을 추가하세요:

```bash
# PWA Asset Generator 사용
npx pwa-asset-generator logo.png ./public/icons --index index.html --manifest public/manifest.json
```

또는 [RealFaviconGenerator](https://realfavicongenerator.net/)에서 생성

---

## Google Analytics 설정

1. [Google Analytics](https://analytics.google.com/) 에서 GA4 속성 생성
2. 측정 ID 복사 (G-XXXXXXXXXX 형식)
3. `index.html`에서 `G-XXXXXXXXXX`를 실제 ID로 교체

---

## 환경변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_GA_ID` | Google Analytics ID | - |

---

## 배포 후 체크리스트

- [ ] 모든 도구가 정상 작동하는지 확인
- [ ] 다크모드 정상 작동
- [ ] 모바일 반응형 확인
- [ ] 복사 기능 테스트
- [ ] Lighthouse 점수 확인 (목표: 90점 이상)
- [ ] 다양한 브라우저 테스트 (Chrome, Firefox, Safari)
- [ ] PWA 설치 테스트
- [ ] SEO 메타태그 확인
- [ ] OG 이미지 미리보기 확인

### Lighthouse 점수 확인

```bash
# Chrome DevTools에서
1. F12 → Lighthouse 탭
2. Categories: Performance, Accessibility, Best Practices, SEO, PWA
3. Analyze page load

# CLI에서
npx lighthouse https://your-site.com --view
```

---

## 프로젝트 구조

```
src/
├── App.jsx                        # 메인 앱 (라우팅, 사이드바, lazy loading)
├── main.jsx                       # 엔트리 포인트
├── index.css                      # 글로벌 스타일 (Tailwind 테마, 마크다운 CSS)
├── components/
│   ├── CopyButton.jsx             # 공통 복사 버튼 컴포넌트
│   └── tools/
│       ├── Base64Tool.jsx
│       ├── UrlEncoderTool.jsx
│       ├── UuidTool.jsx
│       ├── HashTool.jsx
│       ├── JsonFormatterTool.jsx
│       ├── TimestampTool.jsx
│       ├── DiffTool.jsx
│       ├── CaseTool.jsx
│       ├── MarkdownTool.jsx
│       ├── RegexTool.jsx
│       └── ColorPickerTool.jsx
└── hooks/
    ├── useDebounce.js             # 입력 디바운싱
    └── useCopyToClipboard.js      # 클립보드 복사

public/
├── favicon.svg                    # SVG 파비콘
├── manifest.json                  # PWA 매니페스트
├── sw.js                          # Service Worker
├── robots.txt                     # 크롤러 설정
├── sitemap.xml                    # 사이트맵
└── icons/                         # PWA 아이콘들
```

---

## 주요 특징

- **다크 모드** - 시스템 설정 자동 감지 + 수동 토글, localStorage 저장
- **반응형 디자인** - 모바일 사이드바 토글, 데스크톱 고정 사이드바
- **실시간 변환** - 디바운싱 적용으로 타이핑 중 즉시 결과 표시
- **클립보드 복사** - 모든 출력에 원클릭 복사 버튼, 복사 완료 피드백
- **카테고리 네비게이션** - 5개 그룹으로 분류된 사이드바
- **PWA 지원** - 오프라인 사용, 홈 화면 설치 가능
- **코드 스플리팅** - 각 도구 lazy loading으로 초기 로딩 최적화

---

## 라이선스

MIT
