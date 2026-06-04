// ============================================================
// API 基础配置 + Mock 数据层
// 当后端不可用时自动使用 Mock 数据，确保前端可独立运行
// ============================================================

const API_BASE_URL = 'http://localhost:8080';
const API_TIMEOUT = 3000; // 超时时间，超过则使用Mock

// ============================================================
// Mock 数据存储（支持运行时动态修改）
// ============================================================
const mockStore = {
    // 当前登录用户
    currentUser: null,

    // 用户列表
    users: [
        { id: 1, username: 'admin', password: '123456', role: 'ADMIN', createdAt: '2024-01-15 10:00:00' },
        { id: 2, username: 'tech', password: '123456', role: 'TECHNICIAN', createdAt: '2024-02-20 14:30:00' },
        { id: 3, username: 'operator', password: '123456', role: 'OPERATOR', createdAt: '2024-03-10 09:15:00' },
        { id: 4, username: 'viewer', password: '123456', role: 'VIEWER', createdAt: '2024-04-05 16:45:00' }
    ],

    // 设备列表
    devices: [
        { id: 1, deviceCode: 'DEV-IRR-001', deviceName: '智能灌溉阀-A1', deviceType: '灌溉阀', state: 'RUNNING', online: true, area: 'A区-1号温室' },
        { id: 2, deviceCode: 'DEV-IRR-002', deviceName: '智能灌溉阀-A2', deviceType: '灌溉阀', state: 'STANDBY', online: true, area: 'A区-2号温室' },
        { id: 3, deviceCode: 'DEV-FAN-001', deviceName: '通风风机-B1', deviceType: '通风风扇', state: 'RUNNING', online: true, area: 'B区-1号温室' },
        { id: 4, deviceCode: 'DEV-FAN-002', deviceName: '通风风机-B2', deviceType: '通风风扇', state: 'FAULT', online: false, area: 'B区-2号温室' },
        { id: 5, deviceCode: 'DEV-LIT-001', deviceName: '补光灯-C1', deviceType: '补光灯', state: 'RUNNING', online: true, area: 'C区-育苗区' },
        { id: 6, deviceCode: 'DEV-LIT-002', deviceName: '补光灯-C2', deviceType: '补光灯', state: 'STANDBY', online: true, area: 'C区-花期区' },
        { id: 7, deviceCode: 'DEV-ROL-001', deviceName: '电动卷帘-D1', deviceType: '卷帘', state: 'MAINTENANCE', online: true, area: 'D区-果期区' },
        { id: 8, deviceCode: 'DEV-ROL-002', deviceName: '电动卷帘-D2', deviceType: '卷帘', state: 'STANDBY', online: true, area: 'D区-果期区' },
        { id: 9, deviceCode: 'DEV-HT-001', deviceName: '加热器-E1', deviceType: '加热器', state: 'STANDBY', online: true, area: 'E区-育苗温室' }
    ],

    // 环境数据历史
    environmentHistory: [],

    // 任务列表
    tasks: [
        { id: 1, taskName: 'A区1号温室灌溉', taskType: '灌溉', status: 'TODO', assignee: '张三', createTime: '2024-06-01 08:00:00', finishTime: null, remark: '土壤湿度偏低，需及时灌溉' },
        { id: 2, taskName: 'B区通风检查', taskType: '巡检', status: 'DOING', assignee: '李四', createTime: '2024-06-01 09:30:00', finishTime: null, remark: '检查风机运行状态' },
        { id: 3, taskName: 'C区育苗补光', taskType: '其他', status: 'DONE', assignee: '王五', createTime: '2024-05-30 14:00:00', finishTime: '2024-05-31 18:00:00', remark: '育苗期补光方案执行' },
        { id: 4, taskName: 'D区虫害防治', taskType: '除虫', status: 'TODO', assignee: '赵六', createTime: '2024-06-02 07:00:00', finishTime: null, remark: '发现少量蚜虫，需喷洒生物农药' },
        { id: 5, taskName: '全区施肥作业', taskType: '施肥', status: 'DONE', assignee: '张三', createTime: '2024-05-28 08:00:00', finishTime: '2024-05-29 17:00:00', remark: '有机肥追施' },
        { id: 6, taskName: '番茄采收', taskType: '采收', status: 'DOING', assignee: '李四', createTime: '2024-06-01 06:00:00', finishTime: null, remark: 'D区番茄成熟，安排采收' }
    ],

    // 预警列表
    alerts: [
        { id: 1, alertLevel: 'CRITICAL', alertType: '温度异常', message: 'B区2号温室温度超过38°C，已触发紧急通风', createTime: '2024-06-02 14:30:00', handled: false },
        { id: 2, alertLevel: 'WARNING', alertType: '湿度过低', message: 'A区1号温室土壤湿度低于25%，建议启动灌溉', createTime: '2024-06-02 10:15:00', handled: false },
        { id: 3, alertLevel: 'WARNING', alertType: '设备故障', message: '通风风机-B2运行异常，已自动停机', createTime: '2024-06-02 09:00:00', handled: false },
        { id: 4, alertLevel: 'INFO', alertType: 'CO₂浓度', message: 'C区育苗区CO₂浓度偏高（1200ppm），建议通风', createTime: '2024-06-02 08:45:00', handled: true },
        { id: 5, alertLevel: 'CRITICAL', alertType: '虫情预警', message: 'D区发现蚜虫聚集，密度达到预警阈值', createTime: '2024-06-01 16:20:00', handled: false },
        { id: 6, alertLevel: 'WARNING', alertType: '光照不足', message: 'C区花期区连续3天光照不足，影响开花', createTime: '2024-06-01 11:30:00', handled: true },
        { id: 7, alertLevel: 'INFO', alertType: '系统通知', message: '灌溉阀-A2已完成校准，状态正常', createTime: '2024-06-01 09:00:00', handled: true }
    ],

    // 操作日志
    operationLogs: [
        { id: 1, deviceCode: 'DEV-IRR-001', operationType: '启动', operator: 'admin', result: '灌溉阀已开启，流量2.5L/min', operationTime: '2024-06-02 14:00:00' },
        { id: 2, deviceCode: 'DEV-FAN-001', operationType: '启动', operator: 'tech', result: '风机已启动，转速1200rpm', operationTime: '2024-06-02 13:30:00' },
        { id: 3, deviceCode: 'DEV-FAN-002', operationType: '标记故障', operator: 'tech', result: '设备运行异常，已标记故障', operationTime: '2024-06-02 09:00:00' },
        { id: 4, deviceCode: 'DEV-ROL-001', operationType: '维护', operator: 'admin', result: '进入维护模式，检查电机', operationTime: '2024-06-01 16:00:00' },
        { id: 5, deviceCode: 'DEV-LIT-001', operationType: '启动', operator: 'operator', result: '补光灯已开启，亮度80%', operationTime: '2024-06-01 08:00:00' },
        { id: 6, deviceCode: 'DEV-IRR-001', operationType: '停止', operator: 'admin', result: '灌溉阀已关闭', operationTime: '2024-06-01 18:00:00' },
        { id: 7, deviceCode: 'DEV-IRR-002', operationType: '校准', operator: 'tech', result: '流量传感器校准完成', operationTime: '2024-06-01 10:00:00' },
        { id: 8, deviceCode: 'DEV-LIT-002', operationType: '停止', operator: 'operator', result: '补光灯已关闭', operationTime: '2024-05-31 20:00:00' }
    ],

    // 产量预测历史
    yieldHistory: [
        { id: 1, cropName: '番茄', baseYield: 5000, envScore: 0.88, taskScore: 0.92, deviceScore: 0.95, predictedYield: 3872, createTime: '2024-06-01 10:00:00' },
        { id: 2, cropName: '黄瓜', baseYield: 4000, envScore: 0.82, taskScore: 0.85, deviceScore: 0.90, predictedYield: 2503, createTime: '2024-05-28 14:00:00' },
        { id: 3, cropName: '水稻', baseYield: 8000, envScore: 0.90, taskScore: 0.88, deviceScore: 0.92, predictedYield: 5834, createTime: '2024-05-25 09:00:00' },
        { id: 4, cropName: '辣椒', baseYield: 3000, envScore: 0.75, taskScore: 0.80, deviceScore: 0.88, predictedYield: 1584, createTime: '2024-05-20 11:00:00' }
    ]
};

