# 智慧农场综合管理平台

## 一、项目背景

本项目是《软件设计与体系结构》课程设计项目，旨在通过一个智慧农场综合管理平台，综合运用 **9 种经典设计模式** 解决实际农业物联网场景中的问题。

平台模拟了一个完整的智慧农业管理系统，涵盖环境数据采集、设备控制、农事任务管理、产量预测、异常事件处理等功能模块。重点不在于业务复杂度，而在于**设计模式的合理应用与清晰展示**。

## 二、技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 17 | 开发语言 |
| Spring Boot | 3.2.5 | 应用框架 |
| Spring Data JPA | - | 数据持久层 |
| MySQL | 8.0 | 关系型数据库 |
| springdoc-openapi | 2.5.0 | Swagger API 文档 |
| Lombok | - | 简化代码 |
| Docker Compose | - | 数据库容器化部署 |
| Maven | - | 项目构建工具 |

## 三、系统功能模块

```
智慧农场综合管理平台
├── 环境数据采集与监控
│   ├── 传感器数据采集（工厂方法模式）
│   ├── 环境数据存储与查询
│   ├── 阈值预警（单例配置中心）
│   └── 自动控制联动（观察者模式）
├── 设备管理
│   ├── 设备初始化与查询
│   ├── 设备状态管理（状态模式）
│   ├── 设备远程控制（代理模式）
│   ├── 设备功能增强（装饰器模式）
│   └── 设备指令控制（命令模式）
├── 农事任务管理
│   ├── 任务创建、分配、完成
│   └── 智能建议任务生成
├── 数据统计与预测
│   ├── 环境数据统计
│   ├── 设备运行统计
│   └── 产量预测
├── 策略管理（策略模式）
│   ├── 灌溉策略
│   ├── 补光策略
│   └── 通风策略
└── 异常事件处理（责任链模式）
    ├── 本地控制器处理
    ├── 区域控制器处理
    ├── 中央平台处理
    └── 管理员通知
```

## 四、设计模式应用说明

| 设计模式 | 实现位置 | 作用 |
|---------|---------|------|
| 工厂方法模式 | `SensorFactory`、`ActuatorFactory` | 创建不同类型的传感器和执行器对象，客户端无需知道具体类 |
| 观察者模式 | `EnvironmentDataCenter`、`EnvironmentObserver` | 环境数据变化时自动通知所有观察者，触发设备控制和预警 |
| 策略模式 | `IrrigationStrategy`、`LightingStrategy`、`VentilationStrategy` | 封装可替换的农业作业算法，运行时动态切换 |
| 命令模式 | `Command`、`CommandQueueManager` | 将设备操作封装为命令对象，支持排队执行和撤销 |
| 状态模式 | `DeviceState`（StandbyState/RunningState/FaultState等） | 管理设备生命周期状态转换，避免大量 if-else |
| 责任链模式 | `EventHandler`（Local/Region/Central/Admin） | 异常事件分级处理，降低请求发送者与处理者耦合 |
| 单例模式 | `ConfigCenter`、`LogRecorder`、`CommandQueueManager` | 保证配置中心、日志记录器、命令队列全局唯一 |
| 代理模式 | `RemoteDeviceServiceProxy` | 在真实设备访问前增加权限校验和操作审计 |
| 装饰器模式 | `DeviceDecorator`（Energy/Runtime/Fault） | 在不修改原有设备类的前提下动态增加功能 |

## 五、项目启动步骤

### 5.1 环境要求

- JDK 17+
- Maven 3.6+
- Docker & Docker Compose

### 5.2 启动 MySQL

```bash
cd smart-farm-platform
docker compose up -d
```

MySQL 启动后：
- 主机：`localhost`
- 端口：`3306`
- 数据库：`smart_farm`
- 用户名：`root`
- 密码：`20050828`

### 5.3 启动项目

```bash
mvn spring-boot:run
```

启动成功后访问：
- 应用地址：`http://localhost:8080`
- Swagger UI：`http://localhost:8080/swagger-ui.html`
- OpenAPI JSON：`http://localhost:8080/v3/api-docs`

