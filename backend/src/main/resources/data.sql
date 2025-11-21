-- 초기 게시판 데이터 삽입
-- 기존 잘못된 데이터를 삭제하고 올바른 데이터로 교체

-- 기존 초기 데이터 삭제 (id 1-4)
DELETE FROM boards WHERE id IN (1, 2, 3, 4);

-- 루리웹 게시판
INSERT INTO boards (id, community, name, url, enabled, display_order, description, group_name, created_at, updated_at)
VALUES (1, 'ruliweb', '유머 게시판', 'https://bbs.ruliweb.com/community/board/300143', true, 1, '루리웹 유머 게시판', '유머', NOW(), NOW());

INSERT INTO boards (id, community, name, url, enabled, display_order, description, group_name, created_at, updated_at)
VALUES (2, 'ruliweb', '정치 게시판', 'https://bbs.ruliweb.com/community/board/300148', true, 2, '루리웹 정치 게시판', '정치', NOW(), NOW());

-- 아카라이브 채널
INSERT INTO boards (id, community, name, url, enabled, display_order, description, group_name, created_at, updated_at)
VALUES (3, 'arcalive', '일반', 'https://arca.live/b/breaking', true, 3, '아카라이브 실시간 베스트', '일반', NOW(), NOW());

INSERT INTO boards (id, community, name, url, enabled, display_order, description, group_name, created_at, updated_at)
VALUES (4, 'arcalive', '유머', 'https://arca.live/b/humor', true, 4, '아카라이브 유머', '유머', NOW(), NOW());
