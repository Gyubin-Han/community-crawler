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

        // 그룹별로 게시판 묶기
        const groupMap: Record<string, { boards: BoardDto[], color: string }> = {};
        const ungroupedBoards: BoardDto[] = [];

        boards.forEach((board) => {
          if (board.groupName) {
            if (!groupMap[board.groupName]) {
              groupMap[board.groupName] = { boards: [], color: 'gray' };
            }
            groupMap[board.groupName].boards.push(board);
            // 첫 번째 게시판의 커뮤니티 색상 사용 (또는 혼합 색상)
            if (groupMap[board.groupName].boards.length === 1) {
              groupMap[board.groupName].color = communityColors[board.community] || 'gray';
            } else {
              // 여러 커뮤니티가 섞이면 indigo 색상 사용
              groupMap[board.groupName].color = 'indigo';
            }
          } else {
            ungroupedBoards.push(board);
          }
        });

        // 그룹 탭 추가 (여러 게시판이 묶인 경우만)
        Object.entries(groupMap).forEach(([groupName, group]) => {
          if (group.boards.length > 1) {
            // 여러 게시판이 있는 그룹 -> 그룹 탭으로 생성
            dynamicConfigs.push({
              id: `group:${groupName}`,
              name: groupName,
              boards: group.boards.map(b => b.name),
              color: group.color,
            });
          } else {
            // 단일 게시판 그룹 -> 개별 탭으로 추가
            ungroupedBoards.push(...group.boards);
          }
        });

        // 그룹에 속하지 않은 개별 게시판 탭 추가
        ungroupedBoards.forEach((board) => {
          dynamicConfigs.push({
            id: board.name,
            name: board.name,
            boards: [board.name],
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
