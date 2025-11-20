package com.community.aggregator.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateContentRequest {
    private String content;
    private String timestamp; // Optional: ISO 8601 format
}
