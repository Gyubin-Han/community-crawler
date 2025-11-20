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
const CRAWL_CONTENT = process.env.CRAWL_CONTENT !== 'false'; // 기본값: true
const CONTENT_CONCURRENCY = parseInt(process.env.CONTENT_CONCURRENCY || '5', 10);
const USE_DB_BOARDS = process.env.USE_DB_BOARDS !== 'false'; // 기본값: true

async function test(): Promise<void> {
  Logger.info('========== Starting test crawl ==========');

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

  // 루리웹 테스트
  Logger.info('Testing Ruliweb crawler...');
  const ruliwebCrawler = new RuliwebCrawler();
  const ruliwebPosts = await ruliwebCrawler.crawlAll(ruliwebBoards);
  allPosts.push(...ruliwebPosts);
  Logger.info(`Ruliweb: ${ruliwebPosts.length} posts`);

  // 아카라이브 테스트
  Logger.info('Testing Arcalive crawler...');
  const arcaliveCrawler = new ArcaliveCrawler();
  const arcalivePosts = await arcaliveCrawler.crawlAll(arcaliveBoards);
  allPosts.push(...arcalivePosts);
  Logger.info(`Arcalive: ${arcalivePosts.length} posts`);

  // 결과 출력
  Logger.info(`Total posts collected: ${allPosts.length}`);

  if (allPosts.length > 0) {
    Logger.info('Sample posts:');
    allPosts.slice(0, 3).forEach((post, index) => {
      console.log(`\n--- Post ${index + 1} ---`);
      console.log(`Title: ${post.title}`);
      console.log(`Author: ${post.author}`);
      console.log(`Community: ${post.community}`);
      console.log(`Board: ${post.board}`);
      console.log(`Views: ${post.views}, Comments: ${post.comments}, Likes: ${post.likes}`);
      console.log(`URL: ${post.url}`);
    });
  }

  // ========== 1단계: 메타데이터 전송 ==========
  let apiSuccess = false;
  if (ENABLE_API && allPosts.length > 0) {
    apiSuccess = await sendPostsToAPI(allPosts);
    if (!apiSuccess) {
      Logger.warn('Failed to send to API. Posts will be saved to file only.');
    }
  } else if (!ENABLE_API) {
    Logger.info('API sending is disabled');
  }

  // 결과 저장
  try {
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(allPosts, null, 2), 'utf-8');
    Logger.success(`Saved ${allPosts.length} posts to ${OUTPUT_PATH}`);
  } catch (error) {
    Logger.error('Failed to save posts', error);
  }

  // ========== 2단계: 본문 크롤링 ==========
  if (ENABLE_API && apiSuccess && CRAWL_CONTENT && allPosts.length > 0) {
    Logger.info('========== Starting content crawling ==========');
    await crawlPostContents(allPosts, ruliwebCrawler, arcaliveCrawler);
  }

  // 브라우저 종료
  await PuppeteerFetcher.closeBrowser();

  Logger.info('========== Test crawl completed ==========');
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

test().catch((error) => {
  Logger.error('Test failed', error);
  PuppeteerFetcher.closeBrowser().finally(() => process.exit(1));
});
