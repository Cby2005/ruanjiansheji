# 多智能体农业决策模块

本模块位于 `com.cby.smartfarm.agent`，用于模拟多个农业专家智能体协同分析环境监测数据，并生成农业解决方案、设备联动建议和农事任务建议。

## 智能体组成

- 土壤专家智能体：分析土壤湿度、pH、EC、养分。
- 气候调控智能体：分析温度、湿度、光照、CO2、降雨。
- 病虫害防控智能体：分析虫情数量和虫害类型。
- 农艺专家智能体：结合情景、作物和生长阶段生成管理方案。
- 设备联动智能体：将专家建议转换为设备动作建议。

## 接口 1：根据指定环境数据生成方案

```http
POST http://localhost:8080/api/agents/decision
Content-Type: application/json
```

```json
{
  "crop": "tomato",
  "growthStage": "flowering",
  "scenario": "连续阴雨后出现虫害压力",
  "environment": {
    "soilTemperature": 21.5,
    "soilHumidity": 86,
    "phValue": 5.2,
    "ecValue": 1.8,
    "nutrient": 35,
    "airTemperature": 28,
    "airHumidity": 88,
    "lightIntensity": 12000,
    "co2": 330,
    "windSpeed": 2.5,
    "rainfall": 25,
    "pestCount": 32,
    "pestType": "aphid"
  }
}
```

## 接口 2：使用最新环境监测数据生成方案

```http
GET http://localhost:8080/api/agents/decision/latest?crop=tomato&growthStage=flowering&scenario=高温干旱
```

使用该接口前，需要先调用环境采集接口生成监测记录：

```http
POST http://localhost:8080/api/environment/collect
```

或：

```http
POST http://localhost:8080/api/environment/collect-and-control
```

## 返回字段说明

- `overallRiskLevel`：综合风险等级，取值为 `LOW`、`MEDIUM`、`HIGH`。
- `summary`：编排器汇总后的总体判断。
- `agentFindings`：每个智能体的独立分析结果。
- `immediateActions`：立即处理建议。
- `deviceActions`：设备联动建议。
- `taskSuggestions`：农事任务建议。
- `followUpMetrics`：后续应重点监测的指标。

## 后续可扩展方向

- 将规则智能体替换或增强为大模型智能体。
- 增加“管理员确认后执行设备控制”的闭环接口。
- 将 `taskSuggestions` 自动落库为农事任务。
- 按作物类型维护不同阈值，例如番茄、黄瓜、水稻分别配置不同适宜区间。
