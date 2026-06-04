package com.cby.smartfarm.rag.milvus;

import com.cby.smartfarm.rag.config.EmbeddingProperties;
import com.cby.smartfarm.rag.config.MilvusProperties;
import com.cby.smartfarm.rag.embedding.EmbeddingClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MilvusClientConfig {

    @Bean
    public DimensionGuard dimensionGuard(MilvusProperties milvusProperties,
                                         EmbeddingProperties embeddingProperties,
                                         EmbeddingClient embeddingClient) {
        if (!milvusProperties.getEmbeddingDim().equals(embeddingProperties.getDimension())) {
            throw new IllegalStateException("Milvus embedding-dim (" + milvusProperties.getEmbeddingDim()
                    + ") must equal embedding.dimension (" + embeddingProperties.getDimension() + ")");
        }
        if (embeddingClient.dimension() != milvusProperties.getEmbeddingDim()) {
            throw new IllegalStateException("EmbeddingClient dimension (" + embeddingClient.dimension()
                    + ") must equal milvus.embedding-dim (" + milvusProperties.getEmbeddingDim() + ")");
        }
        return new DimensionGuard();
    }

    public static class DimensionGuard {
    }
}
