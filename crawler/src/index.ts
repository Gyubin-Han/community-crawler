import cron from 'node-cron';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RuliwebCrawler } from './crawlers/ruliweb.js';
import { ArcaliveCrawler } from './crawlers/arcalive.js';
import { PuppeteerFetcher } from './utils/puppeteer-fetcher.js';
import { Logger } from './utils/logger.js';
import { RULIWEB_BOARDS, ARCALIVE_CHANNELS } from './config.js';
import type { Post } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../../src/data/posts.json');

async function crawlAll(): Promise<void> {
  Logger.info('========== Starting crawl job ==========');

  const allPosts: Post[] = [];

  // 루리웹 크롤링
  const ruliwebCrawler = new RuliwebCrawler();
  const ruliwebPosts = await ruliwebCrawler.crawlAll(RULIWEB_BOARDS);
  allPosts.push(...ruliwebPosts);

  // 아카라이브 크롤링
  const arcaliveCrawler = new ArcaliveCrawler();
  const arcalivePosts = await arcaliveCrawler.crawlAll(ARCALIVE_CHANNELS);
  allPosts.push(...arcalivePosts);

  // 결과 저장
  try {
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(allPosts, null, 2), 'utf-8');
    Logger.success(`Saved ${allPosts.length} posts to ${OUTPUT_PATH}`);
  } catch (error) {
    Logger.error('Failed to save posts', error);
  }

  // 브라우저 종료 (다음 실행 시 재초기화됨)
  await PuppeteerFetcher.closeBrowser();

  Logger.info('========== Crawl job completed ==========');
}

// 즉시 한 번 실행
await crawlAll();

// 30분마다 실행
cron.schedule('*/30 * * * *', async () => {
  await crawlAll();
});

Logger.info('Crawler scheduler started. Running every 30 minutes.');
