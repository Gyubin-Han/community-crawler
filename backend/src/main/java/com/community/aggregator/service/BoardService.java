package com.community.aggregator.service;

import com.community.aggregator.dto.BoardDto;
import com.community.aggregator.entity.Board;
import com.community.aggregator.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BoardService {

    private final BoardRepository boardRepository;

    /**
     * 모든 게시판 조회
     */
    @Transactional(readOnly = true)
    public List<BoardDto> getAllBoards() {
        return boardRepository.findAll().stream()
                .map(BoardDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 활성화된 게시판만 조회 (표시 순서대로)
     */
    @Transactional(readOnly = true)
    public List<BoardDto> getEnabledBoards() {
        return boardRepository.findByEnabledTrueOrderByDisplayOrderAsc().stream()
                .map(BoardDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 커뮤니티별 활성화된 게시판 조회
     */
    @Transactional(readOnly = true)
    public List<BoardDto> getEnabledBoardsByCommunity(String community) {
        return boardRepository.findByCommunityAndEnabledTrueOrderByDisplayOrderAsc(community).stream()
                .map(BoardDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 게시판 ID로 조회
     */
    @Transactional(readOnly = true)
    public Optional<BoardDto> getBoardById(Long id) {
        return boardRepository.findById(id)
                .map(BoardDto::fromEntity);
    }

    /**
     * 게시판 생성
     */
    @Transactional
    public BoardDto createBoard(BoardDto boardDto) {
        Board board = boardDto.toEntity();
        Board savedBoard = boardRepository.save(board);
        log.info("Board created: {} - {}", savedBoard.getCommunity(), savedBoard.getName());
        return BoardDto.fromEntity(savedBoard);
    }

    /**
     * 게시판 업데이트
     */
    @Transactional
    public Optional<BoardDto> updateBoard(Long id, BoardDto boardDto) {
        return boardRepository.findById(id)
                .map(board -> {
                    if (boardDto.getCommunity() != null) {
                        board.setCommunity(boardDto.getCommunity());
                    }
                    if (boardDto.getName() != null) {
                        board.setName(boardDto.getName());
                    }
                    if (boardDto.getUrl() != null) {
                        board.setUrl(boardDto.getUrl());
                    }
                    if (boardDto.getEnabled() != null) {
                        board.setEnabled(boardDto.getEnabled());
                    }
                    if (boardDto.getDisplayOrder() != null) {
                        board.setDisplayOrder(boardDto.getDisplayOrder());
                    }
                    if (boardDto.getDescription() != null) {
                        board.setDescription(boardDto.getDescription());
                    }

                    Board updatedBoard = boardRepository.save(board);
                    log.info("Board updated: {}", id);
                    return BoardDto.fromEntity(updatedBoard);
                });
    }

    /**
     * 게시판 삭제
     */
    @Transactional
    public void deleteBoard(Long id) {
        boardRepository.deleteById(id);
        log.info("Board deleted: {}", id);
    }
}
