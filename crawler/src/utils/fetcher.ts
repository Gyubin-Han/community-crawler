import axios, { AxiosError } from 'axios';
import { Logger } from './logger.js';
import { CRAWLER_CONFIG, USER_AGENT } from '../config.js';

export class Fetcher {
  private static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async fetchHTML(
    url: string,
    retries: number = CRAWLER_CONFIG.maxRetries
  ): Promise<string | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        Logger.info(`Fetching: ${url} (attempt ${attempt}/${retries})`);

        const response = await axios.get(url, {
          headers: {
            'User-Agent': USER_AGENT,
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            Connection: 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
          timeout: CRAWLER_CONFIG.timeout,
          maxRedirects: 5,
        });

        Logger.success(`Fetched: ${url}`);
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
          Logger.error(
            `HTTP ${axiosError.response.status} for ${url}`,
            axiosError.message
          );
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
