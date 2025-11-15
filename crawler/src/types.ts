export type CommunityType = 'dcinside' | 'ruliweb' | 'arcalive';

export interface Post {
  id: string;
  title: string;
  author: string;
  community: CommunityType;
  board: string;
  content: string;
  views: number;
  comments: number;
  likes: number;
  timestamp: string;
  url: string;
}

export interface CrawlerConfig {
  delay: number;
  maxRetries: number;
  timeout: number;
  maxPostsPerBoard: number;
}

export interface BoardConfig {
  name: string;
  url: string;
}
