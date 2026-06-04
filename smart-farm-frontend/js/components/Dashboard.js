const Dashboard = {
    template: `
        <div>
            <!-- 统计卡片 -->
            <el-row :gutter="20" style="margin-bottom: 20px;">
                <el-col :span="4" v-for="stat in stats" :key="stat.label">
                    <el-card class="stat-card" shadow="hover" :body-style="{ padding: '20px' }">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
                                <div class="stat-label">{{ stat.label }}</div>
                            </div>
                            <i :class="stat.icon" class="stat-icon" :style="{ color: stat.color }"></i>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <!-- 图表区域 -->
            <el-row :gutter="20" style="margin-bottom: 20px;">
                <el-col :span="16">
                    <el-card shadow="hover">
                        <template #header>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-weight: bold;">环境数据变化趋势</span>
                                <el-button-group size="small">
                                    <el-button :type="chartType === 'temp' ? 'primary' : ''" @click="updateChart('temp')">温度</el-button>
                                    <el-button :type="chartType === 'humidity' ? 'primary' : ''" @click="updateChart('humidity')">湿度</el-button>
                                    <el-button :type="chartType === 'light' ? 'primary' : ''" @click="updateChart('light')">光照</el-button>
                                </el-button-group>
                            </div>
                        </template>
                        <div ref="chartRef" style="height: 350px;"></div>
                    </el-card>
                </el-col>
                <el-col :span="8">
                    <el-card shadow="hover" style="height: 100%;">
                        <template #header>
                            <span style="font-weight: bold;">设备状态概览</span>
                        </template>
                        <div ref="pieRef" style="height: 300px;"></div>
                    </el-card>
                </el-col>
            </el-row>

            <!-- 快速操作 -->
            <el-card shadow="hover">
                <template #header>
                    <span style="font-weight: bold;">快速操作</span>
                </template>
                <el-row :gutter="20">
                    <el-col :span="6">
                        <el-button type="primary" plain style="width: 100%; height: 60px;" @click="collectData">
                            <i class="fas fa-database" style="margin-right: 8px;"></i>采集环境数据
                        </el-button>
                    </el-col>
                    <el-col :span="6">
                        <el-button type="success" plain style="width: 100%; height: 60px;" @click="$router.push('/devices')">
                            <i class="fas fa-cogs" style="margin-right: 8px;"></i>设备管理
                        </el-button>
                    </el-col>
                    <el-col :span="6">
                        <el-button type="warning" plain style="width: 100%; height: 60px;" @click="$router.push('/ai-assistant')">
                            <i class="fas fa-robot" style="margin-right: 8px;"></i>AI 决策
                        </el-button>
                    </el-col>
                    <el-col :span="6">
                        <el-button type="info" plain style="width: 100%; height: 60px;" @click="$router.push('/statistics')">
                            <i class="fas fa-chart-bar" style="margin-right: 8px;"></i>查看统计
                        </el-button>
                    </el-col>
                </el-row>
            </el-card>
        </div>
    `,

    setup() {
        const API_BASE_URL = 'http://localhost:8080';
        const chartRef = Vue.ref(null);
        const pieRef = Vue.ref(null);
        const chartType = Vue.ref('temp');
        let chartInstance = null;
        let pieInstance = null;

        const stats = Vue.ref([
            { label: '土壤湿度', value: '--', icon: 'fas fa-tint', color: '#409eff' },
            { label: '空气温度', value: '--', icon: 'fas fa-thermometer-half', color: '#f56c6c' },
            { label: '光照强度', value: '--', icon: 'fas fa-sun', color: '#e6a23c' },
            { label: 'CO₂浓度', value: '--', icon: 'fas fa-wind', color: '#67c23a' },
            { label: '在线设备', value: '--', icon: 'fas fa-microchip', color: '#409eff' },
            { label: '今日预警', value: '--', icon: 'fas fa-exclamation-triangle', color: '#f56c6c' }
        ]);

        const loadData = async () => {
            try {
                const [env, overview] = await Promise.all([
                    fetch(API_BASE_URL + '/api/environment/latest', {
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    }).then(r => r.json()).catch(() => null),
                    fetch(API_BASE_URL + '/api/statistics/overview', {
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                    }).then(r => r.json()).catch(() => null)
                ]);

                if (env && env.code === 200 && env.data) {
                    const d = env.data;
                    stats.value[0].value = (d.soilHumidity || 0).toFixed(1) + '%';
                    stats.value[1].value = (d.airTemperature || 0).toFixed(1) + '°C';
                    stats.value[2].value = (d.lightIntensity || 0).toFixed(0) + ' lux';
                    stats.value[3].value = (d.co2 || 0).toFixed(0) + ' ppm';
                }
                if (overview && overview.code === 200 && overview.data) {
                    stats.value[4].value = overview.data.deviceRunning || 0;
                    stats.value[5].value = overview.data.pendingAlerts || 0;
                }
            } catch (e) {
                console.error('Load dashboard data failed:', e);
            }
        };

        const initChart = () => {
            if (!chartRef.value) return;
            chartInstance = echarts.init(chartRef.value);
            updateChart('temp');
        };

        const updateChart = (type) => {
            chartType.value = type;
            if (!chartInstance) return;
            loadTrendData(type);
        };

        const loadTrendData = async (type) => {
            const configs = {
                temp: { field: 'airTemperature', name: '空气温度(°C)', color: '#f56c6c' },
                humidity: { field: 'soilHumidity', name: '土壤湿度(%)', color: '#409eff' },
                light: { field: 'lightIntensity', name: '光照强度(lux)', color: '#e6a23c' }
            };
            const cfg = configs[type];

            let labels = [];
            let values = [];
            try {
                const res = await fetch(API_BASE_URL + '/api/environment/trend', {
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                });
                const data = await res.json();
                if (data.code === 200 && data.data && data.data.length > 0) {
                    const records = data.data.reverse();
                    labels = records.map(r => {
                        const t = r.collectTime || '';
                        return t.substring(11, 16) || t.substring(5, 16);
                    });
                    values = records.map(r => r[cfg.field] || 0);
                }
            } catch (e) {
                console.error(e);
            }

            if (labels.length === 0) {
                const hours = [];
                const now = new Date();
                for (let i = 23; i >= 0; i--) {
                    const h = new Date(now - i * 3600000);
                    hours.push(h.getHours() + ':00');
                }
                labels = hours;
                values = hours.map(() => 0);
            }

            chartInstance.setOption({
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                xAxis: { type: 'category', data: labels, boundaryGap: false },
                yAxis: { type: 'value', name: cfg.name },
                series: [{
                    name: cfg.name,
                    type: 'line',
                    data: values,
                    smooth: true,
                    areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: cfg.color + '40' }, { offset: 1, color: cfg.color + '05' }] } },
                    lineStyle: { color: cfg.color, width: 2 },
                    itemStyle: { color: cfg.color }
                }]
            });
        };

        const initPie = async () => {
            if (!pieRef.value) return;
            pieInstance = echarts.init(pieRef.value);

            let pieData = [
                { value: 0, name: '运行中', itemStyle: { color: '#67c23a' } },
                { value: 0, name: '待机', itemStyle: { color: '#909399' } },
                { value: 0, name: '故障', itemStyle: { color: '#f56c6c' } },
                { value: 0, name: '维护', itemStyle: { color: '#e6a23c' } }
            ];
            try {
                const res = await fetch(API_BASE_URL + '/api/statistics/devices/distribution', {
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                });
                const data = await res.json();
                if (data.code === 200 && data.data) {
                    pieData[0].value = data.data.RUNNING || 0;
                    pieData[1].value = data.data.STANDBY || 0;
                    pieData[2].value = data.data.FAULT || 0;
                    pieData[3].value = data.data.MAINTENANCE || 0;
                }
            } catch (e) {
                console.error(e);
            }

            pieInstance.setOption({
                tooltip: { trigger: 'item' },
                legend: { bottom: 0 },
                series: [{
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
                    label: { show: false },
                    emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
                    data: pieData
                }]
            });
        };

        const collectData = async () => {
            try {
                const res = await fetch(API_BASE_URL + '/api/environment/collect-and-control', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                });
                const data = await res.json();
                if (data.code === 200) {
                    ElementPlus.ElMessage.success('环境数据采集成功');
                    loadData();
                }
            } catch (e) {
                ElementPlus.ElMessage.error('采集失败');
            }
        };

        Vue.onMounted(async () => {
            await loadData();
            Vue.nextTick(() => {
                initChart();
                initPie();
            });
            window.addEventListener('resize', () => {
                chartInstance?.resize();
                pieInstance?.resize();
            });
        });

        return { stats, chartRef, pieRef, chartType, updateChart, collectData };
    }
};
