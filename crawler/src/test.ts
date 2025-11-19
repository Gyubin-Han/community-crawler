import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RuliwebCrawler } from './crawlers/ruliweb.js';
import { ArcaliveCrawler } from './crawlers/arcalive.js';
import { PuppeteerFetcher } from './utils/puppeteer-fetcher.js';
import { Logger } from './utils/logger.js';
import { sendPostsToAPI, healthCheck } from './utils/api-client.js';
import { RULIWEB_BOARDS, ARCALIVE_CHANNELS } from './config.js';
import type { Post } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../../src/data/posts.json');
const ENABLE_API = process.env.ENABLE_API !== 'false'; // 기본값: true

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

  // 루리웹 테스트
  Logger.info('Testing Ruliweb crawler...');
  const ruliwebCrawler = new RuliwebCrawler();
  const ruliwebPosts = await ruliwebCrawler.crawlAll(RULIWEB_BOARDS);
  allPosts.push(...ruliwebPosts);
  Logger.info(`Ruliweb: ${ruliwebPosts.length} posts`);

  // 아카라이브 테스트
  Logger.info('Testing Arcalive crawler...');
  const arcaliveCrawler = new ArcaliveCrawler();
  const arcalivePosts = await arcaliveCrawler.crawlAll(ARCALIVE_CHANNELS);
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

  // API로 전송
  if (ENABLE_API && allPosts.length > 0) {
    const success = await sendPostsToAPI(allPosts);
    if (!success) {
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

  // 브라우저 종료
  await PuppeteerFetcher.closeBrowser();

  Logger.info('========== Test crawl completed ==========');
}

test().catch((error) => {
  Logger.error('Test failed', error);
  PuppeteerFetcher.closeBrowser().finally(() => process.exit(1));
});
