# 全国农技中心文档采集与知识图谱三元组抽取

本目录用于整理全国农业技术推广服务中心等农技来源的病虫害预报、防控方案、生产指导文档。脚本采用低频请求，并支持手动整理 CSV 后直接抽取三元组。

## 1. 安装依赖

```powershell
cd D:\作业\ruanjiansheji\tools\natesc_import
pip install -r requirements.txt
```

## 2. 采集文档

从 URL 文件读取，每行一个：

```powershell
python crawl_natesc_docs.py --seed-file .\seed_urls.txt --output .\output\natesc_documents.csv --delay 2 --max-pages 10
```

也可以直接传入 URL：

```powershell
python crawl_natesc_docs.py --seed-url https://www.natesc.org.cn/ --discover --max-pages 5
```

输出字段：

`id,title,source_url,publish_date,doc_type,crop,region,content,summary,risk_level,forecast_area,control_measures,created_at`

`doc_type` 可选值：

- `pest_forecast`
- `control_plan`
- `production_guide`
- `water_fertilizer_plan`
- `other`

如果网页结构不稳定，可以手动整理同字段 CSV，放到 `output/natesc_documents.csv`，然后执行下一步。

## 3. 抽取知识图谱三元组

```powershell
python extract_natesc_kg.py --documents .\output\natesc_documents.csv --output .\output\natesc_kg_triples.csv
```

输出字段：

`source,relation,target,evidence,source_url`

当前规则会抽取：

- 作物 `HAS_DISEASE` 病害
- 作物 `HAS_PEST` 虫害
- 气象因素 `INCREASES_RISK_OF` 病害/虫害
- 病害/虫害 `CONTROLLED_BY` 防治措施
- 地区 `HAS_RISK` 病虫害

这些三元组后续可导入 Neo4j，形成 `Crop`、`Disease`、`Pest`、`WeatherFactor`、`Region`、`Measure` 等节点。
