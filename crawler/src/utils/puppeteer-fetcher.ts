import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import { Logger } from './logger.js';
import { CRAWLER_CONFIG } from '../config.js';

// Stealth 플러그인 적용 (봇 탐지 우회)
puppeteer.use(StealthPlugin());

export class PuppeteerFetcher {
  private static browser: Browser | null = null;
  private static pagePool: Page[] = [];

  private static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 브라우저 초기화
  static async initBrowser(): Promise<void> {
    if (this.browser) return;

    try {
      Logger.info('Launching browser...');
      this.browser = await puppeteer.launch({
        headless: true, // headless 모드 (백그라운드 실행)
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ],
      });
      Logger.success('Browser launched successfully');
    } catch (error) {
      Logger.error('Failed to launch browser', error);
      throw error;
    }
  }

  // 브라우저 종료
  static async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.pagePool = [];
      Logger.info('Browser closed');
    }
  }

  // HTML 가져오기
  static async fetchHTML(
    url: string,
    retries: number = CRAWLER_CONFIG.maxRetries
  ): Promise<string | null> {
    await this.initBrowser();

    for (let attempt = 1; attempt <= retries; attempt++) {
      let page: Page | null = null;

      try {
        Logger.info(`Fetching with Puppeteer: ${url} (attempt ${attempt}/${retries})`);

        if (!this.browser) {
          throw new Error('Browser not initialized');
        }

        // 새 페이지 생성
        page = await this.browser.newPage();

        // 타임아웃 설정
        page.setDefaultTimeout(CRAWLER_CONFIG.timeout);

        // User-Agent 설정
        await page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // Extra HTTP 헤더 설정
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        });

        // 페이지 이동
        const response = await page.goto(url, {
          waitUntil: 'networkidle2', // 네트워크 활동이 거의 없을 때까지 대기
          timeout: CRAWLER_CONFIG.timeout,
        });

        if (!response) {
          throw new Error('No response from page');
        }

        const status = response.status();
        if (status !== 200) {
          throw new Error(`HTTP ${status}`);
        }

        // 페이지 로딩 추가 대기 (JavaScript 실행 완료)
        await this.sleep(2000);

        // HTML 가져오기
        const html = await page.content();

        await page.close();
        Logger.success(`Fetched: ${url} (${html.length} bytes)`);

        return html;
      } catch (error: any) {
        if (page) {
          await page.close().catch(() => {});
        }

        Logger.error(`Failed to fetch ${url}`, error.message);

        if (attempt < retries) {
          const backoffDelay = CRAWLER_CONFIG.delay * Math.pow(2, attempt - 1);
          Logger.warn(`Retrying after ${backoffDelay}ms...`);
          await this.sleep(backoffDelay);
        }
      }
    }

    Logger.error(`Failed to fetch ${url} after ${retries} attempts`);
    return null;
  }

  // 딜레이
  static async delay(): Promise<void> {
    await this.sleep(CRAWLER_CONFIG.delay);
  }
}
