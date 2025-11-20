package com.community.aggregator.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "boards", indexes = {
    @Index(name = "idx_community", columnList = "community"),
    @Index(name = "idx_enabled", columnList = "enabled"),
    @Index(name = "idx_display_order", columnList = "displayOrder")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String community; // 'ruliweb', 'arcalive', 'dcinside'

    @Column(nullable = false, length = 100)
    private String name; // '유머게시판', '게임게시판' 등

    @Column(nullable = false, length = 500)
    private String url; // 크롤링할 URL

    @Column(nullable = false)
    private Boolean enabled = true; // 크롤링 활성화 여부

    @Column(nullable = false)
    private Integer displayOrder = 0; // 프론트엔드 탭 표시 순서

    @Column(length = 200)
    private String description; // 게시판 설명 (선택)

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
