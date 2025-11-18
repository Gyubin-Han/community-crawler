import React, { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import PostList from '../components/PostList';
import crawledPosts from '../data/posts.json';
import type { Post } from '../types';
import { BOARD_CONFIGS } from '../config/boardConfig';

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId?: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  // 현재 게시판 설정 찾기
  const currentBoard = BOARD_CONFIGS.find(
    (b) => b.id === (boardId || 'all')
  ) || BOARD_CONFIGS[0];

  // 게시판별로 필터링된 게시글
  const filteredPosts = useMemo(() => {
    const posts = crawledPosts as Post[];

    // '전체' 게시판이거나 boards가 비어있으면 모든 게시글
    if (currentBoard.id === 'all' || currentBoard.boards.length === 0) {
      return posts;
    }

    // 해당 게시판에 포함된 board 이름으로 필터링
    return posts.filter((post) =>
      currentBoard.boards.includes(post.board)
    );
  }, [currentBoard]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PostList
        posts={filteredPosts}
        searchQuery={searchQuery}
        boardName={currentBoard.name}
      />
    </div>
  );
};

export default BoardPage;
