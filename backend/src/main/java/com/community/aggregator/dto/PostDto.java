package com.community.aggregator.dto;

import com.community.aggregator.entity.Post;
import lombok.*;

import java.time.LocalDateTime;

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
                .timestamp(LocalDateTime.parse(this.timestamp))
                .url(this.url)
                .build();
    }
}
