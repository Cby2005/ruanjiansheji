# AGROVOC 中文农业术语导入 Neo4j

本工具用于解析本地已下载的 AGROVOC Core 压缩包，从全量 RDF/NT/TTL 文件中筛选中文标签 `@zh`，生成 CSV，并导入 Neo4j，作为智慧农场知识图谱的基础术语层。

AGROVOC 没有单独的中文版下载包，中文标签包含在全量 Core 文件中。本工具不会造假数据，也不会手写示例数据，所有输出均来自本地压缩包 `agrovoc_core.raf.zip`。

## 目录结构

```text
tools/agrovoc_import/
├── README.md
├── requirements.txt
├── config.example.env
├── parse_agrovoc.py
├── import_to_neo4j.py
├── cypher_constraints.cypher
├── data/
│   └── agrovoc_core.raf.zip
└── output/
    ├── agrovoc_concepts.csv
    └── agrovoc_relations.csv
```

`data/` 和 `output/` 会自动创建。`output/agrovoc_concepts.csv` 和 `output/agrovoc_relations.csv` 会在解析命令执行成功后生成。

## 1. 安装依赖

```powershell
cd tools/agrovoc_import
pip install -r requirements.txt
```

## 2. 放置 AGROVOC 文件

把你下载好的文件放到：

```text
tools/agrovoc_import/data/agrovoc_core.raf.zip
```

## 3. 解析 AGROVOC

```powershell
python parse_agrovoc.py --input ./data/agrovoc_core.raf.zip --output ./output
```

程序会自动：

- 检查 ZIP 文件是否存在。
- 打印 ZIP 内部文件列表。
- 优先选择 `.rdf`、`.xml`、`.nt`、`.ttl` 文件。
- 根据扩展名自动选择 rdflib 解析格式。
- 筛选 `skos:prefLabel @zh`、`skos:altLabel @zh`，同时保留英文标签。
- 只保留至少有中文标签的概念。
- 只保留 source 和 target 都在中文概念集合中的关系。

如果需要手动指定格式：

```powershell
python parse_agrovoc.py --input ./data/agrovoc_core.raf.zip --format xml --output ./output
```

解析完成后应该生成：

```text
output/agrovoc_concepts.csv
output/agrovoc_relations.csv
```

CSV 使用 `utf-8-sig` 编码，方便 Excel 正常显示中文。

## 4. 配置 Neo4j

复制配置文件：

```powershell
Copy-Item config.example.env .env
```

Linux/macOS 可用：

```bash
cp config.example.env .env
```

然后修改 `.env` 中的 Neo4j 密码：

```text
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=neo4j
```

## 5. 执行 Neo4j 约束

在 Neo4j Browser 中执行：

```cypher
CREATE CONSTRAINT agro_concept_uri_unique IF NOT EXISTS
FOR (n:AgroConcept)
REQUIRE n.uri IS UNIQUE;

CREATE INDEX agro_concept_zh_label_index IF NOT EXISTS
FOR (n:AgroConcept)
ON (n.zhPrefLabel);

CREATE INDEX agro_concept_en_label_index IF NOT EXISTS
FOR (n:AgroConcept)
ON (n.enPrefLabel);
```

也可以直接复制执行 `cypher_constraints.cypher` 文件中的内容。

## 6. 导入 Neo4j

```powershell
python import_to_neo4j.py --concepts ./output/agrovoc_concepts.csv --relations ./output/agrovoc_relations.csv
```

导入脚本会使用 `MERGE`，支持重复运行，不会重复创建相同 URI 的节点和相同类型的关系。

## 导入后的节点

节点标签：

```cypher
(:AgroConcept)
```

节点属性：

- `uri`
- `code`
- `zhPrefLabel`
- `enPrefLabel`
- `zhAltLabels`
- `enAltLabels`
- `allZhLabels`
- `allEnLabels`
- `source`

其中：

```text
source = "AGROVOC"
```

## 导入后的关系

会导入这些关系类型：

- `BROADER_THAN`
- `NARROWER_THAN`
- `RELATED_TO`
- `EXACT_MATCH`
- `CLOSE_MATCH`

关系来源：

| AGROVOC RDF Predicate | Neo4j Relationship |
| --- | --- |
| `skos:broader` | `BROADER_THAN` |
| `skos:narrower` | `NARROWER_THAN` |
| `skos:related` | `RELATED_TO` |
| `skos:exactMatch` | `EXACT_MATCH` |
| `skos:closeMatch` | `CLOSE_MATCH` |

## 测试 Cypher

查看前 20 个中文农业术语：

```cypher
MATCH (n:AgroConcept)
RETURN n.zhPrefLabel, n.enPrefLabel, n.uri
LIMIT 20;
```

查询“水稻”相关术语：

```cypher
MATCH (n:AgroConcept)
WHERE n.zhPrefLabel CONTAINS "水稻"
RETURN n.zhPrefLabel, n.enPrefLabel, n.uri
LIMIT 20;
```

查询上下位关系和相关关系：

```cypher
MATCH (n:AgroConcept)-[r:BROADER_THAN|NARROWER_THAN|RELATED_TO]-(m:AgroConcept)
WHERE n.zhPrefLabel CONTAINS "水稻"
RETURN n.zhPrefLabel, type(r), m.zhPrefLabel, m.enPrefLabel
LIMIT 50;
```

## 常见问题

### ZIP 内没有 RDF/NT/TTL 文件

脚本会打印 ZIP 内部文件列表，并提示：

```text
No RDF/NT/TTL file found in ZIP.
```

这时请检查下载的是否为 AGROVOC Core RDF 包。

### RDF 解析失败

可以手动指定格式：

```powershell
python parse_agrovoc.py --input ./data/agrovoc_core.raf.zip --format xml --output ./output
```

支持格式：

- `xml`
- `nt`
- `turtle`

### 中文乱码

输出 CSV 使用 `utf-8-sig` 编码，一般可以直接用 Excel 打开。如果仍乱码，可以用 Excel 的“从文本/CSV 导入”并选择 UTF-8。
