import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RuliwebCrawler } from './crawlers/ruliweb.js';
import { ArcaliveCrawler } from './crawlers/arcalive.js';
import { Logger } from './utils/logger.js';
import { RULIWEB_BOARDS, ARCALIVE_CHANNELS } from './config.js';
import type { Post } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../../src/data/posts.json');

async function test(): Promise<void> {
  Logger.info('========== Starting test crawl ==========');

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

  // 결과 저장
  try {
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(allPosts, null, 2), 'utf-8');
    Logger.success(`Saved ${allPosts.length} posts to ${OUTPUT_PATH}`);
  } catch (error) {
    Logger.error('Failed to save posts', error);
  }

  Logger.info('========== Test crawl completed ==========');
}

test();
