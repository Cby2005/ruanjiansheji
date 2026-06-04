package com.cby.smartfarm.rag.config;

import com.cby.smartfarm.rag.embedding.EmbeddingClient;
import com.cby.smartfarm.rag.embedding.MockEmbeddingClient;
import com.cby.smartfarm.rag.embedding.OpenAiCompatibleEmbeddingClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * 根据 embedding.provider 配置自动选择 EmbeddingClient 实现：
 * - mock: MockEmbeddingClient（本地 SHA-256 模拟）
 * - api / openai_compatible: OpenAiCompatibleEmbeddingClient（DashScope / OpenAI）
 */
@Slf4j
@Configuration
public class EmbeddingClientConfiguration {

    @Bean
    @Primary
    public EmbeddingClient embeddingClient(EmbeddingProperties properties) {
        String provider = properties.getProvider();
        if ("mock".equalsIgnoreCase(provider)) {
            log.info("Embedding provider: mock (SHA-256 simulated)");
            return new MockEmbeddingClient(properties);
        }
        log.info("Embedding provider: {} -> using DashScope/OpenAI compatible API, baseUrl={}, model={}",
                provider, properties.getBaseUrl(), properties.getModel());
        return new OpenAiCompatibleEmbeddingClient(properties);
    }
}