### 5.4 初始化数据

```bash
# 初始化5台设备
POST http://localhost:8080/api/system/init-devices

# 初始化4个用户（代理模式演示用）
POST http://localhost:8080/api/system/init-users
```

## 六、核心接口列表

### 6.1 传感器数据采集（工厂方法模式）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/sensors/collect/{type}` | 采集指定类型传感器数据（soil/light/weather/pest） |

### 6.2 环境数据管理（观察者模式）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/environment/collect` | 采集环境数据（仅保存） |
| POST | `/api/environment/collect-and-control` | 采集+观察者自动控制 |
| GET | `/api/environment/latest` | 查询最新环境数据 |
| GET | `/api/environment/list` | 查询所有环境数据 |

### 6.3 设备管理（状态模式 + 代理模式 + 装饰器模式）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/devices/list` | 查询所有设备 |
| POST | `/api/devices/{code}/start` | 启动设备 |
| POST | `/api/devices/{code}/stop` | 停止设备 |
| POST | `/api/devices/{code}/fault` | 标记故障 |
| POST | `/api/devices/{code}/maintain` | 进入维护 |
| POST | `/api/devices/{code}/calibrate` | 进入校准 |
| POST | `/api/devices/remote-control` | 远程控制（代理模式） |
| GET | `/api/devices/decorator-demo/{code}` | 装饰器模式演示 |

### 6.4 设备指令控制（命令模式）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/commands/add` | 添加命令到队列 |
| POST | `/api/commands/execute-all` | 执行队列中所有命令 |
| POST | `/api/commands/undo-last` | 撤销上一条命令 |

### 6.5 策略模式演示

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/strategy/demo?crop=tomato&stage=seedling` | 根据作物/生长期选择策略 |

### 6.6 责任链模式演示

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/system/events/simulate` | 模拟异常事件分级处理 |

### 6.7 农事任务管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/tasks` | 创建任务 |
| GET | `/api/tasks` | 查询全部任务 |
| PUT | `/api/tasks/{id}/assign?assignee=xxx` | 分配任务 |
| PUT | `/api/tasks/{id}/finish` | 完成任务 |
| GET | `/api/tasks/advice?crop=tomato&stage=flowering` | 智能建议任务 |

### 6.8 数据统计与预测

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/statistics/yield-predict` | 产量预测 |
| GET | `/api/statistics/environment/summary` | 环境数据统计 |
| GET | `/api/statistics/devices/summary` | 设备数据统计 |
| GET | `/api/statistics/overview` | 系统总览 |

### 6.9 系统管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/system/init-devices` | 初始化设备数据 |
| POST | `/api/system/init-users` | 初始化用户数据 |
| GET | `/api/system/health` | 系统健康检查 |

## 七、答辩演示流程（含完整请求 JSON，可直接复制到 Postman）

> 所有接口基础地址：`http://localhost:8080`

---

### 第一步：系统初始化

#### 1.1 初始化设备

```
POST http://localhost:8080/api/system/init-devices
```

无需请求体，直接发送。

#### 1.2 初始化用户

```
POST http://localhost:8080/api/system/init-users
```

无需请求体，直接发送。会创建 4 个用户：admin/tech/operator/viewer。

---

### 第二步：工厂方法模式 — 传感器数据采集

#### 2.1 采集土壤数据

```
GET http://localhost:8080/api/sensors/collect/soil
```

#### 2.2 采集气象数据

```
GET http://localhost:8080/api/sensors/collect/weather
```

#### 2.3 采集光照数据

```
GET http://localhost:8080/api/sensors/collect/light
```

#### 2.4 采集虫情数据

```
GET http://localhost:8080/api/sensors/collect/pest
```

> 讲解：SensorFactory.createSensor(type) 根据参数创建不同传感器对象，客户端无需知道具体类。

---

### 第三步：单例模式 + 观察者模式 — 环境数据采集与自动控制

