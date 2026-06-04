# Milvus Standalone for Smart Farm RAG

启动 Milvus：

```powershell
cd docker/milvus
docker compose up -d
docker compose ps
```

默认连接地址：

```text
localhost:19530
```

本项目后端默认 collection：

```text
smart_farm_rag_chunks
```

停止：

```powershell
docker compose down
```

如需清空 Milvus 数据：

```powershell
docker compose down -v
```
