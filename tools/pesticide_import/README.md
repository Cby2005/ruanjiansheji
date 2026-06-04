# 中国农药信息网数据整理与 Neo4j 导入

中国农药信息网可能存在动态查询、验证码或访问频率限制。本工具不绕过验证码、不做高频请求，优先支持你从网站手动导出的 CSV/Excel。

## 1. 安装依赖

```powershell
cd D:\作业\ruanjiansheji\tools\pesticide_import
pip install -r requirements.txt
```

## 2. 手动准备登记数据

从中国农药信息网查询并导出或复制整理为 CSV/Excel。字段可以是中文列名，也可以是标准列名。

标准字段：

`registration_no,pesticide_name,category,formulation,total_content,toxicity,active_ingredient,crop_or_site,control_target,application_method,holder,valid_until,source_url`

本目录已提供空模板：

```powershell
.\data\pesticide_template.csv
```

你可以把真实登记信息填入模板，另存为：

```powershell
.\data\pesticide.csv
```

## 3. 生成标准 CSV 和三元组

```powershell
python import_pesticide_csv.py --input .\data\pesticide.csv --output .\output
```

生成：

- `output/pesticide_registration.csv`
- `output/pesticide_kg_triples.csv`

## 4. 导入 Neo4j

用环境变量配置 Neo4j，不要把密码写到代码里：

```powershell
$env:NEO4J_URI="bolt://localhost:7687"
$env:NEO4J_USER="neo4j"
$env:NEO4J_PASSWORD="20050828"
$env:NEO4J_DATABASE="neo4j"
python pesticide_to_neo4j.py --registrations .\output\pesticide_registration.csv --triples .\output\pesticide_kg_triples.csv
```

也可以创建 `.env`：

```text
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=neo4j
```

## 5. Neo4j 节点和关系

节点：

- `Pesticide`
- `ActiveIngredient`
- `Crop`
- `Disease`
- `Pest`
- `ApplicationMethod`
- `PesticideCategory`

关系：

- `HAS_INGREDIENT`
- `BELONGS_TO`
- `REGISTERED_FOR`
- `CONTROLS`
- `USES_METHOD`

## 6. 农药建议安全提示

后续大模型或 Agent 生成农药建议时，必须附加：

具体药剂、浓度、施用次数和安全间隔期应以农药标签、登记信息和当地农技部门指导为准。
