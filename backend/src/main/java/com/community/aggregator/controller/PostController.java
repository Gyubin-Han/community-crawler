package com.community.aggregator.controller;

import com.community.aggregator.dto.PostDto;
import com.community.aggregator.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Slf4j
public class PostController {

    private final PostService postService;

    /**
     * 모든 게시글 조회
     * GET /api/posts
     */
    @GetMapping
    public ResponseEntity<List<PostDto>> getAllPosts(
            @RequestParam(required = false) String community,
            @RequestParam(required = false) String board,
            @RequestParam(required = false) String search
    ) {
        log.info("GET /api/posts - community: {}, board: {}, search: {}", community, board, search);

        List<PostDto> posts;

        if (search != null && !search.trim().isEmpty()) {
            posts = postService.searchPosts(search);
        } else if (community != null && !community.trim().isEmpty()) {
            posts = postService.getPostsByCommunity(community);
        } else if (board != null && !board.trim().isEmpty()) {
            posts = postService.getPostsByBoard(board);
        } else {
            posts = postService.getAllPosts();
        }

        return ResponseEntity.ok(posts);
    }

    /**
     * 게시글 ID로 조회
     * GET /api/posts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PostDto> getPostById(@PathVariable String id) {
        log.info("GET /api/posts/{}", id);

        return postService.getPostById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 게시글 생성
     * POST /api/posts
     */
    @PostMapping
    public ResponseEntity<PostDto> createPost(@RequestBody PostDto postDto) {
        log.info("POST /api/posts - {}", postDto.getTitle());

        PostDto savedPost = postService.savePost(postDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
    }

    /**
     * 여러 게시글 일괄 생성
     * POST /api/posts/batch
     */
    @PostMapping("/batch")
    public ResponseEntity<List<PostDto>> createPosts(@RequestBody List<PostDto> postDtos) {
        log.info("POST /api/posts/batch - {} posts", postDtos.size());

        List<PostDto> savedPosts = postService.savePosts(postDtos);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPosts);
    }

    /**
     * 게시글 업데이트
     * PUT /api/posts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<PostDto> updatePost(
            @PathVariable String id,
            @RequestBody PostDto postDto
    ) {
        log.info("PUT /api/posts/{}", id);

        postDto.setId(id);
        PostDto updatedPost = postService.savePost(postDto);
        return ResponseEntity.ok(updatedPost);
    }

    /**
     * 게시글 본문만 업데이트
     * PATCH /api/posts/{id}/content
     */
    @PatchMapping("/{id}/content")
    public ResponseEntity<PostDto> updatePostContent(
            @PathVariable String id,
            @RequestBody String content
    ) {
        log.info("PATCH /api/posts/{}/content - {} chars", id, content.length());

        return postService.updateContent(id, content)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 게시글 삭제
     * DELETE /api/posts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        log.info("DELETE /api/posts/{}", id);

        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 헬스 체크
     * GET /api/posts/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}
