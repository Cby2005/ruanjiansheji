# 智慧农场 Milvus RAG 与多 Agent 决策闭环

## 1. 启动 Milvus

```powershell
cd docker/milvus
docker compose up -d
docker compose ps
```

默认地址：

```text
localhost:19530
```

## 2. 后端配置

`smart-farm-platform/src/main/resources/application.yml` 已新增：

```yaml
milvus:
  host: localhost
  port: 19530
  database: default
  collection: smart_farm_rag_chunks
  embedding-dim: 768
  metric-type: COSINE
  index-type: HNSW

embedding:
  provider: mock
  base-url:
  api-key:
  model: bge-base-zh-v1.5
  dimension: 768
```

`embedding.dimension` 必须等于 `milvus.embedding-dim`，启动时会检查，不一致会抛出明确错误。

## 3. Milvus Collection Schema

Collection 名称：

```text
smart_farm_rag_chunks
```

字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | VarChar | 主键，chunk_id |
| article_id | VarChar | 文章 ID |
| source | VarChar | agri_cn / natesc |
| title | VarChar | 标题 |
| source_url | VarChar | 原文链接 |
| category | VarChar | 分类 |
| publish_date | VarChar | 发布日期 |
| chunk_index | Int64 | 分块序号 |
| chunk_text | VarChar | 分块正文 |
| entities | VarChar | 实体标签，用 `|` 分隔 |
| vector | FloatVector | embedding 向量 |
| created_at | VarChar | 写入时间 |

向量索引：

```json
{
  "index_type": "HNSW",
  "metric_type": "COSINE",
  "params": {
    "M": 16,
    "efConstruction": 200
  }
}
```

查询参数：

```json
{ "ef": 64 }
```

## 4. 导入 agri.cn chunk

```powershell
cd tools/milvus_rag_import
pip install -r requirements.txt

python import_chunks_to_milvus.py `
  --input ../agri_article_import/output/agri_article_chunks.csv `
  --source agri_cn `
  --collection smart_farm_rag_chunks
```

## 5. 导入全国农技中心 chunk

```powershell
python import_chunks_to_milvus.py `
  --input ../natesc_import/output/natesc_article_chunks.csv `
  --source natesc `
  --collection smart_farm_rag_chunks
```

如果当前只有 `natesc_documents.csv`，需要先整理成 chunk CSV，至少包含：

```text
chunk_id,article_id,source,title,source_url,category,publish_date,chunk_index,chunk_text,entities
```

## 6. 测试 /api/rag/search

```powershell
$body = @{
  query = "小麦赤霉病怎么防治？"
  topK = 5
  sources = @("agri_cn", "natesc")
  crop = "小麦"
  enableKgExpand = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8080/api/rag/search `
  -Method Post `
  -ContentType application/json `
  -Body $body
```

## 7. 测试 /api/rag/hybrid-search

```powershell
$body = @{
  query = "当前高温高湿，小麦容易发生什么病害？"
  topK = 5
  kgKeyword = "小麦"
  kgDepth = 2
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8080/api/rag/hybrid-search `
  -Method Post `
  -ContentType application/json `
  -Body $body
```

## 8. 测试 /api/agent/decision

```powershell
$body = @{
  farmId = 1
  crop = "小麦"
  region = "河南郑州"
  soilMoisture = 18
  temperature = 31
  humidity = 82
  precipitation = 0
  windSpeed = 2.1
  question = "当前是否需要灌溉？是否有病虫害风险？"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8080/api/agent/decision `
  -Method Post `
  -ContentType application/json `
  -Body $body
```

期望流程：

1. 环境监测 Agent 判断土壤湿度偏低、高温高湿。
2. 病虫害 Agent 查询知识图谱风险关系。
3. 农技知识 Agent 调用 Milvus RAG。
4. 农药安全 Agent 只基于已导入登记数据给约束。
5. 综合决策 Agent 输出建议。

## 9. MockEmbeddingClient 与真实 EmbeddingClient

当前默认：

```text
embedding.provider=mock
```

MockEmbeddingClient 使用稳定 hash 生成固定维度向量，适合开发测试，但不代表真实语义相似度。接口返回会带 warning。

切换真实 OpenAI-compatible embedding：

```yaml
embedding:
  provider: openai_compatible
  base-url: https://your-embedding-api/v1
  api-key: your_api_key
  model: bge-base-zh-v1.5
  dimension: 768
```

注意不要把 API key 写进代码或日志。

## 10. 常见错误

### Milvus 连接失败

检查：

```powershell
cd docker/milvus
docker compose ps
```

确认 `standalone` 容器运行，端口 `19530` 没被占用。

### embedding 维度不一致

后端启动会提示：

```text
Milvus embedding-dim (...) must equal embedding.dimension (...)
```

把 `milvus.embedding-dim` 和 `embedding.dimension` 改成同一个值。

### collection 不存在

后端检索会尝试自动创建 collection。Python 导入工具也会自动创建。

### 没有检索结果

检查是否已导入 chunk：

```powershell
cd tools/milvus_rag_import
python check_milvus_collection.py --collection smart_farm_rag_chunks
```

### mock embedding 语义不准确

这是正常现象。Mock 只用于验证流程，真实答辩效果建议接入 bge、Ollama 或 OpenAI-compatible embedding 服务。