#### 3.1 采集环境数据（仅保存）

```
POST http://localhost:8080/api/environment/collect
```

无需请求体。

#### 3.2 采集环境数据 + 观察者自动控制（核心演示）

```
POST http://localhost:8080/api/environment/collect-and-control
```

无需请求体。返回示例：
```json
{
  "code": 200,
  "data": {
    "环境数据": { "id": 1, "soilHumidity": 25.3, "lightIntensity": 180.0, ... },
    "自动控制动作": [
      "灌溉观察者: 土壤湿度 25.3% 低于阈值 40%，自动启动灌溉",
      "补光观察者: 光照强度 180.0lux 低于阈值 300lux，自动开启补光灯"
    ],
    "触发观察者数量": 2
  }
}
```

> 讲解：
> - **单例模式**：阈值来自 ConfigCenter 单例，日志记录来自 LogRecorder 单例
> - **观察者模式**：EnvironmentDataCenter 通知 4 个观察者，观察者根据阈值自动触发设备控制

---

### 第四步：策略模式 — 动态选择农业策略

#### 4.1 番茄苗期策略

```
GET http://localhost:8080/api/strategy/demo?crop=tomato&stage=seedling
```

#### 4.2 黄瓜开花期 + 高温通风

```
GET http://localhost:8080/api/strategy/demo?crop=cucumber&stage=flowering&condition=high_temp
```

#### 4.3 草莓结果期

```
GET http://localhost:8080/api/strategy/demo?crop=strawberry&stage=fruiting
```

> 讲解：StrategyContext 根据作物/生长期/环境条件动态选择灌溉、补光、通风策略，避免在控制器中写大量 if-else。

---

### 第五步：命令模式 — 设备指令排队执行与撤销

#### 5.1 添加命令：开启灌溉

```
POST http://localhost:8080/api/commands/add?deviceCode=IRR-001&commandType=OPEN_IRRIGATION&operator=admin
```

#### 5.2 添加命令：启动风机

```
POST http://localhost:8080/api/commands/add?deviceCode=FAN-001&commandType=START_FAN&operator=admin
```

#### 5.3 添加命令：调节补光灯亮度

```
POST http://localhost:8080/api/commands/add?deviceCode=LIGHT-001&commandType=ADJUST_LIGHT&operator=admin&value=80
```

#### 5.4 执行队列中所有命令

```
POST http://localhost:8080/api/commands/execute-all
```

返回示例：
```json
{
  "code": 200,
  "data": {
    "执行结果": [
      "已执行: 开启灌溉(IRR-001)",
      "已执行: 启动风机(FAN-001)",
      "已执行: 调节补光灯(LIGHT-001, 亮度:80)"
    ],
    "说明": "命令模式：队列中所有命令已依次执行，操作日志已写入"
  }
}
```

#### 5.5 撤销上一条已执行的命令

```
POST http://localhost:8080/api/commands/undo-last
```

返回示例：
```json
{
  "code": 200,
  "data": {
    "撤销结果": "已撤销: 调节补光灯(LIGHT-001, 亮度:80)",
    "说明": "命令模式：undo() 会回滚设备状态并写入操作日志"
  }
}
```

> 讲解：设备操作封装为 Command 对象，由 CommandQueueManager（单例）统一管理，支持排队执行和撤销。

---

### 第六步：状态模式 — 设备状态转换（含非法转换演示）

#### 6.1 启动设备：STANDBY → RUNNING

```
POST http://localhost:8080/api/devices/FAN-001/start
```

#### 6.2 再次启动（非法！已在运行）→ 报错

```
POST http://localhost:8080/api/devices/FAN-001/start
```

返回：
```json
{
  "code": 500,
  "message": "设备已在运行中，无需重复启动"
}
```

#### 6.3 标记故障：RUNNING → FAULT

```
POST http://localhost:8080/api/devices/FAN-001/fault
```

#### 6.4 故障状态下尝试启动（非法！）→ 报错

```
POST http://localhost:8080/api/devices/FAN-001/start
```

