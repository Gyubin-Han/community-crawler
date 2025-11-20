import * as cheerio from 'cheerio';
import { BaseCrawler } from './base.js';
import type { Post, BoardConfig } from '../types.js';
import { PuppeteerFetcher } from '../utils/puppeteer-fetcher.js';
import { Logger } from '../utils/logger.js';
import { CRAWLER_CONFIG } from '../config.js';

export class RuliwebCrawler extends BaseCrawler {
  protected communityName = 'Ruliweb';

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
        '.board_main_view .view_content',  // 루리웹 일반 게시판
        '.board_main_view .board_main_view',
        'article .view_content',
        '.post-content',
        '.article-content'
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
        '.board_main_view .time',
        '.board_main_view .date',
        '.view_time',
        '.post-time',
        'time'
      ];

      for (const selector of timeSelectors) {
        const timeEl = $(selector).first();
        if (timeEl.length > 0) {
          const timeText = this.cleanText(timeEl.text());
          if (timeText) {
            // parseRelativeTime을 사용하여 ISO 형식으로 변환
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

    // 실제 루리웹 HTML 구조에 맞게 수정
    $('tr.table_body').each((index, element) => {
      if (index >= CRAWLER_CONFIG.maxPostsPerBoard) return false;

      try {
        const $el = $(element);

        // 제목과 URL
        const titleEl = $el.find('.subject .subject_link');
        const title = this.cleanText(titleEl.clone().children().remove().end().text()); // 아이콘/댓글 수 제외
        const url = titleEl.attr('href') || '';

        // 작성자
        const author = this.cleanText($el.find('.writer a').text());

        // 조회수, 추천수, 댓글수
        const views = this.parseNumber($el.find('.hit').text());
        const likes = this.parseNumber($el.find('.recomd').text());

        // 댓글 수 추출 (예: "(2)" -> 2)
        const commentText = $el.find('.num_reply').text();
        const comments = this.parseNumber(commentText);

        // 시간
        const timeStr = this.cleanText($el.find('.time').text());

        if (!title) return;

        const post: Post = {
          id: this.generatePostId('ruliweb', index),
          title,
          author: author || '익명',
          community: 'ruliweb',
          board: board.name,
          content: '', // 본문은 2단계에서 크롤링
          views,
          comments,
          likes,
          timestamp: this.parseRelativeTime(timeStr),
          url: url.startsWith('http') ? url : `https://bbs.ruliweb.com${url}`,
        };

        posts.push(post);
        Logger.info(`Parsed Ruliweb post: ${title} (views: ${views}, comments: ${comments}, likes: ${likes})`);
      } catch (error) {
        Logger.error(`Error parsing Ruliweb post at index ${index}`, error);
      }
    });

    return posts;
  }
}