// 初始化环境历史数据
(function initEnvHistory() {
    const now = new Date();
    for (let i = 0; i < 50; i++) {
        const t = new Date(now - i * 3600000);
        const timeStr = t.getFullYear() + '-' +
            String(t.getMonth() + 1).padStart(2, '0') + '-' +
            String(t.getDate()).padStart(2, '0') + ' ' +
            String(t.getHours()).padStart(2, '0') + ':' +
            String(t.getMinutes()).padStart(2, '0') + ':00';
        mockStore.environmentHistory.push({
            id: i + 1,
            recordTime: timeStr,
            collectTime: timeStr,
            soilHumidity: 45 + Math.random() * 30,
            airTemperature: 22 + Math.random() * 15,
            airHumidity: 50 + Math.random() * 30,
            lightIntensity: 2000 + Math.random() * 6000,
            co2: 400 + Math.random() * 600,
            soilTemperature: 18 + Math.random() * 12
        });
    }
})();

// ============================================================
// Mock 路由处理器
// ============================================================
const mockRoutes = {
    // ---- 认证 ----
    'POST /api/auth/login': (body) => {
        const user = mockStore.users.find(u => u.username === body.username && u.password === body.password);
        if (!user) return { code: 401, message: '用户名或密码错误' };
        mockStore.currentUser = user;
        return { code: 200, data: { token: 'mock-jwt-token-' + user.username, user: { id: user.id, username: user.username, role: user.role } } };
    },
    'POST /api/auth/register': (body) => {
        if (mockStore.users.find(u => u.username === body.username)) {
            return { code: 400, message: '用户名已存在' };
        }
        const newUser = { id: mockStore.users.length + 1, username: body.username, password: body.password, role: body.role || 'VIEWER', createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) };
        mockStore.users.push(newUser);
        return { code: 200, data: { token: 'mock-jwt-token-' + newUser.username, user: { id: newUser.id, username: newUser.username, role: newUser.role } } };
    },
    'POST /api/auth/change-password': (body) => {
        const user = mockStore.users.find(u => u.username === body.username);
        if (!user || user.password !== body.oldPassword) return { code: 400, message: '原密码错误' };
        user.password = body.newPassword;
        return { code: 200, data: '密码修改成功' };
    },

    // ---- 环境数据 ----
    'GET /api/environment/latest': () => {
        const d = mockStore.environmentHistory[0];
        return { code: 200, data: d };
    },
    'GET /api/environment/history': (params) => {
        const page = parseInt(params?.page || 0);
        const size = parseInt(params?.size || 10);
        const start = page * size;
        const content = mockStore.environmentHistory.slice(start, start + size);
        return { code: 200, data: { content, totalElements: mockStore.environmentHistory.length } };
    },
    'GET /api/environment/trend': () => {
        return { code: 200, data: mockStore.environmentHistory.slice(0, 24).reverse() };
    },
    'POST /api/environment/collect-and-control': () => {
        const now = new Date();
        const timeStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':00';
        const newRecord = {
            id: mockStore.environmentHistory.length + 1,
            recordTime: timeStr, collectTime: timeStr,
            soilHumidity: 45 + Math.random() * 30,
            airTemperature: 22 + Math.random() * 15,
            airHumidity: 50 + Math.random() * 30,
            lightIntensity: 2000 + Math.random() * 6000,
            co2: 400 + Math.random() * 600,
            soilTemperature: 18 + Math.random() * 12
        };
        mockStore.environmentHistory.unshift(newRecord);
        return { code: 200, data: newRecord };
    },

    // ---- 设备管理 ----
    'GET /api/devices/list': () => {
        return { code: 200, data: mockStore.devices };
    },
    'POST /api/devices/*/start': (body, url) => {
        const code = url.match(/devices\/(.+?)\/start/)?.[1];
        const device = mockStore.devices.find(d => d.deviceCode === code);
        if (!device) return { code: 404, message: '设备不存在' };
        if (device.state !== 'STANDBY' && device.state !== 'MAINTENANCE') return { code: 400, message: '设备当前状态不允许启动' };
        device.state = 'RUNNING';
        device.online = true;
        return { code: 200, data: device.deviceName + ' 已启动' };
    },
    'POST /api/devices/*/stop': (body, url) => {
        const code = url.match(/devices\/(.+?)\/stop/)?.[1];
        const device = mockStore.devices.find(d => d.deviceCode === code);
        if (!device) return { code: 404, message: '设备不存在' };
        if (device.state !== 'RUNNING') return { code: 400, message: '设备当前状态不允许停止' };
        device.state = 'STANDBY';
        return { code: 200, data: device.deviceName + ' 已停止' };
    },
    'POST /api/devices/*/fault': (body, url) => {
        const code = url.match(/devices\/(.+?)\/fault/)?.[1];
        const device = mockStore.devices.find(d => d.deviceCode === code);
        if (!device) return { code: 404, message: '设备不存在' };
        device.state = 'FAULT';
        device.online = false;
        return { code: 200, data: device.deviceName + ' 已标记故障' };
    },
    'POST /api/devices/*/maintain': (body, url) => {
        const code = url.match(/devices\/(.+?)\/maintain/)?.[1];
        const device = mockStore.devices.find(d => d.deviceCode === code);
        if (!device) return { code: 404, message: '设备不存在' };
        device.state = 'MAINTENANCE';
        return { code: 200, data: device.deviceName + ' 已进入维护模式' };
    },
    'POST /api/devices/*/calibrate': (body, url) => {
        const code = url.match(/devices\/(.+?)\/calibrate/)?.[1];
        const device = mockStore.devices.find(d => d.deviceCode === code);
        if (!device) return { code: 404, message: '设备不存在' };
        device.state = 'STANDBY';
        return { code: 200, data: device.deviceName + ' 校准完成' };
    },
    'POST /api/devices': (body) => {
        if (mockStore.devices.find(d => d.deviceCode === body.deviceCode)) {
            return { code: 400, message: '设备编号已存在' };
        }
        const device = {
            id: mockStore.devices.length + 1,
            deviceCode: body.deviceCode,
            deviceName: body.deviceName,
            deviceType: body.deviceType,
            area: body.area || '',
            state: body.state || 'STANDBY',
            online: body.online !== false
        };
        mockStore.devices.unshift(device);
        return { code: 200, data: device };
    },
    'PUT /api/devices/*': (body, url) => {
        const code = url.match(/devices\/(.+)/)?.[1];
        const device = mockStore.devices.find(d => d.deviceCode === code);
        if (!device) return { code: 404, message: '设备不存在' };
        Object.assign(device, body, { deviceCode: code });
        return { code: 200, data: device };
    },
    'DELETE /api/devices/*': (body, url) => {
        const code = url.match(/devices\/(.+)/)?.[1];
        mockStore.devices = mockStore.devices.filter(d => d.deviceCode !== code);
        return { code: 200, data: '删除成功' };
    },
    'POST /api/devices/remote-control': (body, url, params) => {
        const username = params?.username || 'viewer';
        const allowed = ['admin', 'tech', 'operator'].includes(username);
        return { code: 200, data: {
            username,
            deviceCode: params?.deviceCode,
            action: params?.action,
            result: allowed ? '代理校验通过，远程控制已执行' : '代理校验失败，当前用户无远程控制权限',
            description: 'RemoteDeviceServiceProxy 在调用真实服务前进行权限验证和日志审计'
        } };
    },
    'GET /api/devices/decorator-demo/*': (params, url) => {
        const code = url.match(/decorator-demo\/(.+)/)?.[1];
        const device = mockStore.devices.find(d => d.deviceCode === code) || mockStore.devices[0];
        return { code: 200, data: {
            pattern: 'Decorator',
            device: device?.deviceName || code,
            description: 'BasicSmartDevice + EnergyMonitorDecorator + RuntimeStatisticsDecorator + FaultPredictionDecorator',
            result: '能耗 0.42kWh，累计运行 36.5 小时，故障风险低'
        } };
    },

    // ---- 设计模式演示 ----
    'GET /api/sensors/collect/*': (params, url) => {
        const type = url.match(/collect\/(.+)/)?.[1] || 'soil';
        return { code: 200, data: {
            sensorType: type,
            soilTemperature: 22 + Math.random() * 4,
            soilHumidity: 45 + Math.random() * 25,
            airTemperature: 24 + Math.random() * 8,
            airHumidity: 55 + Math.random() * 20,
            lightIntensity: 3000 + Math.random() * 4000,
            co2: 420 + Math.random() * 300,
            pestCount: Math.floor(Math.random() * 30)
        } };
    },
    'GET /api/sensors/actuator-demo/*': (params, url) => {
        const type = url.match(/actuator-demo\/(.+)/)?.[1] || 'irrigation';
        return { code: 200, data: { pattern: 'Factory Method', factory: 'ActuatorFactory', type, action: params?.action || 'START', message: '执行器已通过工厂创建并执行动作' } };
    },
    'GET /api/strategy/demo': (params) => {
        const irrigation = params?.crop === 'cucumber' ? '喷灌策略' : params?.crop === 'strawberry' ? '微喷策略' : '滴灌策略';
        const lighting = params?.stage === 'flowering' ? '花期补光策略' : params?.stage === 'fruiting' ? '果期补光策略' : '育苗补光策略';
        const ventilation = params?.condition === 'high_temp' ? '强制通风策略' : params?.condition === 'high_humidity' ? '循环通风策略' : '自然通风策略';
        return { code: 200, data: { 作物: params?.crop, 生长阶段: params?.stage, 环境条件: params?.condition || 'normal', 灌溉策略: irrigation, 补光策略: lighting, 通风策略: ventilation } };
    },
    'POST /api/commands/add': (body, url, params) => {
        mockStore.commandQueue = mockStore.commandQueue || [];
        mockStore.commandQueue.push(params?.commandType || 'OPEN_IRRIGATION');
        return { code: 200, data: { addedCommand: params?.commandType, queueSize: mockStore.commandQueue.length } };
    },
    'POST /api/commands/execute-all': () => {
        const executed = mockStore.commandQueue || [];
        mockStore.executedCommands = (mockStore.executedCommands || []).concat(executed);
        mockStore.commandQueue = [];
        return { code: 200, data: { executedResults: executed.map(c => '已执行 ' + c), description: '命令队列已依次执行' } };
    },
    'POST /api/commands/undo-last': () => {
        mockStore.executedCommands = mockStore.executedCommands || [];
        const last = mockStore.executedCommands.pop();
        return { code: 200, data: { undoResult: last ? '已撤销 ' + last : '无可撤销命令' } };
    },
    'GET /api/commands/queue-status': () => {
        return { code: 200, data: { queueSize: (mockStore.commandQueue || []).length, pattern: 'Singleton + Command' } };
    },

    // ---- 统计数据 ----
    'GET /api/statistics/overview': () => {
        return {
            code: 200, data: {
                deviceTotal: mockStore.devices.length,
                deviceRunning: mockStore.devices.filter(d => d.state === 'RUNNING').length,
                deviceFault: mockStore.devices.filter(d => d.state === 'FAULT').length,
                todayOperations: mockStore.operationLogs.length,
                pendingAlerts: mockStore.alerts.filter(a => !a.handled).length
            }
        };
    },
    'GET /api/statistics/devices/distribution': () => {
        const dist = {};
        mockStore.devices.forEach(d => { dist[d.state] = (dist[d.state] || 0) + 1; });
        return { code: 200, data: dist };
    },
    'GET /api/statistics/operations/summary': () => {
        const summary = {};
        mockStore.operationLogs.forEach(l => { summary[l.operationType] = (summary[l.operationType] || 0) + 1; });
        return { code: 200, data: summary };
    },
    'GET /api/statistics/environment/summary': () => {
        const h = mockStore.environmentHistory;
        const n = h.length || 1;
        return {
            code: 200, data: {
                '平均土壤湿度(%)': (h.reduce((s, r) => s + r.soilHumidity, 0) / n).toFixed(1),
                '平均空气温度(°C)': (h.reduce((s, r) => s + r.airTemperature, 0) / n).toFixed(1),
                '平均光照强度(lux)': (h.reduce((s, r) => s + r.lightIntensity, 0) / n).toFixed(0),
                '平均CO₂(ppm)': (h.reduce((s, r) => s + r.co2, 0) / n).toFixed(0)
            }
        };
    },
    'GET /api/statistics/logs': (params) => {
        const page = parseInt(params?.page || 0);
        const size = parseInt(params?.size || 10);
        const deviceCode = params?.deviceCode;
        let logs = mockStore.operationLogs;
        if (deviceCode) logs = logs.filter(l => l.deviceCode.includes(deviceCode));
        const start = page * size;
        return { code: 200, data: { content: logs.slice(start, start + size), totalElements: logs.length } };
    },
    'POST /api/statistics/yield-predict': (body) => {
        const result = {
            id: mockStore.yieldHistory.length + 1,
            cropName: body.cropName,
            baseYield: body.baseYield,
            envScore: body.envScore,
            taskScore: body.taskScore,
            deviceScore: body.deviceScore,
            predictedYield: Math.round(body.baseYield * body.envScore * body.taskScore * body.deviceScore),
            createTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        mockStore.yieldHistory.unshift(result);
        return { code: 200, data: result };
    },
    'GET /api/statistics/yield-predict/history': (params) => {
        const page = parseInt(params?.page || 0);
        const size = parseInt(params?.size || 10);
        const start = page * size;
        return { code: 200, data: { content: mockStore.yieldHistory.slice(start, start + size), totalElements: mockStore.yieldHistory.length } };
    },

    // ---- 任务管理 ----
    'GET /api/tasks': () => {
        return { code: 200, data: mockStore.tasks };
    },
    'POST /api/tasks': (body) => {
        const newTask = {
            id: mockStore.tasks.length + 1,
            taskName: body.taskName,
            taskType: body.taskType,
            status: 'TODO',
            assignee: body.assignee || '未分配',
            createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
            finishTime: null,
            remark: body.remark || ''
        };
        mockStore.tasks.unshift(newTask);
        return { code: 200, data: newTask };
    },
    'PUT /api/tasks/*/start': (body, url) => {
        const id = parseInt(url.match(/tasks\/(\d+)\/start/)?.[1]);
        const task = mockStore.tasks.find(t => t.id === id);
        if (task) task.status = 'DOING';
        return { code: 200, data: '任务已开始' };
    },
    'PUT /api/tasks/*/finish': (body, url) => {
        const id = parseInt(url.match(/tasks\/(\d+)\/finish/)?.[1]);
        const task = mockStore.tasks.find(t => t.id === id);
        if (task) { task.status = 'DONE'; task.finishTime = new Date().toISOString().replace('T', ' ').substring(0, 19); }
        return { code: 200, data: '任务已完成' };
    },
    'PUT /api/tasks/*/cancel': (body, url) => {
        const id = parseInt(url.match(/tasks\/(\d+)\/cancel/)?.[1]);
        const task = mockStore.tasks.find(t => t.id === id);
        if (task) task.status = 'CANCELLED';
        return { code: 200, data: '任务已取消' };
    },
    'DELETE /api/tasks/*': (body, url) => {
        const id = parseInt(url.match(/tasks\/(\d+)/)?.[1]);
        mockStore.tasks = mockStore.tasks.filter(t => t.id !== id);
        return { code: 200, data: '删除成功' };
    },

    // ---- 预警管理 ----
    'GET /api/alerts': () => {
        return { code: 200, data: mockStore.alerts };
    },
    'GET /api/alerts/stats': () => {
        return {
            code: 200, data: {
                critical: mockStore.alerts.filter(a => a.alertLevel === 'CRITICAL' && !a.handled).length,
                warning: mockStore.alerts.filter(a => a.alertLevel === 'WARNING' && !a.handled).length,
                info: mockStore.alerts.filter(a => a.alertLevel === 'INFO' && !a.handled).length,
                resolved: mockStore.alerts.filter(a => a.handled).length
            }
        };
    },
    'PUT /api/alerts/*/handle': (body, url) => {
        const id = parseInt(url.match(/alerts\/(\d+)\/handle/)?.[1]);
        const alert = mockStore.alerts.find(a => a.id === id);
        if (alert) alert.handled = true;
        return { code: 200, data: '预警已处理' };
    },

    // ---- 用户管理 ----
    'GET /api/users/list': () => {
        return { code: 200, data: mockStore.users.map(u => ({ id: u.id, username: u.username, role: u.role, createdAt: u.createdAt })) };
    },
    'PUT /api/users/*': (body, url) => {
        const username = url.match(/users\/(.+)/)?.[1];
        const user = mockStore.users.find(u => u.username === username);
        if (user) user.role = body.role;
        return { code: 200, data: '修改成功' };
    },
    'DELETE /api/users/*': (body, url) => {
        const username = url.match(/users\/(.+)/)?.[1];
        mockStore.users = mockStore.users.filter(u => u.username !== username);
        return { code: 200, data: '删除成功' };
    },

    // ---- 系统 ----
    'GET /api/system/health': () => {
        return { code: 200, data: { status: 'UP', mode: 'mock', timestamp: Date.now() } };
    },
    'GET /api/system/singletons': () => {
        return { code: 200, data: {
            ConfigCenter: { soilHumidityMin: 40, lightIntensityMin: 300, co2Max: 1000, airTemperatureMax: 32, pestCountMax: 20 },
            CommandQueueManager: { queueSize: (mockStore.commandQueue || []).length },
            LogRecorder: { recentLogs: ['Create device DEMO-001', 'Command queued OPEN_IRRIGATION', 'Observer notified IrrigationObserver'] },
            description: 'ConfigCenter、LogRecorder、CommandQueueManager 均采用单例模式'
        } };
    },
    'POST /api/system/events/simulate': (body) => {
        return { code: 200, data: {
            eventType: body?.eventType || 'DEVICE_FAULT',
            level: body?.level || 'HIGH',
            message: body?.message || '模拟异常事件',
            handled: true,
            processLog: ['LocalControllerHandler 已检查', 'RegionControllerHandler 已升级', 'CentralPlatformHandler 已生成预警', 'AdminNotifyHandler 已通知管理员']
        } };
    },
    'POST /api/rag/search': (body) => {
        return { code: 200, data: {
            query: body?.query || '',
            topK: body?.topK || 5,
            warning: '当前使用前端 Mock RAG，仅用于后端不可用时演示页面流程。',
            results: [
                {
                    chunkId: 'mock_agri_001_0001',
                    articleId: 'mock_agri_001',
                    source: 'agri_cn',
                    title: '小麦赤霉病防控技术',
                    sourceUrl: 'https://www.agri.cn/',
                    category: '病虫害防治',
                    publishDate: '2026-05-01',
                    score: 0.86,
                    chunkText: '小麦赤霉病在高温高湿条件下风险升高，应结合墒情适量灌溉，加强田间巡查和综合防控。',
                    entities: ['小麦', '赤霉病', '高温高湿']
                }
            ]
        } };
    },
    'POST /api/rag/hybrid-search': (body) => {
        return { code: 200, data: {
            query: body?.query || '',
            ragResults: [],
            kgEvidence: [{ source: '高温高湿', relation: 'INCREASES_RISK_OF', target: '赤霉病' }]
        } };
    },
    'POST /api/agent/decision': (body) => {
        return { code: 200, data: {
            riskLevel: '中高风险',
            summary: '当前土壤湿度偏低，同时高温高湿可能增加小麦病害风险，建议适量灌溉并加强巡查。',
            agentSteps: [
                { agentName: '环境监测Agent', result: '土壤湿度18%，低于适宜范围，当前温度31℃、湿度82%，需要关注缺水和病害风险。' },
                { agentName: '病虫害Agent', result: '根据知识图谱，高温高湿条件可能增加小麦赤霉病等病害风险。' },
                { agentName: '农技知识Agent', result: '检索到相关农技资料，建议结合墒情适量灌溉，并加强病虫害巡查。' },
                { agentName: '农药安全Agent', result: '当前系统未检索到可靠登记信息，不生成具体药剂建议。' },
                { agentName: '综合决策Agent', result: '建议适量灌溉、加强通风、加强病虫害巡查。' }
            ],
            suggestions: ['适量灌溉', '加强田间通风', '加强病虫害巡查', '用药前核对农药登记信息'],
            ragEvidence: [
                { title: '小麦赤霉病防控技术', source: 'agri_cn', sourceUrl: 'https://www.agri.cn/', score: 0.86, chunkText: '小麦赤霉病在高温高湿条件下风险升高，应结合墒情适量灌溉，加强田间巡查。' }
            ],
            kgEvidence: [{ source: '高温高湿', relation: 'INCREASES_RISK_OF', target: '赤霉病' }],
            pesticideSafetyNotice: '具体药剂、浓度、施用次数和安全间隔期应以农药标签、登记信息和当地农技部门指导为准。'
        } };
    },
    'POST /api/system/init-devices': () => {
        return { code: 200, data: '设备初始化完成' };
    },
    'POST /api/system/init-users': () => {
        return { code: 200, data: '用户初始化完成' };
    }
};