返回：
```json
{
  "code": 500,
  "message": "设备故障中，无法启动，请先维护"
}
```

#### 6.5 进入维护：FAULT → MAINTENANCE

```
POST http://localhost:8080/api/devices/FAN-001/maintain
```

#### 6.6 维护完成回到待机：MAINTENANCE → STANDBY

```
POST http://localhost:8080/api/devices/FAN-001/start
```

> 讲解：每个状态类（StandbyState/RunningState/FaultState/MaintenanceState/CalibrationState）定义了该状态下允许的操作，非法转换由状态类自身抛出 BusinessException，Service 层无需写 if-else。

---

### 第七步：责任链模式 — 异常事件分级处理

#### 7.1 轻微异常 → 本地控制器处理

```json
POST http://localhost:8080/api/system/events/simulate
Content-Type: application/json

{
  "eventType": "COMM_INTERRUPT",
  "level": "LOW",
  "message": "A区通信模块短暂中断，持续3秒"
}
```

返回：
```json
{
  "code": 200,
  "data": {
    "事件类型": "COMM_INTERRUPT",
    "事件等级": "LOW",
    "是否已处理": true,
    "处理链路": [
      "本地控制器(LocalControllerHandler): 已处理 - 自动重启通信模块"
    ]
  }
}
```

#### 7.2 中等异常 → 区域控制器处理

```json
POST http://localhost:8080/api/system/events/simulate
Content-Type: application/json

{
  "eventType": "SENSOR_OFFLINE",
  "level": "MEDIUM",
  "message": "A区土壤湿度传感器离线"
}
```

#### 7.3 严重异常 → 中央平台处理（保存预警）

```json
POST http://localhost:8080/api/system/events/simulate
Content-Type: application/json

{
  "eventType": "PEST_EXCEEDED",
  "level": "HIGH",
  "message": "A区虫情数量严重超标，检测到大量蚜虫"
}
```

#### 7.4 未知事件 → 兜底到管理员通知

```json
POST http://localhost:8080/api/system/events/simulate
Content-Type: application/json

{
  "eventType": "UNKNOWN_ERROR",
  "level": "INFO",
  "message": "未知类型的异常事件"
}
```

> 讲解：事件按 本地控制器 → 区域控制器 → 中央平台 → 管理员通知 的顺序传递，每个处理器判断自己能否处理，不能处理则传递给下一级。

---

### 第八步：代理模式 — 远程设备权限控制

#### 8.1 admin 执行启动 → 权限通过

```
POST http://localhost:8080/api/devices/remote-control?username=admin&deviceCode=IRR-001&action=START
```

#### 8.2 tech 执行维护 → 权限通过

```
POST http://localhost:8080/api/devices/remote-control?username=tech&deviceCode=IRR-001&action=MAINTAIN
```

#### 8.3 operator 执行维护 → 权限不足！

```
POST http://localhost:8080/api/devices/remote-control?username=operator&deviceCode=IRR-001&action=MAINTAIN
```

返回：
```json
{
  "code": 200,
  "data": {
    "结果": "权限不足，操作被拒绝。当前角色 OPERATOR 只能执行: [START, STOP]"
  }
}
```

#### 8.4 viewer 执行启动 → 权限不足！

```
POST http://localhost:8080/api/devices/remote-control?username=viewer&deviceCode=IRR-001&action=START
```

返回：
```json
{
  "code": 200,
  "data": {
    "结果": "权限不足，操作被拒绝。当前角色 VIEWER 只能执行: []"
  }
}
```

> 讲解：RemoteDeviceServiceProxy 在调用 RealRemoteDeviceService 之前进行权限校验，ADMIN 全权限，TECHNICIAN 可启动/停止/维护/校准，OPERATOR 只能启动/停止，VIEWER 无控制权限。

---

### 第九步：装饰器模式 — 动态增强设备功能

```
GET http://localhost:8080/api/devices/decorator-demo/FAN-001
```

