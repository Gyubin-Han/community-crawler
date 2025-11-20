import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BOARD_CONFIGS, BOARD_COLORS, type BoardConfig } from '../../config/boardConfig';
import { fetchEnabledBoards, type BoardDto } from '../../api/posts';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [boardConfigs, setBoardConfigs] = useState<BoardConfig[]>(BOARD_CONFIGS);

  // API에서 게시판 목록 가져와서 동적 탭 생성
  useEffect(() => {
    const loadBoards = async () => {
      const boards = await fetchEnabledBoards();

      if (boards.length > 0) {
        // BoardConfig 생성 - 전체 탭
        const dynamicConfigs: BoardConfig[] = [
          {
            id: 'all',
            name: '전체',
            boards: [],
            color: 'gray',
          },
        ];

        // 커뮤니티별 색상
        const communityColors: Record<string, string> = {
          ruliweb: 'blue',
          arcalive: 'green',
          dcinside: 'purple',
        };

        // 각 게시판을 개별 탭으로 추가
        boards.forEach((board) => {
          dynamicConfigs.push({
            id: board.name,  // 게시판 이름을 ID로 사용
            name: board.name,  // 게시판 이름을 표시
            boards: [board.name],  // 해당 게시판만 포함
            color: communityColors[board.community] || 'gray',
          });
        });

        setBoardConfigs(dynamicConfigs);
      }
    };

    loadBoards();
  }, []);

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
          {boardConfigs.map((board) => {
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
