# agri.cn 农技文章 RAG 数据准备

本目录用于把中国农业信息网等中文农技文章整理成 RAG 可用 CSV。脚本默认只处理你提供的种子 URL 或手动整理文件，不做高频抓取。

## 1. 安装依赖

```powershell
cd D:\作业\ruanjiansheji\tools\agri_article_import
pip install -r requirements.txt
```

## 2. 采集文章

单个或多个 URL：

```powershell
python crawl_agri_articles.py --seed-url https://www.agri.cn/ --max-pages 5 --delay 2
```

从文件读取 URL，每行一个：

```powershell
python crawl_agri_articles.py --seed-file .\seed_urls.txt --output .\output\agri_articles.csv --delay 2
```

输出字段：

`id,title,source_name,source_url,publish_date,category,content,summary,crop_tags,disease_tags,pest_tags,measure_tags,created_at`

如果网页结构变化导致正文提取不理想，可以手动整理同字段 CSV，然后继续执行清洗和抽取脚本。

## 3. 清洗并分块

```powershell
python clean_articles.py --input .\output\agri_articles.csv --output .\output
```

生成：

- `output/agri_articles.csv`
- `output/agri_article_chunks.csv`

分块字段：

`chunk_id,article_id,chunk_text,chunk_index,source_url,title,category`

## 4. 抽取实体标签

默认会尝试读取 AGROVOC 中文术语：

```powershell
python extract_article_entities.py --articles .\output\agri_articles.csv --output .\output
```

也可以显式指定：

```powershell
python extract_article_entities.py --articles .\output\agri_articles.csv --agrovoc ..\agrovoc_import\output\agrovoc_concepts.csv --output .\output
```

生成：

- `output/agri_article_entities.csv`

这些 CSV 后续可以导入 MySQL 的文章表、分块表，也可以送入 Milvus、pgvector 或其他向量库。
