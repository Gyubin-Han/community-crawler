import cron from 'node-cron';
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
const SAVE_TO_FILE = process.env.SAVE_TO_FILE === 'true'; // 기본값: false

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

  // 루리웹 크롤링
  const ruliwebCrawler = new RuliwebCrawler();
  const ruliwebPosts = await ruliwebCrawler.crawlAll(RULIWEB_BOARDS);
  allPosts.push(...ruliwebPosts);

  // 아카라이브 크롤링
  const arcaliveCrawler = new ArcaliveCrawler();
  const arcalivePosts = await arcaliveCrawler.crawlAll(ARCALIVE_CHANNELS);
  allPosts.push(...arcalivePosts);

  Logger.info(`Total posts crawled: ${allPosts.length}`);

  // API로 전송
  if (ENABLE_API && allPosts.length > 0) {
    const success = await sendPostsToAPI(allPosts);
    if (!success) {
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

// 즉시 한 번 실행
await crawlAll();

// 30분마다 실행
cron.schedule('*/30 * * * *', async () => {
  await crawlAll();
});

Logger.info('Crawler scheduler started. Running every 30 minutes.');
