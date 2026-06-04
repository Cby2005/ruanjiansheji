const ProjectDivision = {
    template: `
        <div class="project-division-page">
            <el-alert
                title="本页用于答辩验收：除 RAG、知识图谱、智能体由组长单独负责外，其余功能按成员 A-D 的分工对应到前端页面和后端接口。"
                type="success"
                :closable="false"
                show-icon
                style="margin-bottom: 16px;">
            </el-alert>

            <el-row :gutter="16" style="margin-bottom: 16px;">
                <el-col v-for="member in members" :key="member.name" :xs="24" :sm="12" :lg="8" style="margin-bottom: 16px;">
                    <el-card shadow="never" class="division-card">
                        <template #header>
                            <div class="division-card-header">
                                <span>{{ member.name }}</span>
                                <el-tag :type="member.type" size="small">{{ member.percent }}</el-tag>
                            </div>
                        </template>
                        <div class="division-duty">{{ member.duty }}</div>
                        <div class="division-subtitle">对应页面</div>
                        <div>
                            <el-button
                                v-for="page in member.pages"
                                :key="page.path"
                                size="small"
                                plain
                                style="margin: 0 6px 6px 0;"
                                @click="$router.push(page.path)">
                                {{ page.name }}
                            </el-button>
                        </div>
                        <div class="division-subtitle">设计模式/模块</div>
                        <el-tag v-for="tag in member.patterns" :key="tag" style="margin: 0 6px 6px 0;">{{ tag }}</el-tag>
                    </el-card>
                </el-col>
            </el-row>

            <el-row :gutter="16" style="margin-bottom: 16px;">
                <el-col :xs="24" :lg="12">
                    <el-card shadow="never" class="division-card">
                        <template #header>
                            <div class="division-card-header">
                                <span>成员 B：工厂方法 + 观察者演示</span>
                                <el-tag size="small">后端基础接口</el-tag>
                            </div>
                        </template>
                        <el-row :gutter="12">
                            <el-col :span="12">
                                <el-form label-position="top" size="small">
                                    <el-form-item label="传感器类型">
                                        <el-select v-model="sensorType" style="width: 100%;">
                                            <el-option label="土壤传感器 soil" value="soil"></el-option>
                                            <el-option label="光照传感器 light" value="light"></el-option>
                                            <el-option label="气象站 weather" value="weather"></el-option>
                                            <el-option label="虫情传感器 pest" value="pest"></el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-button type="primary" :loading="sensorLoading" @click="collectSensor">
                                        <i class="fas fa-microchip" style="margin-right: 6px;"></i>工厂创建并采集
                                    </el-button>
                                </el-form>
                            </el-col>
                            <el-col :span="12">
                                <el-form label-position="top" size="small">
                                    <el-form-item label="观察者联动">
                                        <div style="color: #606266; line-height: 1.7;">采集环境数据后自动通知灌溉、补光、通风、虫情预警观察者。</div>
                                    </el-form-item>
                                    <el-button type="success" :loading="observerLoading" @click="collectAndControl">
                                        <i class="fas fa-bell" style="margin-right: 6px;"></i>采集并触发联动
                                    </el-button>
                                </el-form>
                            </el-col>
                        </el-row>
                        <el-descriptions :column="2" border size="small" style="margin-top: 12px;">
                            <el-descriptions-item v-for="item in sensorSummary" :key="item.label" :label="item.label">{{ item.value }}</el-descriptions-item>
                        </el-descriptions>
                    </el-card>
                </el-col>

                <el-col :xs="24" :lg="12">
                    <el-card shadow="never" class="division-card">
                        <template #header>
                            <div class="division-card-header">
                                <span>成员 C：策略模式 + 状态模式演示</span>
                                <el-tag size="small" type="warning">智能控制</el-tag>
                            </div>
                        </template>
                        <el-form :inline="true" size="small">
                            <el-form-item label="作物">
                                <el-select v-model="strategyForm.crop" style="width: 120px;">
                                    <el-option label="番茄" value="tomato"></el-option>
                                    <el-option label="黄瓜" value="cucumber"></el-option>
                                    <el-option label="草莓" value="strawberry"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="阶段">
                                <el-select v-model="strategyForm.stage" style="width: 120px;">
                                    <el-option label="苗期" value="seedling"></el-option>
                                    <el-option label="开花期" value="flowering"></el-option>
                                    <el-option label="结果期" value="fruiting"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="条件">
                                <el-select v-model="strategyForm.condition" clearable style="width: 130px;">
                                    <el-option label="高温" value="high_temp"></el-option>
                                    <el-option label="高湿" value="high_humidity"></el-option>
                                    <el-option label="低光照" value="low_light"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" :loading="strategyLoading" @click="runStrategy">选择策略</el-button>
                            </el-form-item>
                        </el-form>
                        <el-descriptions :column="1" border size="small">
                            <el-descriptions-item v-for="item in strategySummary" :key="item.label" :label="item.label">{{ item.value }}</el-descriptions-item>
                        </el-descriptions>
                        <div class="division-subtitle">设备状态转换</div>
                        <el-steps :active="2" simple>
                            <el-step title="待机"></el-step>
                            <el-step title="运行"></el-step>
                            <el-step title="故障/维护/校准"></el-step>
                        </el-steps>
                    </el-card>
                </el-col>
            </el-row>

            <el-row :gutter="16">
                <el-col :xs="24" :lg="12">
                    <el-card shadow="never" class="division-card">
                        <template #header>
                            <div class="division-card-header">
                                <span>成员 D：命令模式 + 代理模式 + 装饰器演示</span>
                                <el-tag size="small" type="danger">设备扩展</el-tag>
                            </div>
                        </template>
                        <el-form :inline="true" size="small">
                            <el-form-item label="设备">
                                <el-input v-model="deviceCode" style="width: 130px;"></el-input>
                            </el-form-item>
                            <el-form-item label="命令">
                                <el-select v-model="commandType" style="width: 170px;">
                                    <el-option label="开启灌溉" value="OPEN_IRRIGATION"></el-option>
                                    <el-option label="关闭灌溉" value="CLOSE_IRRIGATION"></el-option>
                                    <el-option label="启动风机" value="START_FAN"></el-option>
                                    <el-option label="停止风机" value="STOP_FAN"></el-option>
                                    <el-option label="调节补光" value="ADJUST_LIGHT"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-button :loading="commandLoading" @click="addCommand">加入命令队列</el-button>
                                <el-button type="primary" :loading="commandLoading" @click="executeCommands">执行队列</el-button>
                                <el-button type="warning" :loading="commandLoading" @click="undoCommand">撤销</el-button>
                            </el-form-item>
                        </el-form>
                        <el-form :inline="true" size="small">
                            <el-form-item label="远程用户">
                                <el-select v-model="remoteUser" style="width: 120px;">
                                    <el-option label="admin" value="admin"></el-option>
                                    <el-option label="tech" value="tech"></el-option>
                                    <el-option label="operator" value="operator"></el-option>
                                    <el-option label="viewer" value="viewer"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="success" :loading="proxyLoading" @click="remoteControl">代理远程控制</el-button>
                                <el-button type="info" :loading="decoratorLoading" @click="decoratorDemo">装饰器增强</el-button>
                            </el-form-item>
                        </el-form>
                        <el-input type="textarea" :rows="7" readonly :model-value="deviceDemoLog"></el-input>
                    </el-card>
                </el-col>

                <el-col :xs="24" :lg="12">
                    <el-card shadow="never" class="division-card">
                        <template #header>
                            <div class="division-card-header">
                                <span>页面与成员分工对应表</span>
                                <el-tag size="small" type="success">前端体现</el-tag>
                            </div>
                        </template>
                        <el-table :data="pageMappings" border size="small" height="365">
                            <el-table-column prop="page" label="前端页面" width="130"></el-table-column>
                            <el-table-column prop="owner" label="对应成员" width="110"></el-table-column>
                            <el-table-column prop="feature" label="体现的项目功能"></el-table-column>
                            <el-table-column label="入口" width="90">
                                <template #default="{ row }">
                                    <el-button size="small" link type="primary" @click="$router.push(row.path)">查看</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    `,

    setup() {
        const API_BASE_URL = 'http://localhost:8080';
        const sensorType = Vue.ref('soil');
        const sensorLoading = Vue.ref(false);
        const observerLoading = Vue.ref(false);
        const strategyLoading = Vue.ref(false);
        const commandLoading = Vue.ref(false);
        const proxyLoading = Vue.ref(false);
        const decoratorLoading = Vue.ref(false);
        const sensorResult = Vue.ref({});
        const observerResult = Vue.ref({});
        const strategyResult = Vue.ref({});
        const deviceDemoLog = Vue.ref('等待执行命令、代理或装饰器演示。');
        const deviceCode = Vue.ref('IRR-001');
        const commandType = Vue.ref('OPEN_IRRIGATION');
        const remoteUser = Vue.ref('admin');
        const strategyForm = Vue.reactive({ crop: 'tomato', stage: 'seedling', condition: 'high_temp' });

        const headers = () => ({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
        });

        const members = [
            {
                name: '组长 / 你',
                percent: '30%',
                type: 'success',
                duty: '负责整体架构、数据库统筹；RAG、知识图谱、智能体作为单独核心模块，不分配给其他成员。',
                pages: [
                    { name: '知识图谱RAG', path: '/knowledge-graph' },
                    { name: 'Agent决策中心', path: '/ai-assistant' },
                    { name: '农业知识决策', path: '/agri-knowledge' }
                ],
                patterns: ['单例模式', '责任链模式', '模块整合']
            },
            {
                name: '成员 A',
                percent: '17.5%',
                type: 'primary',
                duty: '负责前端页面、路由导航、表格表单、ECharts 图表和页面交互展示。',
                pages: [
                    { name: '首页大屏', path: '/' },
                    { name: '环境监测', path: '/environment' },
                    { name: '统计分析', path: '/statistics' },
                    { name: '用户中心', path: '/profile' }
                ],
                patterns: ['Vue Router', 'Element Plus', 'ECharts']
            },
            {
                name: '成员 B',
                percent: '17.5%',
                type: 'warning',
                duty: '负责用户、设备、环境、预警、农事任务、统计等基础接口，并实现工厂方法和观察者模式。',
                pages: [
                    { name: '环境监测', path: '/environment' },
                    { name: '预警中心', path: '/alerts' },
                    { name: '农事任务', path: '/tasks' },
                    { name: '统计分析', path: '/statistics' }
                ],
                patterns: ['工厂方法模式', '观察者模式', 'REST API']
            },
            {
                name: '成员 C',
                percent: '17.5%',
                type: 'danger',
                duty: '负责智能控制和设备状态管理，重点实现灌溉、补光、通风策略和设备状态转换。',
                pages: [
                    { name: '设备控制', path: '/devices' },
                    { name: '分工看板', path: '/project-division' },
                    { name: '产量预测', path: '/yield-prediction' }
                ],
                patterns: ['策略模式', '状态模式']
            },
            {
                name: '成员 D',
                percent: '17.5%',
                type: 'danger',
                duty: '负责设备指令封装、远程访问控制和设备功能增强，重点体现命令、代理和装饰器。',
                pages: [
                    { name: '设备控制', path: '/devices' },
                    { name: '分工看板', path: '/project-division' },
                    { name: '统计分析', path: '/statistics' }
                ],
                patterns: ['命令模式', '代理模式', '装饰器模式']
            }
        ];

        const pageMappings = [
            { page: '首页大屏', owner: '成员 A', feature: '项目总体数据展示、ECharts 趋势图、设备状态概览', path: '/' },
            { page: '环境监测', owner: '成员 B', feature: '环境数据采集、传感器数据、观察者联动入口', path: '/environment' },
            { page: '设备控制', owner: '成员 C', feature: '设备状态管理、状态模式、设备运行/待机/故障/维护/校准转换', path: '/devices' },
            { page: '设备控制', owner: '成员 D', feature: '设备命令封装、远程代理控制、装饰器动态增强设备功能', path: '/devices' },
            { page: '农事任务', owner: '成员 B', feature: '农事任务增删改查、任务状态流转', path: '/tasks' },
            { page: '预警中心', owner: '成员 B/组长', feature: '预警列表、异常事件处理、责任链处理结果', path: '/alerts' },
            { page: '统计分析', owner: '成员 A/B', feature: '统计接口、环境统计、设备统计、操作日志', path: '/statistics' },
            { page: '产量预测', owner: '成员 A/C', feature: '生产决策辅助、参数调整、趋势图展示', path: '/yield-prediction' },
            { page: '用户管理', owner: '成员 B', feature: '用户和角色管理、权限控制', path: '/users' },
            { page: '知识图谱RAG', owner: '组长 / 你', feature: 'RAG、知识图谱检索和可视化，单独归组长', path: '/knowledge-graph' },
            { page: 'Agent决策中心', owner: '组长 / 你', feature: '多 Agent 决策流程，单独归组长', path: '/ai-assistant' }
        ];

        const unwrap = async (response) => {
            const data = await response.json();
            if (data.code !== 200) {
                throw new Error(data.message || '请求失败');
            }
            return data.data;
        };

        const collectSensor = async () => {
            sensorLoading.value = true;
            try {
                sensorResult.value = await fetch(API_BASE_URL + '/api/sensors/collect/' + sensorType.value, { headers: headers() }).then(unwrap);
                ElementPlus.ElMessage.success('传感器工厂采集完成');
            } catch (error) {
                ElementPlus.ElMessage.error(error.message || '采集失败');
            } finally {
                sensorLoading.value = false;
            }
        };

        const collectAndControl = async () => {
            observerLoading.value = true;
            try {
                observerResult.value = await fetch(API_BASE_URL + '/api/environment/collect-and-control', { method: 'POST', headers: headers() }).then(unwrap);
                ElementPlus.ElMessage.success('观察者联动已触发');
            } catch (error) {
                ElementPlus.ElMessage.error(error.message || '联动失败');
            } finally {
                observerLoading.value = false;
            }
        };

        const runStrategy = async () => {
            strategyLoading.value = true;
            try {
                const params = new URLSearchParams({
                    crop: strategyForm.crop,
                    stage: strategyForm.stage
                });
                if (strategyForm.condition) params.set('condition', strategyForm.condition);
                strategyResult.value = await fetch(API_BASE_URL + '/api/strategy/demo?' + params.toString(), { headers: headers() }).then(unwrap);
                ElementPlus.ElMessage.success('策略选择完成');
            } catch (error) {
                ElementPlus.ElMessage.error(error.message || '策略演示失败');
            } finally {
                strategyLoading.value = false;
            }
        };

        const addCommand = async () => {
            commandLoading.value = true;
            try {
                const params = new URLSearchParams({ deviceCode: deviceCode.value, commandType: commandType.value, operator: 'division-demo', value: '60' });
                const data = await fetch(API_BASE_URL + '/api/commands/add?' + params.toString(), { method: 'POST', headers: headers() }).then(unwrap);
                deviceDemoLog.value = JSON.stringify(data, null, 2);
            } catch (error) {
                ElementPlus.ElMessage.error(error.message || '命令入队失败');
            } finally {
                commandLoading.value = false;
            }
        };

        const executeCommands = async () => {
            commandLoading.value = true;
            try {
                const data = await fetch(API_BASE_URL + '/api/commands/execute-all', { method: 'POST', headers: headers() }).then(unwrap);
                deviceDemoLog.value = JSON.stringify(data, null, 2);
            } catch (error) {
                ElementPlus.ElMessage.error(error.message || '命令执行失败');
            } finally {
                commandLoading.value = false;
            }
        };

        const undoCommand = async () => {
            commandLoading.value = true;
            try {
                const data = await fetch(API_BASE_URL + '/api/commands/undo-last', { method: 'POST', headers: headers() }).then(unwrap);
                deviceDemoLog.value = JSON.stringify(data, null, 2);
            } catch (error) {
                ElementPlus.ElMessage.error(error.message || '命令撤销失败');
            } finally {
                commandLoading.value = false;
            }
        };

        const remoteControl = async () => {
            proxyLoading.value = true;
            try {
                const params = new URLSearchParams({ username: remoteUser.value, deviceCode: deviceCode.value, action: 'START' });
                const data = await fetch(API_BASE_URL + '/api/devices/remote-control?' + params.toString(), { method: 'POST', headers: headers() }).then(unwrap);
                deviceDemoLog.value = JSON.stringify(data, null, 2);
            } catch (error) {
                ElementPlus.ElMessage.error(error.message || '远程代理失败');
            } finally {
                proxyLoading.value = false;
            }
        };

        const decoratorDemo = async () => {
            decoratorLoading.value = true;
            try {
                const data = await fetch(API_BASE_URL + '/api/devices/decorator-demo/' + deviceCode.value, { headers: headers() }).then(unwrap);
                deviceDemoLog.value = JSON.stringify(data, null, 2);
            } catch (error) {
                ElementPlus.ElMessage.error(error.message || '装饰器演示失败');
            } finally {
                decoratorLoading.value = false;
            }
        };

        const sensorSummary = Vue.computed(() => {
            const data = sensorResult.value || {};
            const observer = observerResult.value || {};
            return [
                { label: '土壤温度', value: data.soilTemperature ?? observer.soilTemperature ?? '--' },
                { label: '土壤湿度', value: data.soilHumidity ?? observer.soilHumidity ?? '--' },
                { label: '空气温度', value: data.airTemperature ?? observer.airTemperature ?? '--' },
                { label: '空气湿度', value: data.airHumidity ?? observer.airHumidity ?? '--' },
                { label: '光照强度', value: data.lightIntensity ?? observer.lightIntensity ?? '--' },
                { label: '虫情数量', value: data.pestCount ?? observer.pestCount ?? '--' }
            ];
        });

        const strategySummary = Vue.computed(() => {
            const data = strategyResult.value || {};
            return Object.keys(data).map(key => ({ label: key, value: data[key] }));
        });

        Vue.onMounted(() => {
            collectSensor();
            runStrategy();
        });

        return {
            members,
            pageMappings,
            sensorType,
            sensorLoading,
            observerLoading,
            strategyLoading,
            commandLoading,
            proxyLoading,
            decoratorLoading,
            strategyForm,
            sensorSummary,
            strategySummary,
            deviceCode,
            commandType,
            remoteUser,
            deviceDemoLog,
            collectSensor,
            collectAndControl,
            runStrategy,
            addCommand,
            executeCommands,
            undoCommand,
            remoteControl,
            decoratorDemo
        };
    }
};
