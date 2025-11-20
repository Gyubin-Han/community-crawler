import * as cheerio from 'cheerio';
import { BaseCrawler } from './base.js';
import type { Post, BoardConfig } from '../types.js';
import { PuppeteerFetcher } from '../utils/puppeteer-fetcher.js';
import { Logger } from '../utils/logger.js';
import { CRAWLER_CONFIG } from '../config.js';

export class ArcaliveCrawler extends BaseCrawler {
  protected communityName = 'Arcalive';

  /**
   * 게시글 상세 페이지에서 본문 및 정확한 작성일시 크롤링
   */
  async crawlPostDetail(url: string): Promise<{ content: string; timestamp?: string }> {
    try {
      const html = await PuppeteerFetcher.fetchHTML(url);
      if (!html) return { content: '' };

      const $ = cheerio.load(html);

      // 본문 크롤링
      const contentSelectors = [
        '.article-body',  // 아카라이브 일반 게시판
        '.article-content',
        '.fr-view',  // Froala 에디터
        '.post-content',
        'article .content'
      ];

      let content = '';
      for (const selector of contentSelectors) {
        const contentEl = $(selector).first();
        if (contentEl.length > 0) {
          // 이미지, 광고 등 불필요한 요소 제거
          contentEl.find('script, style, iframe, .ad, .advertisement').remove();

          const text = this.cleanText(contentEl.text());
          if (text.length > 0) {
            content = text;
            break;
          }
        }
      }

      // 정확한 작성일시 크롤링
      let timestamp: string | undefined;
      const timeSelectors = [
        '.article-head time',
        '.article-info time',
        'time[datetime]',
        '.post-time',
        '.date'
      ];

      for (const selector of timeSelectors) {
        const timeEl = $(selector).first();
        if (timeEl.length > 0) {
          // datetime 속성이 있으면 우선 사용
          const datetime = timeEl.attr('datetime');
          if (datetime) {
            timestamp = datetime;
            break;
          }

          // 없으면 텍스트에서 추출
          const timeText = this.cleanText(timeEl.text());
          if (timeText) {
            timestamp = this.parseRelativeTime(timeText);
            break;
          }
        }
      }

      if (content.length > 0) {
        Logger.info(`Crawled from ${url} - ${content.length} chars, timestamp: ${timestamp || 'none'}`);
      } else {
        Logger.warn(`No content found for ${url}`);
      }

      return { content, timestamp };
    } catch (error) {
      Logger.error(`Failed to crawl detail page: ${url}`, error);
      return { content: '' };
    }
  }

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
          content: '', // 본문은 2단계에서 크롤링
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
