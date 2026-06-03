// API 基础配置
const API_BASE_URL = 'http://localhost:8080';

// 创建 axios 实例
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 响应拦截器
api.interceptors.response.use(
    response => {
        const { data } = response;
        if (data.code === 200) {
            return data.data;
        }
        return Promise.reject(new Error(data.message || '请求失败'));
    },
    error => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

// 设备管理 API
const deviceApi = {
    // 获取设备列表
    getList: () => api.get('/api/devices/list'),

    // 根据编号获取设备
    getByCode: (code) => api.get(`/api/devices/${code}`),

    // 启动设备
    start: (code) => api.post(`/api/devices/${code}/start`),

    // 停止设备
    stop: (code) => api.post(`/api/devices/${code}/stop`),

    // 标记故障
    markFault: (code) => api.post(`/api/devices/${code}/fault`),

    // 维护设备
    maintain: (code) => api.post(`/api/devices/${code}/maintain`),

    // 校准设备
    calibrate: (code) => api.post(`/api/devices/${code}/calibrate`),

    // 远程控制
    remoteControl: (username, deviceCode, action) =>
        api.post(`/api/devices/remote-control?username=${username}&deviceCode=${deviceCode}&action=${action}`),

    // 装饰器演示
    decoratorDemo: (code) => api.get(`/api/devices/decorator-demo/${code}`)
};

// 环境数据 API
const environmentApi = {
    // 采集环境数据
    collect: () => api.post('/api/environment/collect'),

    // 采集并自动控制
    collectAndControl: () => api.post('/api/environment/collect-and-control'),

    // 获取最新数据
    getLatest: () => api.get('/api/environment/latest'),

    // 获取所有数据
    getList: () => api.get('/api/environment/list')
};

// 统计数据 API
const statisticsApi = {
    // 系统总览
    getOverview: () => api.get('/api/statistics/overview'),

    // 产量预测
    predictYield: (data) => api.post('/api/statistics/yield-predict', data),

    // 环境统计
    getEnvironmentSummary: () => api.get('/api/statistics/environment/summary'),

    // 设备统计
    getDeviceSummary: () => api.get('/api/statistics/devices/summary')
};

// 系统管理 API
const systemApi = {
    // 初始化设备
    initDevices: () => api.post('/api/system/init-devices'),

    // 初始化用户
    initUsers: () => api.post('/api/system/init-users'),

    // 健康检查
    health: () => api.get('/api/system/health'),

    // 模拟事件
    simulateEvent: (event) => api.post('/api/system/events/simulate', event)
};

// 农事任务 API
const taskApi = {
    // 获取任务列表
    getList: () => api.get('/api/tasks/list'),

    // 创建任务
    create: (task) => api.post('/api/tasks', task),

    // 完成任务
    complete: (id) => api.post(`/api/tasks/${id}/complete`)
};

// 命令队列 API
const commandApi = {
    // 发送命令
    send: (command) => api.post('/api/commands/send', command),

    // 获取队列状态
    getQueueStatus: () => api.get('/api/commands/queue-status')
};

// 策略 API
const strategyApi = {
    // 灌溉策略
    executeIrrigation: (data) => api.post('/api/strategies/irrigation', data),

    // 通风策略
    executeVentilation: (data) => api.post('/api/strategies/ventilation', data),

    // 补光策略
    executeLighting: (data) => api.post('/api/strategies/lighting', data)
};
