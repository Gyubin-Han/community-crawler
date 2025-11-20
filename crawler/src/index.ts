import cron from 'node-cron';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RuliwebCrawler } from './crawlers/ruliweb.js';
import { ArcaliveCrawler } from './crawlers/arcalive.js';
import { PuppeteerFetcher } from './utils/puppeteer-fetcher.js';
import { Logger } from './utils/logger.js';
import { sendPostsToAPI, healthCheck, updatePostContent, fetchEnabledBoards, type BoardDto } from './utils/api-client.js';
import { runWithConcurrency } from './utils/concurrency.js';
import { RULIWEB_BOARDS, ARCALIVE_CHANNELS } from './config.js';
import type { Post, BoardConfig } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../../src/data/posts.json');
const ENABLE_API = process.env.ENABLE_API !== 'false'; // 기본값: true
const SAVE_TO_FILE = process.env.SAVE_TO_FILE === 'true'; // 기본값: false
const CRAWL_CONTENT = process.env.CRAWL_CONTENT !== 'false'; // 기본값: true (본문 크롤링 활성화)
const CONTENT_CONCURRENCY = parseInt(process.env.CONTENT_CONCURRENCY || '5', 10); // 동시 처리 수
const USE_DB_BOARDS = process.env.USE_DB_BOARDS !== 'false'; // 기본값: true (DB에서 게시판 읽기)

async function crawlAll(): Promise<void> {
  Logger.info('========== Starting crawl job ==========');

  // API 헬스 체크
  if (ENABLE_API) {
    const apiHealthy = await healthCheck();
    if (!apiHealthy) {
      Logger.warn('API is not healthy. Posts will be saved to file only.');
    }
  }

  const allPosts: Post[] = [];

  // 게시판 목록 가져오기 (DB 또는 하드코딩)
  let ruliwebBoards: BoardConfig[] = RULIWEB_BOARDS;
  let arcaliveBoards: BoardConfig[] = ARCALIVE_CHANNELS;

  if (USE_DB_BOARDS && ENABLE_API) {
    Logger.info('Fetching board list from database...');
    const boards = await fetchEnabledBoards();

    if (boards.length > 0) {
      // BoardDto를 BoardConfig로 변환
      ruliwebBoards = boards
        .filter(b => b.community === 'ruliweb')
        .map(b => ({ name: b.name, url: b.url }));

      arcaliveBoards = boards
        .filter(b => b.community === 'arcalive')
        .map(b => ({ name: b.name, url: b.url }));

      Logger.success(`Loaded ${ruliwebBoards.length} Ruliweb boards, ${arcaliveBoards.length} Arcalive boards from DB`);
    } else {
      Logger.warn('No boards found in DB. Using hardcoded board list.');
    }
  } else {
    Logger.info('Using hardcoded board list from config.ts');
  }

  // 루리웹 크롤링
  const ruliwebCrawler = new RuliwebCrawler();
  const ruliwebPosts = await ruliwebCrawler.crawlAll(ruliwebBoards);
  allPosts.push(...ruliwebPosts);

  // 아카라이브 크롤링
  const arcaliveCrawler = new ArcaliveCrawler();
  const arcalivePosts = await arcaliveCrawler.crawlAll(arcaliveBoards);
  allPosts.push(...arcalivePosts);

  Logger.info(`Total posts crawled: ${allPosts.length}`);

  // ========== 1단계: 메타데이터 저장 ==========
  let apiSuccess = false;
  if (ENABLE_API && allPosts.length > 0) {
    apiSuccess = await sendPostsToAPI(allPosts);
    if (!apiSuccess) {
      Logger.warn('Failed to send to API. Falling back to file save.');
      await saveToFile(allPosts);
    }
  } else if (!ENABLE_API) {
    Logger.info('API sending is disabled');
    await saveToFile(allPosts);
  }

  // 파일로 저장 (옵션)
  if (SAVE_TO_FILE && allPosts.length > 0) {
    await saveToFile(allPosts);
  }

  // ========== 2단계: 본문 크롤링 (비동기) ==========
  if (ENABLE_API && apiSuccess && CRAWL_CONTENT && allPosts.length > 0) {
    Logger.info('========== Starting content crawling ==========');
    await crawlPostContents(allPosts, ruliwebCrawler, arcaliveCrawler);
  }

  // 브라우저 종료 (다음 실행 시 재초기화됨)
  await PuppeteerFetcher.closeBrowser();

  Logger.info('========== Crawl job completed ==========');
}

async function saveToFile(posts: Post[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(posts, null, 2), 'utf-8');
    Logger.success(`Saved ${posts.length} posts to ${OUTPUT_PATH}`);
  } catch (error) {
    Logger.error('Failed to save posts to file', error);
  }
}

/**
 * 게시글 본문 크롤링 및 업데이트
 */
async function crawlPostContents(
  posts: Post[],
  ruliwebCrawler: RuliwebCrawler,
  arcaliveCrawler: ArcaliveCrawler
): Promise<void> {
  Logger.info(`Crawling content for ${posts.length} posts with concurrency limit: ${CONTENT_CONCURRENCY}`);

  const tasks = posts.map((post) => async () => {
    try {
      let result: { content: string; timestamp?: string } = { content: '' };

      // 커뮤니티별로 적절한 크롤러 선택
      if (post.community === 'ruliweb') {
        result = await ruliwebCrawler.crawlPostDetail(post.url);
      } else if (post.community === 'arcalive') {
        result = await arcaliveCrawler.crawlPostDetail(post.url);
      }

      // 본문이 있으면 업데이트 (정확한 작성일시 포함)
      if (result.content && result.content.length > 0) {
        await updatePostContent(post.id, result.content, result.timestamp);
      } else {
        Logger.warn(`No content found for post: ${post.id}`);
      }

      // 서버 부하 방지를 위한 짧은 딜레이
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      Logger.error(`Failed to crawl content for post: ${post.id}`, error);
    }
  });

  // 동시성 제한을 두고 실행
  await runWithConcurrency(tasks, CONTENT_CONCURRENCY);

  Logger.info('Content crawling completed');
}

// 즉시 한 번 실행
await crawlAll();

// 30분마다 실행
cron.schedule('*/30 * * * *', async () => {
  await crawlAll();
});

Logger.info('Crawler scheduler started. Running every 30 minutes.');
