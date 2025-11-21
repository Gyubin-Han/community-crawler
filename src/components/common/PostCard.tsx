import React, { useState, useEffect } from 'react';
import type { Post } from '../../types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isRead, setIsRead] = useState(false);

  // 읽은 글인지 확인
  useEffect(() => {
    const readPosts = JSON.parse(localStorage.getItem('readPosts') || '[]');
    setIsRead(readPosts.includes(post.id));
  }, [post.id]);

  // 클릭 시 읽은 글로 표시
  const handleClick = () => {
    const readPosts = JSON.parse(localStorage.getItem('readPosts') || '[]');
    if (!readPosts.includes(post.id)) {
      readPosts.push(post.id);
      localStorage.setItem('readPosts', JSON.stringify(readPosts));
      setIsRead(true);
    }
  };

  const getCommunityColor = (community: string) => {
    switch (community) {
      case 'dcinside':
        return 'bg-blue-100 text-blue-800';
      case 'ruliweb':
        return 'bg-green-100 text-green-800';
      case 'arcalive':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCommunityName = (community: string) => {
    switch (community) {
      case 'dcinside':
        return '디시인사이드';
      case 'ruliweb':
        return '루리웹';
      case 'arcalive':
        return '아카라이브';
      default:
        return community;
    }
  };

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`block rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-200 no-underline ${
        isRead ? 'bg-gray-50 opacity-70' : 'bg-white'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getCommunityColor(
            post.community
          )}`}
        >
          {getCommunityName(post.community)}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(post.timestamp).toLocaleString('ko-KR')}
        </span>
      </div>

      <h3 className={`text-lg font-semibold mb-2 line-clamp-2 ${
        isRead ? 'text-gray-500' : 'text-gray-800'
      }`}>
        {post.title}
      </h3>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {post.content}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="px-2 py-0.5 border-2 border-gray-400 text-gray-700 rounded font-medium bg-gray-50">
            {post.board}
          </span>
          <span>작성자: {post.author}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>조회 {post.views.toLocaleString()}</span>
          <span>댓글 {post.comments}</span>
          <span>추천 {post.likes}</span>
        </div>
      </div>
    </a>
  );
};

export default PostCard;
