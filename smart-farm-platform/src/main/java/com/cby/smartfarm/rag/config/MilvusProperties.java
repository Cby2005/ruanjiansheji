package com.cby.smartfarm.rag.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "milvus")
public class MilvusProperties {

    private String host = "localhost";
    private Integer port = 19530;
    private String database = "default";
    private String collection = "smart_farm_rag_chunks";
    private Integer embeddingDim = 768;
    private String metricType = "COSINE";
    private String indexType = "HNSW";

    public String uri() {
        return "http://" + host + ":" + port;
    }
}
