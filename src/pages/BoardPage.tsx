import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import PostList from '../components/PostList';
import type { Post } from '../types';
import { BOARD_CONFIGS } from '../config/boardConfig';
import { fetchAllPosts } from '../api/posts';

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId?: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 현재 게시판 설정 찾기
  const currentBoard = BOARD_CONFIGS.find(
    (b) => b.id === (boardId || 'all')
  ) || BOARD_CONFIGS[0];

  // API에서 게시글 가져오기
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllPosts();
        setPosts(data);
      } catch (err) {
        console.error('Failed to load posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // 게시판별로 필터링된 게시글
  const filteredPosts = useMemo(() => {
    // '전체' 게시판이거나 boards가 비어있으면 모든 게시글
    if (currentBoard.id === 'all' || currentBoard.boards.length === 0) {
      return posts;
    }

    // 해당 게시판에 포함된 board 이름으로 필터링
    return posts.filter((post) =>
      currentBoard.boards.includes(post.board)
    );
  }, [currentBoard, posts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

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
