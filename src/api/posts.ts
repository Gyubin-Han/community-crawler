import type { Post } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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

export interface BoardDto {
  id: number;
  community: string;
  name: string;
  url: string;
  enabled: boolean;
  displayOrder: number;
  description?: string;
  groupName?: string; // 그룹 이름 (여러 커뮤니티의 동일 주제 게시판을 묶음)
}

/**
 * 모든 게시글 조회
 */
export async function fetchAllPosts(): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/posts`);

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.status}`);
  }

  const data: PostDto[] = await response.json();
  return data.map(convertDtoToPost);
}

/**
 * 커뮤니티별 게시글 조회
 */
export async function fetchPostsByCommunity(community: string): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/posts?community=${encodeURIComponent(community)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch posts by community: ${response.status}`);
  }

  const data: PostDto[] = await response.json();
  return data.map(convertDtoToPost);
}

/**
 * 게시판별 게시글 조회
 */
export async function fetchPostsByBoard(board: string): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/posts?board=${encodeURIComponent(board)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch posts by board: ${response.status}`);
  }

  const data: PostDto[] = await response.json();
  return data.map(convertDtoToPost);
}

/**
 * 검색
 */
export async function searchPosts(query: string): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/posts?search=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error(`Failed to search posts: ${response.status}`);
  }

  const data: PostDto[] = await response.json();
  return data.map(convertDtoToPost);
}

/**
 * 특정 게시글 조회
 */
export async function fetchPostById(id: string): Promise<Post | null> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch post: ${response.status}`);
  }

  const data: PostDto = await response.json();
  return convertDtoToPost(data);
}

/**
 * 헬스 체크
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 활성화된 게시판 목록 조회
 */
export async function fetchEnabledBoards(): Promise<BoardDto[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/boards?enabled=true`);

    if (!response.ok) {
      throw new Error(`Failed to fetch boards: ${response.status}`);
    }

    const data: BoardDto[] = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch boards:', error);
    return [];
  }
}

/**
 * DTO를 Post 타입으로 변환
 */
function convertDtoToPost(dto: PostDto): Post {
  return {
    id: dto.id,
    title: dto.title,
    author: dto.author,
    community: dto.community,
    board: dto.board,
    content: dto.content,
    views: dto.views,
    comments: dto.comments,
    likes: dto.likes,
    timestamp: dto.timestamp,
    url: dto.url,
  };
}
