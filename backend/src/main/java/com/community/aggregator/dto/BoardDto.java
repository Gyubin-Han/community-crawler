package com.community.aggregator.dto;

import com.community.aggregator.entity.Board;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardDto {

    private Long id;
    private String community;
    private String name;
    private String url;
    private Boolean enabled;
    private Integer displayOrder;
    private String description;

    public static BoardDto fromEntity(Board board) {
        return BoardDto.builder()
                .id(board.getId())
                .community(board.getCommunity())
                .name(board.getName())
                .url(board.getUrl())
                .enabled(board.getEnabled())
                .displayOrder(board.getDisplayOrder())
                .description(board.getDescription())
                .build();
    }

    public Board toEntity() {
        return Board.builder()
                .id(this.id)
                .community(this.community)
                .name(this.name)
                .url(this.url)
                .enabled(this.enabled != null ? this.enabled : true)
                .displayOrder(this.displayOrder != null ? this.displayOrder : 0)
                .description(this.description)
                .build();
    }
}
