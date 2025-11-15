import * as cheerio from 'cheerio';
import { BaseCrawler } from './base.js';
import type { Post, BoardConfig } from '../types.js';
import { PuppeteerFetcher } from '../utils/puppeteer-fetcher.js';
import { Logger } from '../utils/logger.js';
import { CRAWLER_CONFIG } from '../config.js';

export class RuliwebCrawler extends BaseCrawler {
  protected communityName = 'Ruliweb';

  async crawlBoard(board: BoardConfig): Promise<Post[]> {
    const html = await PuppeteerFetcher.fetchHTML(board.url);
    if (!html) return [];

    const $ = cheerio.load(html);
    const posts: Post[] = [];

    // 루리웹 게시판 구조에 맞게 선택자 수정 필요
    // 실제 페이지를 확인하여 정확한 선택자를 찾아야 함
    $('.table_body tr').each((index, element) => {
      if (index >= CRAWLER_CONFIG.maxPostsPerBoard) return false;

      try {
        const $el = $(element);

        // 공지사항 제외
        if ($el.find('.notice').length > 0) return;

        const titleEl = $el.find('.subject a');
        const title = this.cleanText(titleEl.text());
        const url = titleEl.attr('href') || '';
        const author = this.cleanText($el.find('.writer').text());
        const views = this.parseNumber($el.find('.hit').text());
        const comments = this.parseNumber($el.find('.reply_num').text());
        const likes = this.parseNumber($el.find('.recomd').text());
        const timeStr = this.cleanText($el.find('.time').text());

        if (!title) return;

        const post: Post = {
          id: this.generatePostId('ruliweb', index),
          title,
          author: author || '익명',
          community: 'ruliweb',
          board: board.name,
          content: title, // 상세 내용은 가져오지 않음
          views,
          comments,
          likes,
          timestamp: this.parseRelativeTime(timeStr),
          url: url.startsWith('http') ? url : `https://bbs.ruliweb.com${url}`,
        };

        posts.push(post);
      } catch (error) {
        Logger.error(`Error parsing Ruliweb post at index ${index}`, error);
      }
    });

    return posts;
  }
}
