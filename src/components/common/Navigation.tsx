import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BOARD_CONFIGS, BOARD_COLORS } from '../../config/boardConfig';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (boardId: string) => {
    if (boardId === 'all') {
      return location.pathname === '/' || location.pathname === '/board/all';
    }
    return location.pathname === `/board/${boardId}`;
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-16 z-9">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 py-3 overflow-x-auto">
          {BOARD_CONFIGS.map((board) => {
            const colorClass = BOARD_COLORS[board.color] || BOARD_COLORS.gray;
            const active = isActive(board.id);

            return (
              <Link
                key={board.id}
                to={board.id === 'all' ? '/' : `/board/${board.id}`}
                className={`
                  px-4 py-2 rounded-lg border-2 font-semibold whitespace-nowrap transition-all
                  ${colorClass}
                  ${active ? 'ring-2 ring-offset-2 ring-blue-500' : 'hover:shadow-md'}
                `}
              >
                {board.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
