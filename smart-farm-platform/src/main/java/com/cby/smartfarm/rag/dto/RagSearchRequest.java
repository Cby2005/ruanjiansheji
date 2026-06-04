package com.cby.smartfarm.rag.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class RagSearchRequest {
    private String query;
    private Integer topK = 5;
    private List<String> sources = new ArrayList<>();
    private String crop;
    private Boolean enableKgExpand = false;
    private String kgKeyword;
    private Integer kgDepth = 2;
}
