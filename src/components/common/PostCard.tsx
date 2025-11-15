import React from 'react';
import type { Post } from '../../types';

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
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
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
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

      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
        {post.title}
      </h3>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {post.content}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>{post.board}</span>
          <span>작성자: {post.author}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>조회 {post.views.toLocaleString()}</span>
          <span>댓글 {post.comments}</span>
          <span>추천 {post.likes}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
