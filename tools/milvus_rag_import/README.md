# Milvus RAG Chunk Import

安装依赖：

```powershell
cd tools/milvus_rag_import
pip install -r requirements.txt
```

启动 Milvus：

```powershell
cd ../../docker/milvus
docker compose up -d
```

导入 agri.cn chunk：

```powershell
cd ../../tools/milvus_rag_import
python import_chunks_to_milvus.py --input ../agri_article_import/output/agri_article_chunks.csv --source agri_cn --collection smart_farm_rag_chunks
```

导入全国农技中心 chunk：

```powershell
python import_chunks_to_milvus.py --input ../natesc_import/output/natesc_article_chunks.csv --source natesc --collection smart_farm_rag_chunks
```

如果全国农技中心当前只有 `natesc_documents.csv`，请先将正文清洗分块为字段兼容的 chunk CSV，至少包含：

```text
chunk_id, article_id, source, title, source_url, category, publish_date, chunk_index, chunk_text, entities
```

检查 collection：

```powershell
python check_milvus_collection.py --collection smart_farm_rag_chunks
```

默认使用 mock embedding：

```text
EMBEDDING_PROVIDER=mock
EMBEDDING_DIMENSION=768
```

切换 OpenAI-compatible embedding：

```powershell
$env:EMBEDDING_PROVIDER="openai_compatible"
$env:EMBEDDING_BASE_URL="https://your-embedding-api/v1"
$env:EMBEDDING_API_KEY="your_key"
$env:EMBEDDING_MODEL="bge-base-zh-v1.5"
$env:EMBEDDING_DIMENSION="768"
```
