import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PuppeteerFetcher } from './utils/puppeteer-fetcher.js';
import { Logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugHTML() {
  Logger.info('========== HTML Structure Debug ==========');

  const urls = [
    { name: 'Ruliweb', url: 'https://bbs.ruliweb.com/community/board/300143' },
    { name: 'Arcalive', url: 'https://arca.live/b/breaking' },
  ];

  for (const { name, url } of urls) {
    Logger.info(`Fetching ${name}: ${url}`);

    const html = await PuppeteerFetcher.fetchHTML(url);

    if (html) {
      // HTML을 파일로 저장
      const filename = `debug-${name.toLowerCase()}.html`;
      const filepath = path.join(__dirname, filename);
      await fs.writeFile(filepath, html, 'utf-8');
      Logger.success(`Saved HTML to ${filename} (${html.length} bytes)`);

      // HTML 미리보기 (처음 500자)
      Logger.info(`HTML Preview:\n${html.substring(0, 500)}...`);
    } else {
      Logger.error(`Failed to fetch ${name}`);
    }

    await PuppeteerFetcher.delay();
  }

  await PuppeteerFetcher.closeBrowser();
  Logger.info('========== Debug completed ==========');
  Logger.info('Check debug-ruliweb.html and debug-arcalive.html files');
}

debugHTML().catch((error) => {
  Logger.error('Debug failed', error);
  PuppeteerFetcher.closeBrowser().finally(() => process.exit(1));
});
