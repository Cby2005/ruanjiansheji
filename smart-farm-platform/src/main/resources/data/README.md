# 智慧农场数据集导入模块

## 数据集说明

### 1. Open-Meteo Historical Weather API - 环境数据

**文件位置**: `src/main/resources/data/sample_environment.csv`

**数据字段**:
| 字段名 | 说明 | 数据类型 |
|--------|------|----------|
| collect_time | 采集时间 | DateTime |
| air_temperature | 空气温度(°C) | Double |
| air_humidity | 空气湿度(%) | Double |
| soil_temperature | 土壤温度(°C) | Double |
| soil_humidity | 土壤湿度(%) | Double |
| rainfall | 降雨量(mm) | Double |
| wind_speed | 风速(m/s) | Double |
| light_intensity | 光照强度(lux) | Double |
| co2 | CO₂浓度(ppm) | Double |
| ph_value | pH值 | Double |
| ec_value | EC值(mS/cm) | Double |
| nutrient | 养分含量(mg/kg) | Double |
| pest_type | 害虫类型 | String |
| pest_count | 虫情数量 | Integer |

**对应系统模块**: 环境监测模块、数据统计模块

**数据库表**: `environment_record`

---

### 2. Crop Recommendation Dataset - 作物推荐数据

**文件位置**: `src/main/resources/data/crop_recommendation.csv`

**数据字段**:
| 字段名 | 说明 | 数据类型 |
|--------|------|----------|
| N | 氮含量 | Double |
| P | 磷含量 | Double |
| K | 钾含量 | Double |
| temperature | 温度(°C) | Double |
| humidity | 湿度(%) | Double |
| ph | pH值 | Double |
| rainfall | 降雨量(mm) | Double |
| label | 作物名称 | String |

**包含作物**: rice, maize, chickpea, kidneybeans, pigeonpeas, mothbeans, mungbean, blackgram, lentil, pomegranate, grapes, orange, apple, coconut, cotton, jute, mango, muskmelon, watermelon, coffee

**对应系统模块**: 作物推荐模块、环境适宜度评分模块

**数据库表**: `crop_recommendation`

---

### 3. Fertilizer Suggestion Dataset - 施肥建议数据

**文件位置**: `src/main/resources/data/fertilizer_advice.csv`

**数据字段**:
| 字段名 | 说明 | 数据类型 |
|--------|------|----------|
| Crop | 作物名称 | String |
| N | 氮含量 | Double |
| P | 磷含量 | Double |
| K | 钾含量 | Double |
| pH | pH值 | Double |
| soil_moisture | 土壤湿度(%) | Double |
| fertilizer_name | 肥料名称 | String |
| fertilizer_amount | 肥料用量 | String |
| advice | 施肥建议 | String |

**包含作物**: rice, maize, wheat, cotton, sugarcane, potato, tomato, chili, cabbage, soybean, peanut, rapeseed, sunflower

**对应系统模块**: 农事管理模块、施肥建议模块

**数据库表**: `fertilizer_advice`

---

### 4. IP102 Pest Dataset - 害虫类型数据

**文件位置**: `src/main/resources/data/pest_type.csv`

**数据字段**:
| 字段名 | 说明 | 数据类型 |
|--------|------|----------|
| pest_code | 害虫编码 | String |
| pest_name | 害虫名称 | String |
| pest_category | 害虫类别 | String |
| damage_crop | 危害作物 | String |
| damage_part | 危害部位 | String |
| damage_symptom | 危害症状 | String |
| prevention_method | 防治方法 | String |

**包含害虫**: 蚜虫、棉蚜、白粉虱、红蜘蛛、菜青虫、小菜蛾、玉米螟、二化螟、稻飞虱、稻纵卷叶螟、棉铃虫、烟青虫、地老虎、蛴螬、蝼蛄等25种

**对应系统模块**: 虫情监测模块、预警模块

**数据库表**: `pest_type`

---

## API 接口

### 数据导入接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/data/import` | POST | 导入所有数据集 |
| `/api/data/import/environment` | POST | 导入环境数据 |
| `/api/data/import/crop` | POST | 导入作物推荐数据 |
| `/api/data/import/fertilizer` | POST | 导入施肥建议数据 |
| `/api/data/import/pest` | POST | 导入害虫类型数据 |
| `/api/data/stats` | GET | 获取数据导入统计 |

### 使用示例

```bash
# 导入所有数据
curl -X POST http://localhost:8080/api/data/import

# 仅导入环境数据
curl -X POST http://localhost:8080/api/data/import/environment

# 查看数据统计
curl http://localhost:8080/api/data/stats
```

---

## 自动导入配置

项目启动时会自动检查数据库是否为空，如果为空则自动导入所有基础数据。

自动导入逻辑位于 `DataInitializer` 类中：
- 检查各表记录总数
- 如果总数为0，执行全量导入
- 如果已有数据，跳过导入

---

## 数据来源

1. **环境数据**: 基于 Open-Meteo Historical Weather API 格式生成的样本数据
2. **作物推荐数据**: 来源于 Crop Recommendation Dataset
3. **施肥建议数据**: 来源于 Fertilizer Suggestion Dataset
4. **害虫类型数据**: 基于 IP102 Pest Dataset 整理的害虫类别信息

---

## 注意事项

1. 首次启动时会自动导入数据，后续启动不会重复导入
2. 可通过 API 接口手动触发数据导入
3. 导入操作会清空原有数据后重新导入
4. CSV 文件编码为 UTF-8
