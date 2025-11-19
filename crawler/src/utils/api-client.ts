import axios, { AxiosError } from 'axios';
import { Logger } from './logger.js';
import type { Post } from '../types.js';

const API_BASE_URL = process.env.API_URL || 'http://localhost:8080/api';

export interface PostDto {
  id: string;
  title: string;
  author: string;
  community: string;
  board: string;
  content: string;
  views: number;
  comments: number;
  likes: number;
  timestamp: string;
  url: string;
}

/**
 * Post를 DTO로 변환
 */
function convertToDto(post: Post): PostDto {
  return {
    id: post.id,
    title: post.title,
    author: post.author,
    community: post.community,
    board: post.board,
    content: post.content || '',
    views: post.views,
    comments: post.comments,
    likes: post.likes,
    timestamp: post.timestamp,
    url: post.url,
  };
}

/**
 * 게시글 일괄 전송
 */
export async function sendPostsToAPI(posts: Post[]): Promise<boolean> {
  if (posts.length === 0) {
    Logger.warn('No posts to send');
    return true;
  }

  try {
    const dtos = posts.map(convertToDto);

    Logger.info(`Sending ${dtos.length} posts to API: ${API_BASE_URL}/posts/batch`);

    const response = await axios.post(`${API_BASE_URL}/posts/batch`, dtos, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      timeout: 30000, // 30초 타임아웃
    });

    Logger.success(`Successfully sent ${response.data.length} posts to API`);
    return true;

  } catch (error) {
    if (error instanceof AxiosError) {
      Logger.error('Failed to send posts to API', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data,
      });
    } else {
      Logger.error('Failed to send posts to API', error);
    }
    return false;
  }
}

/**
 * API 헬스 체크
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000,
    });

    const isHealthy = response.status === 200;

    if (isHealthy) {
      Logger.success('API health check passed');
    } else {
      Logger.warn('API health check failed');
    }

    return isHealthy;

  } catch (error) {
    Logger.error('API health check failed', error);
    return false;
  }
}
