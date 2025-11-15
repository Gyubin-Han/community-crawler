# Community Crawler (Puppeteer)

루리웹, 아카라이브 등 한국 커뮤니티 크롤러 (Puppeteer 기반)

## 특징

- ✅ **Puppeteer** - 실제 Chrome 브라우저 사용
- ✅ **Stealth Plugin** - 봇 탐지 우회
- ✅ **TLS Fingerprinting 우회** - 403 에러 해결
- ✅ **안전 장치** - 딜레이, 재시도 로직, robots.txt 준수

## 설치

### 1. 의존성 설치

```bash
cd crawler
npm install
```

### 2. Chrome/Chromium 설치 (필수)

Puppeteer가 Chrome을 자동으로 다운로드하지 못하는 경우, 시스템에 Chrome을 설치해야 합니다:

**Windows:**
- [Chrome 다운로드](https://www.google.com/chrome/)

**Mac:**
```bash
brew install --cask google-chrome
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y chromium-browser
```

또는 Puppeteer가 Chrome을 자동으로 다운로드하도록:
```bash
node node_modules/puppeteer/install.mjs
```

## 사용법

### 테스트 실행 (한 번만)

```bash
npm test
```

### 스케줄러 실행 (30분마다 자동 실행)

```bash
npm start
```

### 개발 모드 (코드 변경 시 자동 재시작)

```bash
npm run dev
```

## 출력

크롤링 결과는 다음 경로에 저장됩니다:
```
../src/data/posts.json
```

프론트엔드에서 이 파일을 import하여 사용합니다.

## 설정

`src/config.ts` 파일에서 설정 변경 가능:

```typescript
export const CRAWLER_CONFIG = {
  delay: 3000,           // 요청 간 딜레이 (ms)
  maxRetries: 3,         // 재시도 횟수
  timeout: 10000,        // 타임아웃 (ms)
  maxPostsPerBoard: 20,  // 게시판당 최대 게시글 수
};
```

## 주의사항

⚠️ **법적/윤리적 책임**
- 크롤링으로 인한 법적 책임은 사용자에게 있습니다
- 서버 부하를 최소화하기 위해 적절한 딜레이를 설정하세요
- robots.txt를 준수합니다

⚠️ **기술적 제약**
- Puppeteer는 리소스를 많이 사용합니다 (메모리 ~200MB)
- 헤드리스 브라우저 실행 시간이 필요합니다
- 여전히 차단될 수 있습니다 (Cloudflare 고급 탐지)

## 트러블슈팅

### Chrome not found 에러

```bash
# Puppeteer가 Chrome을 찾지 못하는 경우
# 시스템 Chrome 경로 지정 (puppeteer-fetcher.ts 수정)
executablePath: '/usr/bin/chromium-browser',  // Linux
executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',  // Mac
executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',  // Windows
```

### 403 Forbidden 여전히 발생

- Cloudflare가 더 강화되었을 수 있습니다
- User-Agent를 최신 버전으로 업데이트
- 더 긴 딜레이 설정
- VPN/프록시 사용 고려

### 메모리 부족

```typescript
// puppeteer-fetcher.ts에서 headless 모드 유지
headless: true,  // 'new'로 변경하면 더 적은 메모리 사용
```

## 다음 단계

- [ ] HTML 선택자 실제 페이지에 맞게 조정
- [ ] 더 많은 게시판 추가
- [ ] 에러 핸들링 강화
- [ ] Spring 백엔드로 마이그레이션