返回：
```json
{
  "code": 200,
  "data": {
    "device": "A区通风风机",
    "description": "基础设备 + 能耗监测 + 运行时长统计 + 故障预诊断",
    "result": "设备已运行，本次能耗0.35kWh，累计运行12.5小时，故障风险低",
    "说明": "装饰器模式：在不修改原有设备类的前提下动态增加功能，符合开闭原则"
  }
}
```

> 讲解：BasicSmartDevice 只有基本运行能力，通过 EnergyMonitorDecorator → RuntimeStatisticsDecorator → FaultPredictionDecorator 逐层叠加功能，无需修改原始类。

---

### 第十步：农事任务管理

#### 10.1 创建任务

```json
POST http://localhost:8080/api/tasks
Content-Type: application/json

{
  "taskName": "番茄开花期施肥",
  "taskType": "施肥",
  "assignee": "张三",
  "remark": "追施磷钾肥，促进花芽分化"
}
```

#### 10.2 查询全部任务

```
GET http://localhost:8080/api/tasks
```

#### 10.3 分配任务

```
PUT http://localhost:8080/api/tasks/1/assign?assignee=李四
```

#### 10.4 完成任务

```
PUT http://localhost:8080/api/tasks/1/finish
```

#### 10.5 智能建议任务

```
GET http://localhost:8080/api/tasks/advice?crop=tomato&stage=flowering
```

返回：
```json
{
  "code": 200,
  "data": [
    { "taskName": "施肥", "taskType": "施肥", "remark": "开花期追施磷钾肥促进花芽分化" },
    { "taskName": "人工授粉检查", "taskType": "授粉", "remark": "检查番茄花粉传播情况" }
  ]
}
```

---

### 第十一步：产量预测与数据统计

#### 11.1 产量预测

```json
POST http://localhost:8080/api/statistics/yield-predict
Content-Type: application/json

{
  "cropName": "番茄",
  "baseYield": 1000,
  "envScore": 0.9,
  "taskScore": 0.85,
  "deviceScore": 0.95
}
```

返回：
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "cropName": "番茄",
    "baseYield": 1000.0,
    "envScore": 0.9,
    "taskScore": 0.85,
    "deviceScore": 0.95,
    "predictedYield": 726.75,
    "createTime": "2026-06-01T15:00:00"
  }
}
```

> 公式：预测产量 = 1000 × 0.9 × 0.85 × 0.95 = 726.75 kg

#### 11.2 环境数据统计

```
GET http://localhost:8080/api/statistics/environment/summary
```

#### 11.3 设备数据统计

```
GET http://localhost:8080/api/statistics/devices/summary
```

#### 11.4 系统总览

```
GET http://localhost:8080/api/statistics/overview
```

---

### 完整演示顺序汇总（建议按此顺序操作）

| 步骤 | 接口 | 演示的设计模式 |
|------|------|--------------|
| 1 | `POST /api/system/init-devices` | 系统初始化 |
| 2 | `POST /api/system/init-users` | 系统初始化 |
| 3 | `GET /api/sensors/collect/soil` | 工厂方法模式 |
| 4 | `POST /api/environment/collect-and-control` | 单例模式 + 观察者模式 |
| 5 | `GET /api/strategy/demo?crop=tomato&stage=seedling` | 策略模式 |
| 6 | `POST /api/commands/add` × 3 → `execute-all` → `undo-last` | 命令模式 |
| 7 | `POST /api/devices/FAN-001/start` → `start`(非法) → `fault` → `start`(非法) → `maintain` → `start` | 状态模式 |
| 8 | `POST /api/system/events/simulate` × 3 | 责任链模式 |
| 9 | `POST /api/devices/remote-control` admin(通过) + viewer(拒绝) | 代理模式 |
| 10 | `GET /api/devices/decorator-demo/FAN-001` | 装饰器模式 |
| 11 | `POST /api/tasks` + `GET /api/tasks/advice` | 业务功能 |
| 12 | `POST /api/statistics/yield-predict` | 业务功能 |
