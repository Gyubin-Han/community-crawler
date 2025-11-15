import type { CrawlerConfig, BoardConfig } from './types.js';

export const CRAWLER_CONFIG: CrawlerConfig = {
  delay: 3000, // 3초 딜레이 (서버 부하 최소화)
  maxRetries: 3,
  timeout: 10000,
  maxPostsPerBoard: 20, // 게시판당 최대 20개만 수집
};

// 루리웹 게시판 목록
export const RULIWEB_BOARDS: BoardConfig[] = [
  { name: '유머 게시판', url: 'https://bbs.ruliweb.com/community/board/300143' },
  { name: '정치 게시판', url: 'https://bbs.ruliweb.com/community/board/300148' },
];

// 아카라이브 채널 목록
export const ARCALIVE_CHANNELS: BoardConfig[] = [
  { name: '일반', url: 'https://arca.live/b/breaking' },
  { name: '유머', url: 'https://arca.live/b/humor' },
];

// 디시인사이드 갤러리 (비활성화)
export const DCINSIDE_GALLERIES: BoardConfig[] = [
  // robots.txt 제한으로 비활성화
  // { name: '야구갤러리', url: 'https://gall.dcinside.com/board/lists/?id=baseball_new' },
];

export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
