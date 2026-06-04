package com.cby.smartfarm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeGraphResult {

    private String query;

    private List<String> ragContext = new ArrayList<>();

    private List<GraphNode> nodes = new ArrayList<>();

    private List<GraphLink> links = new ArrayList<>();

    private List<GraphChunk> chunks = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GraphNode {
        private Long id;
        private String name;
        private String type;
        private String description;
        private Map<String, Object> properties;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GraphLink {
        private Long source;
        private Long target;
        private String relationType;
        private String description;
        private Double weight;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GraphChunk {
        private Long id;
        private Long documentId;
        private String content;
        private String keywords;
    }
}
