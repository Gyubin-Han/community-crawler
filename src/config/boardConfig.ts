// 게시판 설정
export interface BoardConfig {
  id: string;
  name: string;
  boards: string[]; // 해당 게시판에 포함될 board 이름들
  color: string; // 태그 색상
}

export const BOARD_CONFIGS: BoardConfig[] = [
  {
    id: 'all',
    name: '전체',
    boards: [], // 비어있으면 전체
    color: 'gray',
  },
  // 아래에 게시판 추가하세요
  // 예시:
  // {
  //   id: 'game-a',
  //   name: 'A 게임',
  //   boards: ['A 게임 게시판', '게임 게시판'],
  //   color: 'blue',
  // },
];

// 색상 매핑
export const BOARD_COLORS: Record<string, string> = {
  gray: 'border-gray-400 text-gray-700 bg-gray-50',
  blue: 'border-blue-400 text-blue-700 bg-blue-50',
  green: 'border-green-400 text-green-700 bg-green-50',
  red: 'border-red-400 text-red-700 bg-red-50',
  purple: 'border-purple-400 text-purple-700 bg-purple-50',
  yellow: 'border-yellow-400 text-yellow-700 bg-yellow-50',
  pink: 'border-pink-400 text-pink-700 bg-pink-50',
  indigo: 'border-indigo-400 text-indigo-700 bg-indigo-50',
};
