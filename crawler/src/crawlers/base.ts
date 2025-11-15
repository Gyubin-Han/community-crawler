import type { Post, BoardConfig } from '../types.js';
import { Fetcher } from '../utils/fetcher.js';
import { Logger } from '../utils/logger.js';

export abstract class BaseCrawler {
  protected abstract communityName: string;

  abstract crawlBoard(board: BoardConfig): Promise<Post[]>;

  async crawlAll(boards: BoardConfig[]): Promise<Post[]> {
    Logger.info(`Starting ${this.communityName} crawl...`);
    const allPosts: Post[] = [];

    for (const board of boards) {
      try {
        const posts = await this.crawlBoard(board);
        allPosts.push(...posts);
        Logger.success(
          `Crawled ${posts.length} posts from ${this.communityName} - ${board.name}`
        );

        // 다음 게시판으로 넘어가기 전 딜레이
        await Fetcher.delay();
      } catch (error) {
        Logger.error(
          `Failed to crawl ${this.communityName} - ${board.name}`,
          error
        );
      }
    }

    Logger.info(
      `Completed ${this.communityName} crawl: ${allPosts.length} total posts`
    );
    return allPosts;
  }

  protected generatePostId(community: string, index: number): string {
    return `${community}-${Date.now()}-${index}`;
  }

  protected parseRelativeTime(timeStr: string): string {
    const now = new Date();

    // "N분 전" 형식
    const minutesMatch = timeStr.match(/(\d+)분\s*전/);
    if (minutesMatch) {
      now.setMinutes(now.getMinutes() - parseInt(minutesMatch[1]));
      return now.toISOString();
    }

    // "N시간 전" 형식
    const hoursMatch = timeStr.match(/(\d+)시간\s*전/);
    if (hoursMatch) {
      now.setHours(now.getHours() - parseInt(hoursMatch[1]));
      return now.toISOString();
    }

    // "어제" 또는 "N일 전" 형식
    const daysMatch = timeStr.match(/(\d+)일\s*전/);
    if (daysMatch) {
      now.setDate(now.getDate() - parseInt(daysMatch[1]));
      return now.toISOString();
    }

    if (timeStr.includes('어제')) {
      now.setDate(now.getDate() - 1);
      return now.toISOString();
    }

    // 날짜 형식 (YYYY-MM-DD 또는 MM-DD)
    const dateMatch = timeStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      return new Date(timeStr).toISOString();
    }

    // 파싱 실패 시 현재 시간 반환
    return now.toISOString();
  }

  protected cleanText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }

  protected parseNumber(text: string): number {
    const cleaned = text.replace(/[^0-9]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  }
}
