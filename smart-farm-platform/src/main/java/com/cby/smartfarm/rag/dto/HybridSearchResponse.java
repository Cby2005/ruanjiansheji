package com.cby.smartfarm.rag.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class HybridSearchResponse {
    private String query;
    private String warning;
    private List<RagSearchResultDTO> ragResults = new ArrayList<>();
    private List<KgEvidenceDTO> kgEvidence = new ArrayList<>();
}
