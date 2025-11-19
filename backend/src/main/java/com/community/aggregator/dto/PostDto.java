package com.community.aggregator.dto;

import com.community.aggregator.entity.Post;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDto {

    private String id;
    private String title;
    private String author;
    private String community;
    private String board;
    private String content;
    private Integer views;
    private Integer comments;
    private Integer likes;
    private String timestamp; // ISO 8601 format for frontend compatibility
    private String url;

    public static PostDto fromEntity(Post post) {
        return PostDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .author(post.getAuthor())
                .community(post.getCommunity())
                .board(post.getBoard())
                .content(post.getContent())
                .views(post.getViews())
                .comments(post.getComments())
                .likes(post.getLikes())
                .timestamp(post.getTimestamp().toString())
                .url(post.getUrl())
                .build();
    }

    public Post toEntity() {
        // Parse ISO 8601 format with timezone (e.g., "2025-11-19T18:25:43.306Z")
        LocalDateTime parsedTimestamp;
        try {
            // Try parsing as Instant (handles Z timezone)
            parsedTimestamp = LocalDateTime.ofInstant(
                Instant.parse(this.timestamp),
                ZoneId.systemDefault()
            );
        } catch (Exception e) {
            // Fallback to LocalDateTime.parse for formats without timezone
            parsedTimestamp = LocalDateTime.parse(this.timestamp);
        }

        return Post.builder()
                .id(this.id)
                .title(this.title)
                .author(this.author)
                .community(this.community)
                .board(this.board)
                .content(this.content)
                .views(this.views)
                .comments(this.comments)
                .likes(this.likes)
                .timestamp(parsedTimestamp)
                .url(this.url)
                .build();
    }
}
