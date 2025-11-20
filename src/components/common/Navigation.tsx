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
        // 커뮤니티별로 게시판 그룹화
        const communityMap: Record<string, string[]> = {};

        boards.forEach((board) => {
          if (!communityMap[board.community]) {
            communityMap[board.community] = [];
          }
          communityMap[board.community].push(board.name);
        });

        // BoardConfig 생성
        const dynamicConfigs: BoardConfig[] = [
          {
            id: 'all',
            name: '전체',
            boards: [],
            color: 'gray',
          },
        ];

        // 커뮤니티별 탭 추가
        const communityColors: Record<string, string> = {
          ruliweb: 'blue',
          arcalive: 'green',
          dcinside: 'purple',
        };

        const communityNames: Record<string, string> = {
          ruliweb: '루리웹',
          arcalive: '아카라이브',
          dcinside: '디시인사이드',
        };

        Object.entries(communityMap).forEach(([community, boardNames]) => {
          dynamicConfigs.push({
            id: community,
            name: communityNames[community] || community,
            boards: boardNames,
            color: communityColors[community] || 'gray',
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
