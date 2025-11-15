import { BaseCrawler } from './base.js';
import type { Post, BoardConfig } from '../types.js';
import { Logger } from '../utils/logger.js';

export class DCInsideCrawler extends BaseCrawler {
  protected communityName = 'DCInside';

  async crawlBoard(board: BoardConfig): Promise<Post[]> {
    // robots.txt 제한으로 비활성화
    Logger.warn(
      `DCInside crawling is disabled due to robots.txt restrictions: ${board.name}`
    );
    return [];
  }
}
