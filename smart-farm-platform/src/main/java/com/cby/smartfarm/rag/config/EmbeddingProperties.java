package com.cby.smartfarm.rag.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "embedding")
public class EmbeddingProperties {

    private String provider = "mock";
    private String baseUrl;
    private String apiKey;
    private String model = "bge-base-zh-v1.5";
    private Integer dimension = 768;

    public boolean isMock() {
        return "mock".equalsIgnoreCase(provider);
    }

    public boolean isOpenAiCompatible() {
        return "openai_compatible".equalsIgnoreCase(provider) || "api".equalsIgnoreCase(provider);
    }
}
