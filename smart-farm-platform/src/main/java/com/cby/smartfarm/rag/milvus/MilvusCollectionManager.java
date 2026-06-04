package com.cby.smartfarm.rag.milvus;

import com.cby.smartfarm.rag.config.MilvusProperties;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.DropCollectionReq;
import io.milvus.v2.service.collection.request.HasCollectionReq;
import io.milvus.v2.service.collection.request.LoadCollectionReq;
import io.milvus.v2.service.index.request.CreateIndexReq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class MilvusCollectionManager {

    public static final String VECTOR_FIELD = "vector";

    private final MilvusProperties properties;

    public boolean exists(MilvusClientV2 client) {
        return client.hasCollection(HasCollectionReq.builder()
                .databaseName(properties.getDatabase())
                .collectionName(properties.getCollection())
                .build());
    }

    public void ensureCollection(MilvusClientV2 client, boolean recreate) {
        if (recreate && exists(client)) {
            client.dropCollection(DropCollectionReq.builder()
                    .databaseName(properties.getDatabase())
                    .collectionName(properties.getCollection())
                    .build());
        }
        if (exists(client)) {
            load(client);
            return;
        }

        CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
                .enableDynamicField(false)
                .build();
        schema.setFieldSchemaList(List.of(
                varchar("id", 128, true),
                varchar("article_id", 128, false),
                varchar("source", 64, false),
                varchar("title", 512, false),
                varchar("source_url", 1024, false),
                varchar("category", 128, false),
                varchar("publish_date", 64, false),
                CreateCollectionReq.FieldSchema.builder().name("chunk_index").dataType(DataType.Int64).build(),
                varchar("chunk_text", 8192, false),
                varchar("entities", 1024, false),
                CreateCollectionReq.FieldSchema.builder()
                        .name(VECTOR_FIELD)
                        .dataType(DataType.FloatVector)
                        .dimension(properties.getEmbeddingDim())
                        .build(),
                varchar("created_at", 64, false)
        ));

        client.createCollection(CreateCollectionReq.builder()
                .databaseName(properties.getDatabase())
                .collectionName(properties.getCollection())
                .collectionSchema(schema)
                .build());

        client.createIndex(CreateIndexReq.builder()
                .databaseName(properties.getDatabase())
                .collectionName(properties.getCollection())
                .indexParams(List.of(indexParam()))
                .sync(true)
                .build());
        load(client);
    }

    private void load(MilvusClientV2 client) {
        client.loadCollection(LoadCollectionReq.builder()
                .databaseName(properties.getDatabase())
                .collectionName(properties.getCollection())
                .sync(true)
                .build());
    }

    private CreateCollectionReq.FieldSchema varchar(String name, int maxLength, boolean primaryKey) {
        return CreateCollectionReq.FieldSchema.builder()
                .name(name)
                .dataType(DataType.VarChar)
                .maxLength(maxLength)
                .isPrimaryKey(primaryKey)
                .autoID(false)
                .build();
    }

    private IndexParam indexParam() {
        return IndexParam.builder()
                .fieldName(VECTOR_FIELD)
                .indexName(VECTOR_FIELD + "_hnsw_idx")
                .indexType(IndexParam.IndexType.valueOf(properties.getIndexType()))
                .metricType(IndexParam.MetricType.valueOf(properties.getMetricType()))
                .extraParams(Map.of("M", 16, "efConstruction", 200))
                .build();
    }
}
