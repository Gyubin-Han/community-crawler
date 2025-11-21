import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import PostList from '../components/PostList';
import type { Post } from '../types';
import { fetchAllPosts, fetchEnabledBoards, type BoardDto } from '../api/posts';

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId?: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [boards, setBoards] = useState<BoardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 현재 선택된 게시판/그룹 ID (URL에서 디코딩)
  const currentId = boardId ? decodeURIComponent(boardId) : 'all';

  // 그룹인지 확인 (group:유머 형식)
  const isGroup = currentId.startsWith('group:');
  const groupName = isGroup ? currentId.replace('group:', '') : null;

  // API에서 게시글과 게시판 목록 가져오기
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [postsData, boardsData] = await Promise.all([
          fetchAllPosts(),
          fetchEnabledBoards()
        ]);
        setPosts(postsData);
        setBoards(boardsData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 게시판별로 필터링된 게시글
  const filteredPosts = useMemo(() => {
    // '전체' 게시판이면 모든 게시글
    if (currentId === 'all') {
      return posts;
    }

    // 그룹인 경우: 해당 그룹에 속한 모든 게시판의 게시글
    if (isGroup && groupName) {
      const groupBoardNames = boards
        .filter(b => b.groupName === groupName)
        .map(b => b.name);
      return posts.filter((post) => groupBoardNames.includes(post.board));
    }

    // 개별 게시판인 경우: 해당 게시판 이름으로 필터링
    return posts.filter((post) => post.board === currentId);
  }, [currentId, isGroup, groupName, posts, boards]);

  // 표시할 이름
  const displayName = isGroup && groupName ? groupName : (currentId === 'all' ? '전체' : currentId);

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
        boardName={displayName}
      />
    </div>
  );
};

export default BoardPage;
