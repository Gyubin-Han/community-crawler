package com.community.aggregator.service;

import com.community.aggregator.dto.PostDto;
import com.community.aggregator.entity.Post;
import com.community.aggregator.repository.PostRepository;
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
public class PostService {

    private final PostRepository postRepository;

    /**
     * 모든 게시글 조회 (최신순)
     */
    @Transactional(readOnly = true)
    public List<PostDto> getAllPosts() {
        return postRepository.findAllByOrderByTimestampDesc().stream()
                .map(PostDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 게시글 ID로 조회
     */
    @Transactional(readOnly = true)
    public Optional<PostDto> getPostById(String id) {
        return postRepository.findById(id)
                .map(PostDto::fromEntity);
    }

    /**
     * 커뮤니티별 조회
     */
    @Transactional(readOnly = true)
    public List<PostDto> getPostsByCommunity(String community) {
        return postRepository.findByCommunityOrderByTimestampDesc(community).stream()
                .map(PostDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 게시판별 조회
     */
    @Transactional(readOnly = true)
    public List<PostDto> getPostsByBoard(String board) {
        return postRepository.findByBoardOrderByTimestampDesc(board).stream()
                .map(PostDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 검색
     */
    @Transactional(readOnly = true)
    public List<PostDto> searchPosts(String keyword) {
        return postRepository.searchByKeyword(keyword).stream()
                .map(PostDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 게시글 저장 (생성 또는 업데이트)
     */
    @Transactional
    public PostDto savePost(PostDto postDto) {
        Post post = postDto.toEntity();
        Post savedPost = postRepository.save(post);
        log.info("Post saved: {}", savedPost.getId());
        return PostDto.fromEntity(savedPost);
    }

    /**
     * 여러 게시글 일괄 저장
     */
    @Transactional
    public List<PostDto> savePosts(List<PostDto> postDtos) {
        List<Post> posts = postDtos.stream()
                .map(PostDto::toEntity)
                .collect(Collectors.toList());

        List<Post> savedPosts = postRepository.saveAll(posts);
        log.info("Saved {} posts", savedPosts.size());

        return savedPosts.stream()
                .map(PostDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 게시글 삭제
     */
    @Transactional
    public void deletePost(String id) {
        postRepository.deleteById(id);
        log.info("Post deleted: {}", id);
    }

    /**
     * 모든 게시글 삭제 (주의!)
     */
    @Transactional
    public void deleteAllPosts() {
        postRepository.deleteAll();
        log.warn("All posts deleted!");
    }
}
