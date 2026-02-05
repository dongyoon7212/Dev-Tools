# DevTools - Mini Toolkit

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

## 기술 스택

- **React** 19 + **Vite** 7
- **Tailwind CSS** 4 (커스텀 디자인 토큰)
- **uuid** - UUID v4 생성
- **crypto-js** - 해시 알고리즘
- **diff** - 텍스트 비교
- **change-case** - 케이스 변환
- **marked** - 마크다운 파싱

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

## 프로젝트 구조

```
src/
├── App.jsx                        # 메인 앱 (라우팅, 사이드바, 카테고리 네비게이션)
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
```

## 주요 특징

- **다크 모드** - 시스템 설정 자동 감지 + 수동 토글, localStorage 저장
- **반응형 디자인** - 모바일 사이드바 토글, 데스크톱 고정 사이드바
- **실시간 변환** - 디바운싱 적용으로 타이핑 중 즉시 결과 표시
- **클립보드 복사** - 모든 출력에 원클릭 복사 버튼, 복사 완료 피드백
- **카테고리 네비게이션** - 5개 그룹으로 분류된 사이드바
- **외부 의존성 최소화** - 라우터 없이 상태 기반 화면 전환

## 라이선스

MIT
