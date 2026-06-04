package com.cby.smartfarm.rag.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class RagChunkDTO {
    private String chunkId;
    private String articleId;
    private String source;
    private String title;
    private String sourceUrl;
    private String category;
    private String publishDate;
    private Long chunkIndex;
    private String chunkText;
    private List<String> entities = new ArrayList<>();
    private String createdAt;
}
