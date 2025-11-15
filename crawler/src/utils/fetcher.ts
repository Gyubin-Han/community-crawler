import axios, { AxiosError } from 'axios';
import https from 'https';
import { Logger } from './logger.js';
import { CRAWLER_CONFIG, USER_AGENT } from '../config.js';

export class Fetcher {
  private static cookieJar: Map<string, string> = new Map();

  private static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private static getHostname(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }

  static async fetchHTML(
    url: string,
    retries: number = CRAWLER_CONFIG.maxRetries
  ): Promise<string | null> {
    const hostname = this.getHostname(url);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        Logger.info(`Fetching: ${url} (attempt ${attempt}/${retries})`);

        const headers: any = {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'max-age=0',
          'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'DNT': '1',
        };

        // 쿠키가 있으면 추가
        const cookie = this.cookieJar.get(hostname);
        if (cookie) {
          headers['Cookie'] = cookie;
        }

        const response = await axios.get(url, {
          headers,
          timeout: CRAWLER_CONFIG.timeout,
          maxRedirects: 5,
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
            keepAlive: true,
          }),
        });

        // Set-Cookie 헤더 저장
        const setCookie = response.headers['set-cookie'];
        if (setCookie && setCookie.length > 0) {
          this.cookieJar.set(hostname, setCookie.join('; '));
        }

        Logger.success(`Fetched: ${url}`);
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
          Logger.error(
            `HTTP ${axiosError.response.status} for ${url}`,
            axiosError.message
          );
          // 403/401이면 응답 본문 확인
          if (axiosError.response.status === 403 || axiosError.response.status === 401) {
            Logger.warn(`Response body: ${String(axiosError.response.data).substring(0, 200)}`);
          }
        } else if (axiosError.request) {
          Logger.error(`No response from ${url}`, axiosError.message);
        } else {
          Logger.error(`Error fetching ${url}`, axiosError.message);
        }

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

  static async delay(): Promise<void> {
    await this.sleep(CRAWLER_CONFIG.delay);
  }
}
