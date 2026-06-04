const EnvironmentData = {
    template: `
        <div>
            <!-- 页面头部 -->
            <div class="page-header">
                <div class="page-header-left">
                    <h1 class="page-header-title">环境监测</h1>
                    <p class="page-header-subtitle">实时采集温室传感器数据，查看历史记录与趋势</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <el-button type="primary" @click="collectData"><i class="fas fa-database" style="margin-right: 6px;"></i>采集数据</el-button>
                    <el-button @click="showFactoryDialog = true"><i class="fas fa-industry" style="margin-right: 6px;"></i>传感器/执行器</el-button>
                    <el-button @click="showObserverDialog = true"><i class="fas fa-link" style="margin-right: 6px;"></i>联动控制</el-button>
                    <el-button @click="showStrategyDialog = true"><i class="fas fa-random" style="margin-right: 6px;"></i>策略切换</el-button>
                </div>
            </div>

            <!-- 当前环境数据 -->
            <el-row :gutter="16" style="margin-bottom: 16px;">
                <el-col :xs="12" :sm="6" v-for="item in currentData" :key="item.label">
                    <div class="stat-card" style="margin-bottom: 16px;">
                        <div class="stat-card-inner">
                            <div class="stat-card-info">
                                <div class="stat-card-value" :style="{ color: item.color }">{{ item.value }}</div>
                                <div class="stat-card-label">{{ item.label }}</div>
                            </div>
                            <i :class="item.icon" class="stat-card-icon" :style="{ color: item.color }"></i>
                        </div>
                        <div style="margin-top: 12px;">
                            <el-progress :percentage="item.percent" :color="item.color" :show-text="false" :stroke-width="4"></el-progress>
                        </div>
                    </div>
                </el-col>
            </el-row>

            <!-- 查询栏 -->
            <div class="query-bar">
                <el-form :inline="true" :model="queryForm" style="margin-bottom: 0;">
                    <el-form-item label="时间范围" style="margin-bottom: 0;">
                        <el-date-picker v-model="queryForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" size="default" style="width: 300px;"></el-date-picker>
                    </el-form-item>
                    <el-form-item style="margin-bottom: 0;">
                        <el-button type="primary" @click="loadHistory"><i class="fas fa-search" style="margin-right: 6px;"></i>查询</el-button>
                    </el-form-item>
                </el-form>
            </div>

            <!-- 历史数据表格 -->
            <div class="content-card">
                <div class="content-card-header">
                    <span class="content-card-title">历史环境数据</span>
                </div>
                <div class="content-card-body">
                <el-table :data="historyData" stripe border style="width: 100%;">
                    <el-table-column prop="id" label="ID" width="70"></el-table-column>
                    <el-table-column prop="recordTime" label="记录时间" width="180"></el-table-column>
                    <el-table-column prop="soilHumidity" label="土壤湿度(%)" width="120">
                        <template #default="{ row }">
                            <span :style="{ color: row.soilHumidity < 30 ? '#f56c6c' : row.soilHumidity > 80 ? '#e6a23c' : '#67c23a' }">{{ row.soilHumidity?.toFixed(1) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="airTemperature" label="空气温度(°C)" width="120">
                        <template #default="{ row }">
                            <span :style="{ color: row.airTemperature > 35 ? '#f56c6c' : row.airTemperature < 5 ? '#409eff' : '#67c23a' }">{{ row.airTemperature?.toFixed(1) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="airHumidity" label="空气湿度(%)" width="120">
                        <template #default="{ row }">{{ row.airHumidity?.toFixed(1) }}</template>
                    </el-table-column>
                    <el-table-column prop="lightIntensity" label="光照强度(lux)" width="130">
                        <template #default="{ row }">{{ row.lightIntensity?.toFixed(0) }}</template>
                    </el-table-column>
                    <el-table-column prop="co2" label="CO₂浓度(ppm)" width="130">
                        <template #default="{ row }">
                            <span :style="{ color: row.co2 > 1000 ? '#f56c6c' : '#67c23a' }">{{ row.co2?.toFixed(0) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="soilTemperature" label="土壤温度(°C)" width="120">
                        <template #default="{ row }">{{ row.soilTemperature?.toFixed(1) }}</template>
                    </el-table-column>
                </el-table>
                <div style="margin-top: 15px; text-align: right;">
                    <el-pagination
                        v-model:current-page="currentPage"
                        :page-size="pageSize"
                        :total="total"
                        layout="total, prev, pager, next"
                        @current-change="loadHistory">
                    </el-pagination>
                </div>
                </div>
            </div>

            <!-- 传感器/执行器弹窗 -->
            <el-dialog v-model="showFactoryDialog" title="传感器 / 执行器管理" width="650px">
                <p style="color: #909399; font-size: 13px; margin-bottom: 15px;">
                    选择传感器类型采集数据，选择执行器类型进行控制演示。系统根据类型字符串自动创建对应实例。
                </p>
                <el-form :inline="true" size="default">
                    <el-form-item label="传感器类型">
                        <el-select v-model="factoryForm.sensorType" style="width: 140px;">
                            <el-option label="土壤传感器" value="soil"></el-option>
                            <el-option label="光照传感器" value="light"></el-option>
                            <el-option label="气象站" value="weather"></el-option>
                            <el-option label="虫情传感器" value="pest"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="执行器类型">
                        <el-select v-model="factoryForm.actuatorType" style="width: 140px;">
                            <el-option label="灌溉阀" value="irrigation"></el-option>
                            <el-option label="补光灯" value="light"></el-option>
                            <el-option label="通风风扇" value="fan"></el-option>
                            <el-option label="卷帘" value="roller"></el-option>
                            <el-option label="加热器" value="heater"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" :loading="factoryLoading" @click="runFactoryDemo">
                            <i class="fas fa-play" style="margin-right: 6px;"></i>运行演示
                        </el-button>
                    </el-form-item>
                </el-form>
                <el-divider></el-divider>
                <el-descriptions :column="2" border size="small">
                    <el-descriptions-item v-for="item in factorySummary" :key="item.label" :label="item.label">{{ item.value }}</el-descriptions-item>
                </el-descriptions>
            </el-dialog>

            <!-- 联动控制弹窗 -->
            <el-dialog v-model="showObserverDialog" title="环境联动控制" width="650px">
                <p style="color: #909399; font-size: 13px; margin-bottom: 15px;">
                    采集当前环境数据后，系统自动根据阈值判断并通知各控制模块联动响应：灌溉、补光、通风、虫情预警。
                </p>
                <el-button type="success" :loading="observerLoading" @click="runObserverDemo">
                    <i class="fas fa-bolt" style="margin-right: 6px;"></i>采集并触发联动
                </el-button>
                <el-input type="textarea" :rows="6" readonly style="margin-top: 15px;" :model-value="observerLog" placeholder="点击上方按钮执行后，联动结果将显示在此处"></el-input>
            </el-dialog>

            <!-- 策略切换弹窗 -->
            <el-dialog v-model="showStrategyDialog" title="控制策略配置" width="650px">
                <p style="color: #909399; font-size: 13px; margin-bottom: 15px;">
                    根据作物种类、生长阶段和当前环境条件，系统自动选择最优的灌溉、补光和通风策略。
                </p>
                <el-form label-width="80px">
                    <el-form-item label="作物种类">
                        <el-select v-model="strategyForm.crop" style="width: 100%;">
                            <el-option label="番茄" value="tomato"></el-option>
                            <el-option label="黄瓜" value="cucumber"></el-option>
                            <el-option label="草莓" value="strawberry"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="生长阶段">
                        <el-select v-model="strategyForm.stage" style="width: 100%;">
                            <el-option label="育苗期" value="seedling"></el-option>
                            <el-option label="花期" value="flowering"></el-option>
                            <el-option label="果期" value="fruiting"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="环境条件">
                        <el-select v-model="strategyForm.condition" style="width: 100%;">
                            <el-option label="正常" value="normal"></el-option>
                            <el-option label="高温" value="high_temp"></el-option>
                            <el-option label="高湿" value="high_humidity"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" :loading="strategyLoading" @click="runStrategyDemo">
                            <i class="fas fa-magic" style="margin-right: 6px;"></i>生成策略
                        </el-button>
                    </el-form-item>
                </el-form>
                <el-divider></el-divider>
                <el-input type="textarea" :rows="5" readonly :model-value="strategyText" placeholder="点击生成策略后，推荐策略将显示在此处"></el-input>
            </el-dialog>
        </div>
    `,

    setup() {
        const API_BASE_URL = 'http://localhost:8080';
        const historyData = Vue.ref([]);
        const queryForm = Vue.reactive({ dateRange: null });
        const factoryForm = Vue.reactive({ sensorType: 'soil', actuatorType: 'irrigation' });
        const factoryLoading = Vue.ref(false);
        const observerLoading = Vue.ref(false);
        const strategyLoading = Vue.ref(false);
        const factoryResult = Vue.ref({});
        const actuatorResult = Vue.ref({});
        const observerLog = Vue.ref('');
        const strategyForm = Vue.reactive({ crop: 'tomato', stage: 'seedling', condition: 'normal' });
        const strategyResult = Vue.ref({});
        const currentPage = Vue.ref(1);
        const pageSize = 10;
        const total = Vue.ref(0);
        const showFactoryDialog = Vue.ref(false);
        const showObserverDialog = Vue.ref(false);
        const showStrategyDialog = Vue.ref(false);

        const currentData = Vue.ref([
            { label: '土壤湿度', value: '--', icon: 'fas fa-tint', color: '#409eff', percent: 0 },
            { label: '空气温度', value: '--', icon: 'fas fa-thermometer-half', color: '#f56c6c', percent: 0 },
            { label: '光照强度', value: '--', icon: 'fas fa-sun', color: '#e6a23c', percent: 0 },
            { label: 'CO₂浓度', value: '--', icon: 'fas fa-wind', color: '#67c23a', percent: 0 }
        ]);

        const getHeaders = () => ({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        });

        const loadCurrent = async () => {
            try {
                const res = await fetch(API_BASE_URL + '/api/environment/latest', { headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200 && data.data) {
                    const d = data.data;
                    currentData.value[0].value = (d.soilHumidity || 0).toFixed(1) + '%';
                    currentData.value[0].percent = Math.min(100, d.soilHumidity || 0);
                    currentData.value[1].value = (d.airTemperature || 0).toFixed(1) + '°C';
                    currentData.value[1].percent = Math.min(100, (d.airTemperature || 0) / 50 * 100);
                    currentData.value[2].value = (d.lightIntensity || 0).toFixed(0) + ' lux';
                    currentData.value[2].percent = Math.min(100, (d.lightIntensity || 0) / 10000 * 100);
                    currentData.value[3].value = (d.co2 || 0).toFixed(0) + ' ppm';
                    currentData.value[3].percent = Math.min(100, (d.co2 || 0) / 2000 * 100);
                }
            } catch (e) {
                console.error(e);
            }
        };

        const loadHistory = async () => {
            try {
                let url = API_BASE_URL + '/api/environment/history?page=' + (currentPage.value - 1) + '&size=' + pageSize;
                if (queryForm.dateRange && queryForm.dateRange.length === 2) {
                    const start = queryForm.dateRange[0];
                    const end = queryForm.dateRange[1];
                    const formatDate = (d) => {
                        const pad = (n) => String(n).padStart(2, '0');
                        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' 00:00:00';
                    };
                    url += '&startDate=' + encodeURIComponent(formatDate(start));
                    url += '&endDate=' + encodeURIComponent(formatDate(new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)));
                }
                const res = await fetch(url, { headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200) {
                    historyData.value = data.data.content || [];
                    total.value = data.data.totalElements || 0;
                }
            } catch (e) {
                console.error(e);
            }
        };

        const collectData = async () => {
            try {
                const res = await fetch(API_BASE_URL + '/api/environment/collect-and-control', {
                    method: 'POST', headers: getHeaders()
                });
                const data = await res.json();
                if (data.code === 200) {
                    ElementPlus.ElMessage.success('数据采集成功');
                    loadCurrent();
                    loadHistory();
                }
            } catch (e) {
                ElementPlus.ElMessage.error('采集失败');
            }
        };

        const runFactoryDemo = async () => {
            factoryLoading.value = true;
            try {
                const [sensorRes, actuatorRes] = await Promise.all([
                    fetch(API_BASE_URL + '/api/sensors/collect/' + factoryForm.sensorType, { headers: getHeaders() }).then(r => r.json()),
                    fetch(API_BASE_URL + '/api/sensors/actuator-demo/' + factoryForm.actuatorType + '?action=START', { headers: getHeaders() }).then(r => r.json())
                ]);
                if (sensorRes.code === 200) factoryResult.value = sensorRes.data || {};
                if (actuatorRes.code === 200) actuatorResult.value = actuatorRes.data || {};
                ElementPlus.ElMessage.success('Factory demo completed');
            } catch (e) {
                ElementPlus.ElMessage.error('Factory demo failed');
            } finally {
                factoryLoading.value = false;
            }
        };

        const runObserverDemo = async () => {
            observerLoading.value = true;
            try {
                const res = await fetch(API_BASE_URL + '/api/environment/collect-and-control', { method: 'POST', headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200) {
                    observerLog.value = JSON.stringify({
                        observerCenter: 'EnvironmentDataCenter',
                        observers: ['IrrigationObserver', 'LightObserver', 'FanObserver', 'PestWarningObserver'],
                        latestData: data.data
                    }, null, 2);
                    loadCurrent();
                    loadHistory();
                }
            } catch (e) {
                ElementPlus.ElMessage.error('Observer demo failed');
            } finally {
                observerLoading.value = false;
            }
        };

        const factorySummary = Vue.computed(() => {
            const s = factoryResult.value || {};
            const a = actuatorResult.value || {};
            return [
                { label: 'Sensor type', value: s.sensorType || factoryForm.sensorType },
                { label: 'Soil humidity', value: s.soilHumidity ? Number(s.soilHumidity).toFixed(1) + '%' : '--' },
                { label: 'Air temperature', value: s.airTemperature ? Number(s.airTemperature).toFixed(1) + ' C' : '--' },
                { label: 'Light', value: s.lightIntensity ? Number(s.lightIntensity).toFixed(0) + ' lux' : '--' },
                { label: 'Actuator factory', value: a.factory || 'ActuatorFactory' },
                { label: 'Actuator type', value: a.type || factoryForm.actuatorType }
            ];
        });

        const strategyText = Vue.computed(() => {
            const r = strategyResult.value || {};
            if (!Object.keys(r).length) {
                return '请选择作物、生长期和环境条件，系统会动态选择灌溉策略、补光策略和通风策略。';
            }
            return JSON.stringify(r, null, 2);
        });

        const runStrategyDemo = async () => {
            strategyLoading.value = true;
            try {
                const query = '?crop=' + strategyForm.crop + '&stage=' + strategyForm.stage + '&condition=' + strategyForm.condition;
                const res = await fetch(API_BASE_URL + '/api/strategy/demo' + query, { headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200) {
                    strategyResult.value = data.data || {};
                    ElementPlus.ElMessage.success('策略已生成');
                }
            } catch (e) {
                ElementPlus.ElMessage.error('策略生成失败');
            } finally {
                strategyLoading.value = false;
            }
        };

        Vue.onMounted(() => {
            loadCurrent();
            loadHistory();
        });

        return {
            currentData, historyData, queryForm, factoryForm, factoryLoading, observerLoading,
            factorySummary, observerLog, currentPage, pageSize, total, loadHistory, collectData,
            runFactoryDemo, runObserverDemo, strategyForm, strategyLoading, strategyText, runStrategyDemo,
            showFactoryDialog, showObserverDialog, showStrategyDialog
        };
    }
};
