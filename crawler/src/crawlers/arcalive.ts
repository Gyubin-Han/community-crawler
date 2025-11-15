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

    // 실제 아카라이브 HTML 구조에 맞게 수정
    $('a.vrow').each((index, element) => {
      if (index >= CRAWLER_CONFIG.maxPostsPerBoard) return false;

      try {
        const $el = $(element);

        // URL (a 태그의 href)
        const url = $el.attr('href') || '';

        // 제목
        const title = this.cleanText($el.find('.col-title .title').text());

        // 작성자 (data-filter 속성이 있는 span 또는 첫 번째 span)
        const authorEl = $el.find('.col-author .user-info span[data-filter]');
        const author = this.cleanText(authorEl.length > 0 ? authorEl.text() : $el.find('.col-author .user-info span').first().text());

        // 조회수, 추천수
        const views = this.parseNumber($el.find('.col-view').text());
        const likes = this.parseNumber($el.find('.col-rate').text());

        // 댓글 수 (아카라이브는 제목에 포함되어 있을 수 있음, 또는 별도 요소)
        const commentEl = $el.find('.col-title .comment-count');
        const comments = commentEl.length > 0 ? this.parseNumber(commentEl.text()) : 0;

        // 시간
        const timeEl = $el.find('.col-time time');
        const timeStr = timeEl.length > 0 ? this.cleanText(timeEl.text()) : '';

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
        Logger.info(`Parsed Arcalive post: ${title} (views: ${views}, comments: ${comments}, likes: ${likes})`);
      } catch (error) {
        Logger.error(`Error parsing Arcalive post at index ${index}`, error);
      }
    });

    return posts;
  }
}
