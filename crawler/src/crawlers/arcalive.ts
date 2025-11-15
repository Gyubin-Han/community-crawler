import * as cheerio from 'cheerio';
import { BaseCrawler } from './base.js';
import type { Post, BoardConfig } from '../types.js';
import { PuppeteerFetcher } from '../utils/puppeteer-fetcher.js';
import { Logger } from '../utils/logger.js';
import { CRAWLER_CONFIG } from '../config.js';

export class ArcaliveCrawler extends BaseCrawler {
  protected communityName = 'Arcalive';

  async crawlBoard(board: BoardConfig): Promise<Post[]> {
    const html = await PuppeteerFetcher.fetchHTML(board.url);
    if (!html) return [];

    const $ = cheerio.load(html);
    const posts: Post[] = [];

    // 아카라이브 구조에 맞게 선택자 수정
    $('.vrow').each((index, element) => {
      if (index >= CRAWLER_CONFIG.maxPostsPerBoard) return false;

      try {
        const $el = $(element);

        // 공지사항 제외
        if ($el.hasClass('notice')) return;

        const titleEl = $el.find('.title a');
        const title = this.cleanText(titleEl.text());
        const url = titleEl.attr('href') || '';
        const author = this.cleanText($el.find('.user-info').text());
        const views = this.parseNumber($el.find('.view-count').text());
        const comments = this.parseNumber($el.find('.comment-count').text());
        const likes = this.parseNumber($el.find('.vote-count').text());
        const timeStr = this.cleanText($el.find('.time').text());

        if (!title) return;

        const post: Post = {
          id: this.generatePostId('arcalive', index),
          title,
          author: author || '익명',
          community: 'arcalive',
          board: board.name,
          content: title, // 상세 내용은 가져오지 않음
          views,
          comments,
          likes,
          timestamp: this.parseRelativeTime(timeStr),
          url: url.startsWith('http') ? url : `https://arca.live${url}`,
        };

        posts.push(post);
      } catch (error) {
        Logger.error(`Error parsing Arcalive post at index ${index}`, error);
      }
    });

    return posts;
  }
}
