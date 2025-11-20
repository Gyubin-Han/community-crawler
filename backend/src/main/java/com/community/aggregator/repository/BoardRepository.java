package com.community.aggregator.repository;

import com.community.aggregator.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {

    /**
     * 활성화된 게시판 목록 조회 (표시 순서대로)
     */
    List<Board> findByEnabledTrueOrderByDisplayOrderAsc();

    /**
     * 커뮤니티별 게시판 조회
     */
    List<Board> findByCommunityOrderByDisplayOrderAsc(String community);

    /**
     * 커뮤니티별 활성화된 게시판 조회
     */
    List<Board> findByCommunityAndEnabledTrueOrderByDisplayOrderAsc(String community);
}
