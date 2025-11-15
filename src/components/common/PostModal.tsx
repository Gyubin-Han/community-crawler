import React from 'react';
import type { Post } from '../../types';

interface PostModalProps {
  post: Post | null;
  onClose: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ post, onClose }) => {
  if (!post) return null;

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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">게시글 상세보기</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <span className="text-sm text-gray-500">
              {getCommunityName(post.community)} &gt; {post.board}
            </span>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            {post.title}
          </h3>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 pb-4 border-b border-gray-200">
            <span>작성자: {post.author}</span>
            <span>|</span>
            <span>{new Date(post.timestamp).toLocaleString('ko-KR')}</span>
            <span>|</span>
            <span>조회 {post.views.toLocaleString()}</span>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          </div>

          <div className="flex items-center gap-6 py-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">댓글</span>
              <span className="font-semibold text-blue-600">{post.comments}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">추천</span>
              <span className="font-semibold text-green-600">{post.likes}</span>
            </div>
          </div>

          <div className="mt-4">
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              원문 보기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
