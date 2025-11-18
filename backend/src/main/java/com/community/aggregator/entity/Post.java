package com.community.aggregator.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts", indexes = {
    @Index(name = "idx_community", columnList = "community"),
    @Index(name = "idx_board", columnList = "board"),
    @Index(name = "idx_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @Column(length = 255)
    private String id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, length = 100)
    private String author;

    @Column(nullable = false, length = 50)
    private String community;

    @Column(nullable = false, length = 100)
    private String board;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Integer views;

    @Column(nullable = false)
    private Integer comments;

    @Column(nullable = false)
    private Integer likes;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false, length = 1000)
    private String url;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
