package com.cby.smartfarm.rag.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class RagSearchResponse {
    private String query;
    private Integer topK;
    private String warning;
    private List<RagSearchResultDTO> results = new ArrayList<>();
}
