# 한국 커뮤니티 애그리게이터

한국의 주요 인터넷 커뮤니티(디시인사이드, 루리웹, 아카라이브)의 게시글을 한 곳에서 모아 볼 수 있는 웹 애플리케이션입니다.

## 기술 스택

### Frontend
- **React** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링

### Backend (예정)
- **Spring** - 백엔드 프레임워크
- **MariaDB** - 데이터베이스

## 주요 기능

1. **여러 커뮤니티 게시글 통합 조회**
   - 디시인사이드, 루리웹, 아카라이브의 게시글을 카드 형식으로 표시

2. **커뮤니티별 필터링**
   - 전체/디씨/루리웹/아카 탭으로 원하는 커뮤니티만 선택하여 조회

3. **검색 기능**
   - 제목과 내용에서 키워드 검색

4. **게시글 상세보기**
   - 게시글 클릭 시 모달로 상세 내용 확인
   - 원문 링크 제공

## 프로젝트 구조

```
community-crawler/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx       # 헤더 및 검색바
│   │   │   ├── PostCard.tsx     # 게시글 카드 컴포넌트
│   │   │   └── PostModal.tsx    # 게시글 상세보기 모달
│   │   └── PostList.tsx         # 게시글 리스트 및 필터
│   ├── data/
│   │   └── mock-posts.json      # Mock 데이터
│   ├── types/
│   │   └── index.ts             # TypeScript 타입 정의
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
└── README.md
```

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`을 열어 확인하세요.

### 빌드

```bash
npm run build
```

### 빌드된 앱 미리보기

```bash
npm run preview
```

## 다음 단계

- [ ] 백엔드 API 개발 (Spring)
- [ ] 실제 커뮤니티 크롤링 기능 구현
- [ ] 데이터베이스 연동 (MariaDB)
- [ ] 실시간 업데이트 기능
- [ ] 사용자 북마크 기능
- [ ] 더 많은 커뮤니티 추가

## 라이선스

MIT
