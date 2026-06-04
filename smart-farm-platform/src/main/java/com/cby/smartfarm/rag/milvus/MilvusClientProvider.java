package com.cby.smartfarm.rag.milvus;

import com.cby.smartfarm.rag.config.MilvusProperties;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MilvusClientProvider {

    private final MilvusProperties properties;

    public MilvusClientV2 newClient() {
        ConnectConfig config = ConnectConfig.builder()
                .uri(properties.uri())
                .dbName(properties.getDatabase())
                .enablePrecheck(false)
                .connectTimeoutMs(2000)
                .rpcDeadlineMs(2000)
                .build();
        return new MilvusClientV2(config);
    }
}