// ============================================================
// Mock 路由匹配器
// ============================================================
function matchMockRoute(method, url) {
    // 精确匹配
    const exactKey = method + ' ' + url;
    if (mockRoutes[exactKey]) return mockRoutes[exactKey];

    // 通配符匹配
    for (const [pattern, handler] of Object.entries(mockRoutes)) {
        const [pMethod, pPath] = pattern.split(' ');
        if (pMethod !== method) continue;

        // 将路径模式转为正则
        const regex = new RegExp('^' + pPath.replace(/\*/g, '[^/]+') + '$');
        if (regex.test(url)) return handler;
    }
    return null;
}

// ============================================================
// 全局 fetch 拦截：后端不可用时自动使用 Mock
// ============================================================
const originalFetch = window.fetch;
window.fetch = async function(url, options = {}) {
    const urlStr = typeof url === 'string' ? url : url.url || '';
    const method = (options.method || 'GET').toUpperCase();

    // 提取相对路径
    let relativePath = urlStr;
    try {
        const u = new URL(urlStr);
        relativePath = u.pathname + u.search;
    } catch { /* 非完整URL，直接使用 */ }

    // 提取查询参数
    const [pathname, search] = relativePath.split('?');
    const params = {};
    if (search) {
        search.split('&').forEach(p => {
            const [k, v] = p.split('=');
            params[decodeURIComponent(k)] = decodeURIComponent(v || '');
        });
    }

    // 解析请求体
    let body = null;
    if (options.body) {
        try { body = JSON.parse(options.body); } catch { body = options.body; }
    }

    try {
        // 先尝试真实 API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
        const response = await originalFetch.call(this, url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (e) {
        // 后端不可用，使用 Mock
        const handler = matchMockRoute(method, pathname);
        if (handler) {
            console.log('%c[Mock] ' + method + ' ' + pathname, 'color: #e6a23c; font-weight: bold;');
            const result = handler(body, pathname, params);
            return new Response(JSON.stringify(result), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 无匹配的 Mock 路由
        console.warn('%c[Mock] 未匹配: ' + method + ' ' + pathname, 'color: #f56c6c;');
        return new Response(JSON.stringify({ code: 200, data: null }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// ============================================================
// 创建 axios 实例（供 api.js 内部使用）
// ============================================================
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: { 'Content-Type': 'application/json' }
});

// 请求拦截器：自动携带 JWT Token
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    error => Promise.reject(error)
);

api.interceptors.response.use(
    response => {
        const { data } = response;
        if (data.code === 200) return data.data;
        return Promise.reject(new Error(data.message || '请求失败'));
    },
    error => {
        console.error('API Error:', error);
        // 401/403 时跳转登录页
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.hash !== '#/login') {
                window.location.hash = '#/login';
            }
        }
        return Promise.reject(error);
    }
);

// ============================================================
// 导出 API 工具（保持兼容）
// ============================================================
const deviceApi = {
    getList: () => api.get('/api/devices/list'),
    getByCode: (code) => api.get('/api/devices/' + code),
    create: (device) => api.post('/api/devices', device),
    update: (code, device) => api.put('/api/devices/' + code, device),
    delete: (code) => api.delete('/api/devices/' + code),
    start: (code) => api.post('/api/devices/' + code + '/start'),
    stop: (code) => api.post('/api/devices/' + code + '/stop'),
    markFault: (code) => api.post('/api/devices/' + code + '/fault'),
    maintain: (code) => api.post('/api/devices/' + code + '/maintain'),
    calibrate: (code) => api.post('/api/devices/' + code + '/calibrate'),
    remoteControl: (username, deviceCode, action) =>
        api.post('/api/devices/remote-control?username=' + username + '&deviceCode=' + deviceCode + '&action=' + action),
    decoratorDemo: (code) => api.get('/api/devices/decorator-demo/' + code)
};

const environmentApi = {
    collect: () => api.post('/api/environment/collect'),
    collectAndControl: () => api.post('/api/environment/collect-and-control'),
    getLatest: () => api.get('/api/environment/latest'),
    getList: () => api.get('/api/environment/list')
};

const statisticsApi = {
    getOverview: () => api.get('/api/statistics/overview'),
    predictYield: (data) => api.post('/api/statistics/yield-predict', data),
    getEnvironmentSummary: () => api.get('/api/statistics/environment/summary'),
    getDeviceSummary: () => api.get('/api/statistics/devices/summary')
};

const systemApi = {
    initDevices: () => api.post('/api/system/init-devices'),
    initUsers: () => api.post('/api/system/init-users'),
    health: () => api.get('/api/system/health'),
    singletons: () => api.get('/api/system/singletons'),
    simulateEvent: (event) => api.post('/api/system/events/simulate', event)
};

const taskApi = {
    getList: () => api.get('/api/tasks'),
    create: (task) => api.post('/api/tasks', task),
    complete: (id) => api.post('/api/tasks/' + id + '/complete')
};

const commandApi = {
    add: (params) => api.post('/api/commands/add', null, { params }),
    executeAll: () => api.post('/api/commands/execute-all'),
    undoLast: () => api.post('/api/commands/undo-last'),
    getQueueStatus: () => api.get('/api/commands/queue-status')
};

const strategyApi = {
    demo: (params) => api.get('/api/strategy/demo', { params }),
    executeIrrigation: (data) => api.post('/api/strategies/irrigation', data),
    executeVentilation: (data) => api.post('/api/strategies/ventilation', data),
    executeLighting: (data) => api.post('/api/strategies/lighting', data)
};

const sensorApi = {
    collect: (type) => api.get('/api/sensors/collect/' + type),
    actuatorDemo: (type, action = 'START') => api.get('/api/sensors/actuator-demo/' + type + '?action=' + action)
};

const knowledgeGraphApi = {
    overview: () => api.get('/api/knowledge-graph/overview'),
    search: (params) => api.get('/api/knowledge-graph/search', { params }),
    rebuild: () => api.post('/api/knowledge-graph/rebuild')
};
window.knowledgeGraphApi = knowledgeGraphApi;

const weatherApi = {
    current: (params) => api.get('/api/weather/current', { params }),
    forecast: (params) => api.get('/api/weather/forecast', { params }),
    history: (params) => api.get('/api/weather/history', { params }),
    decisionInput: (params) => api.get('/api/weather/decision-input', { params })
};
window.weatherApi = weatherApi;

const ragApi = {
    search: (data) => api.post('/api/rag/search', data),
    hybridSearch: (data) => api.post('/api/rag/hybrid-search', data)
};

const agentDecisionApi = {
    decision: (data) => api.post('/api/agent/decision', data)
};

window.deviceApi = deviceApi;
window.environmentApi = environmentApi;
window.statisticsApi = statisticsApi;
window.systemApi = systemApi;
window.commandApi = commandApi;
window.strategyApi = strategyApi;
window.sensorApi = sensorApi;
window.ragApi = ragApi;
window.agentDecisionApi = agentDecisionApi;

// 导出 Mock 存储，供调试使用
window.mockStore = mockStore;
