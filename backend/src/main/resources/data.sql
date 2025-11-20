-- 초기 게시판 데이터 삽입
-- 이미 데이터가 있으면 건너뛰기

-- 루리웹 게시판
INSERT INTO boards (id, community, name, url, enabled, display_order, description, created_at, updated_at)
SELECT 1, 'ruliweb', '유머 게시판', 'https://bbs.ruliweb.com/community/board/300143', true, 1, '루리웹 유머 게시판', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM boards WHERE id = 1);

INSERT INTO boards (id, community, name, url, enabled, display_order, description, created_at, updated_at)
SELECT 2, 'ruliweb', '정치 게시판', 'https://bbs.ruliweb.com/community/board/300148', true, 2, '루리웹 정치 게시판', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM boards WHERE id = 2);

-- 아카라이브 채널
INSERT INTO boards (id, community, name, url, enabled, display_order, description, created_at, updated_at)
SELECT 3, 'arcalive', '일반', 'https://arca.live/b/breaking', true, 3, '아카라이브 실시간 베스트', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM boards WHERE id = 3);

INSERT INTO boards (id, community, name, url, enabled, display_order, description, created_at, updated_at)
SELECT 4, 'arcalive', '유머', 'https://arca.live/b/humor', true, 4, '아카라이브 유머', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM boards WHERE id = 4);
