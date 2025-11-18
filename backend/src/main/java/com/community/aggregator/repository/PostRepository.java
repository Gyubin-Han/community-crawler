package com.community.aggregator.repository;

import com.community.aggregator.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, String> {

    // 커뮤니티별 조회
    List<Post> findByCommunity(String community);

    // 게시판별 조회
    List<Post> findByBoard(String board);

    // 커뮤니티 + 게시판 조회
    List<Post> findByCommunityAndBoard(String community, String board);

    // 검색 (제목 또는 내용에 키워드 포함)
    @Query("SELECT p FROM Post p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Post> searchByKeyword(@Param("keyword") String keyword);

    // 최신 게시글 조회 (timestamp 기준 내림차순)
    List<Post> findAllByOrderByTimestampDesc();

    // 특정 게시판의 최신 게시글
    List<Post> findByBoardOrderByTimestampDesc(String board);

    // 특정 커뮤니티의 최신 게시글
    List<Post> findByCommunityOrderByTimestampDesc(String community);
}
