import React, { useState } from 'react';
import type { Post, CommunityFilter } from '../types';
import PostCard from './common/PostCard';
import PostModal from './common/PostModal';

interface PostListProps {
  posts: Post[];
  searchQuery: string;
  boardName?: string;
}

const PostList: React.FC<PostListProps> = ({ posts, searchQuery, boardName }) => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filters: CommunityFilter[] = [
    { name: '전체', value: 'all', color: 'bg-gray-500' },
    { name: '디시인사이드', value: 'dcinside', color: 'bg-blue-500' },
    { name: '루리웹', value: 'ruliweb', color: 'bg-green-500' },
    { name: '아카라이브', value: 'arcalive', color: 'bg-purple-500' },
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesFilter = activeFilter === 'all' || post.community === activeFilter;
    const matchesSearch = searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {boardName && (
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{boardName}</h2>
      )}

      <div className="flex gap-2 mb-6">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeFilter === filter.value
                ? `${filter.color} text-white`
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filter.name}
          </button>
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          검색 결과가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => setSelectedPost(post)}
            />
          ))}
        </div>
      )}

      <PostModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
};

export default PostList;
