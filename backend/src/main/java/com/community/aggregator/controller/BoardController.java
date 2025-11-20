package com.community.aggregator.controller;

import com.community.aggregator.dto.BoardDto;
import com.community.aggregator.service.BoardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
@Slf4j
public class BoardController {

    private final BoardService boardService;

    /**
     * 모든 게시판 조회
     * GET /api/boards
     */
    @GetMapping
    public ResponseEntity<List<BoardDto>> getAllBoards(
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) String community
    ) {
        log.info("GET /api/boards - enabled: {}, community: {}", enabled, community);

        List<BoardDto> boards;

        if (enabled != null && enabled) {
            if (community != null && !community.isEmpty()) {
                boards = boardService.getEnabledBoardsByCommunity(community);
            } else {
                boards = boardService.getEnabledBoards();
            }
        } else {
            boards = boardService.getAllBoards();
        }

        return ResponseEntity.ok(boards);
    }

    /**
     * 게시판 ID로 조회
     * GET /api/boards/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<BoardDto> getBoardById(@PathVariable Long id) {
        log.info("GET /api/boards/{}", id);

        return boardService.getBoardById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 게시판 생성
     * POST /api/boards
     */
    @PostMapping
    public ResponseEntity<BoardDto> createBoard(@RequestBody BoardDto boardDto) {
        log.info("POST /api/boards - {}: {}", boardDto.getCommunity(), boardDto.getName());

        BoardDto createdBoard = boardService.createBoard(boardDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBoard);
    }

    /**
     * 게시판 업데이트
     * PUT /api/boards/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<BoardDto> updateBoard(
            @PathVariable Long id,
            @RequestBody BoardDto boardDto
    ) {
        log.info("PUT /api/boards/{}", id);

        return boardService.updateBoard(id, boardDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 게시판 삭제
     * DELETE /api/boards/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        log.info("DELETE /api/boards/{}", id);

        boardService.deleteBoard(id);
        return ResponseEntity.noContent().build();
    }
}
