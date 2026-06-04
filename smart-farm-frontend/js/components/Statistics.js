const Statistics = {
    template: `
        <div>
            <!-- 概览统计 -->
            <el-row :gutter="20" style="margin-bottom: 20px;">
                <el-col :span="6" v-for="stat in overviewStats" :key="stat.label">
                    <el-card shadow="hover" :body-style="{ padding: '20px' }">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 28px; font-weight: bold;" :style="{ color: stat.color }">{{ stat.value }}</div>
                                <div style="font-size: 13px; color: #909399; margin-top: 5px;">{{ stat.label }}</div>
                            </div>
                            <i :class="stat.icon" style="font-size: 32px; opacity: 0.6;" :style="{ color: stat.color }"></i>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <!-- 图表 -->
            <el-row :gutter="20" style="margin-bottom: 20px;">
                <el-col :span="12">
                    <el-card shadow="hover">
                        <template #header>
                            <span style="font-weight: bold;">设备操作统计</span>
                        </template>
                        <div ref="barRef" style="height: 350px;"></div>
                    </el-card>
                </el-col>
                <el-col :span="12">
                    <el-card shadow="hover">
                        <template #header>
                            <span style="font-weight: bold;">环境数据分布</span>
                        </template>
                        <div ref="radarRef" style="height: 350px;"></div>
                    </el-card>
                </el-col>
            </el-row>

            <!-- 操作日志表格 -->
            <el-card shadow="hover">
                <template #header>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold;">设备操作日志</span>
                        <el-form :inline="true" style="margin-bottom: 0;">
                            <el-form-item label="设备编码" style="margin-bottom: 0;">
                                <el-input v-model="queryDeviceCode" placeholder="输入设备编码" clearable size="small" style="width: 180px;"></el-input>
                            </el-form-item>
                            <el-form-item style="margin-bottom: 0;">
                                <el-button type="primary" size="small" @click="loadLogs"><i class="fas fa-search" style="margin-right: 4px;"></i>查询</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </template>
                <el-table :data="logs" stripe border style="width: 100%;" v-loading="loading">
                    <el-table-column prop="id" label="ID" width="70"></el-table-column>
                    <el-table-column prop="deviceCode" label="设备编码" width="150"></el-table-column>
                    <el-table-column prop="operationType" label="操作类型" width="120">
                        <template #default="{ row }">
                            <el-tag :type="getOpTagType(row.operationType)" size="small">{{ row.operationType }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="operator" label="操作人" width="100"></el-table-column>
                    <el-table-column prop="result" label="操作结果"></el-table-column>
                    <el-table-column prop="operationTime" label="操作时间" width="180"></el-table-column>
                </el-table>
                <div style="margin-top: 15px; text-align: right;">
                    <el-pagination
                        v-model:current-page="currentPage"
                        :page-size="pageSize"
                        :total="total"
                        layout="total, prev, pager, next"
                        @current-change="loadLogs">
                    </el-pagination>
                </div>
            </el-card>
        </div>
    `,

    setup() {
        const API_BASE_URL = 'http://localhost:8080';
        const barRef = Vue.ref(null);
        const radarRef = Vue.ref(null);
        const logs = Vue.ref([]);
        const queryDeviceCode = Vue.ref('');
        const currentPage = Vue.ref(1);
        const pageSize = 10;
        const total = Vue.ref(0);
        const loading = Vue.ref(false);

        const overviewStats = Vue.ref([
            { label: '设备总数', value: '--', icon: 'fas fa-microchip', color: '#409eff' },
            { label: '运行中', value: '--', icon: 'fas fa-play-circle', color: '#67c23a' },
            { label: '故障设备', value: '--', icon: 'fas fa-exclamation-circle', color: '#f56c6c' },
            { label: '今日操作', value: '--', icon: 'fas fa-clipboard-list', color: '#e6a23c' }
        ]);

        const getHeaders = () => ({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        });

        const getOpTagType = (type) => {
            if (!type) return '';
            if (type.includes('启动') || type.includes('START')) return 'success';
            if (type.includes('停止') || type.includes('STOP')) return 'danger';
            if (type.includes('维护') || type.includes('MAINTAIN')) return 'warning';
            if (type.includes('校准') || type.includes('CALIBRATE')) return 'info';
            return '';
        };

        const loadOverview = async () => {
            try {
                const res = await fetch(API_BASE_URL + '/api/statistics/overview', { headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200 && data.data) {
                    const d = data.data;
                    overviewStats.value[0].value = d.deviceTotal || 0;
                    overviewStats.value[1].value = d.deviceRunning || 0;
                    overviewStats.value[2].value = d.deviceFault || 0;
                    overviewStats.value[3].value = d.todayOperations || 0;
                }
            } catch (e) {
                console.error(e);
            }
        };

        const loadLogs = async () => {
            loading.value = true;
            try {
                let url = API_BASE_URL + '/api/statistics/logs?page=' + (currentPage.value - 1) + '&size=' + pageSize;
                if (queryDeviceCode.value) url += '&deviceCode=' + queryDeviceCode.value;
                const res = await fetch(url, { headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200) {
                    const pageData = data.data;
                    logs.value = pageData.content || [];
                    total.value = pageData.totalElements || 0;
                }
            } catch (e) {
                console.error(e);
            }
            loading.value = false;
        };

        const initBarChart = async () => {
            if (!barRef.value) return;
            const bar = echarts.init(barRef.value);

            let categories = [];
            let values = [];
            try {
                const res = await fetch(API_BASE_URL + '/api/statistics/operations/summary', { headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200 && data.data) {
                    categories = Object.keys(data.data);
                    values = Object.values(data.data);
                }
            } catch (e) {
                console.error(e);
            }

            if (categories.length === 0) {
                categories = ['暂无数据'];
                values = [0];
            }

            bar.setOption({
                tooltip: { trigger: 'axis' },
                xAxis: { type: 'category', data: categories },
                yAxis: { type: 'value' },
                series: [{
                    type: 'bar',
                    data: values,
                    itemStyle: { color: '#409eff', borderRadius: [4, 4, 0, 0] }
                }]
            });
            window.addEventListener('resize', () => bar.resize());
        };

        const initRadarChart = async () => {
            if (!radarRef.value) return;
            const radar = echarts.init(radarRef.value);

            let indicators = [];
            let values = [];
            try {
                const res = await fetch(API_BASE_URL + '/api/statistics/environment/summary', { headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200 && data.data) {
                    const d = data.data;
                    indicators = [
                        { name: '土壤湿度', max: 100 },
                        { name: '空气温度', max: 50 },
                        { name: '光照强度', max: 100 },
                        { name: 'CO₂', max: 2000 }
                    ];
                    values = [
                        d['平均土壤湿度(%)'] || 0,
                        d['平均空气温度(°C)'] || 0,
                        (d['平均光照强度(lux)'] || 0) / 100,
                        d['平均CO₂(ppm)'] || 0
                    ];
                }
            } catch (e) {
                console.error(e);
            }

            if (indicators.length === 0) {
                indicators = [
                    { name: '土壤湿度', max: 100 },
                    { name: '空气温度', max: 50 },
                    { name: '空气湿度', max: 100 },
                    { name: '光照强度', max: 100 },
                    { name: 'CO₂', max: 2000 }
                ];
                values = [0, 0, 0, 0, 0];
            }

            radar.setOption({
                tooltip: {},
                radar: { indicator: indicators },
                series: [{
                    type: 'radar',
                    data: [{
                        value: values,
                        name: '当前环境',
                        areaStyle: { color: 'rgba(64, 158, 255, 0.2)' },
                        lineStyle: { color: '#409eff' }
                    }]
                }]
            });
            window.addEventListener('resize', () => radar.resize());
        };

        Vue.onMounted(async () => {
            await loadOverview();
            await loadLogs();
            Vue.nextTick(() => {
                initBarChart();
                initRadarChart();
            });
        });

        return { overviewStats, barRef, radarRef, logs, queryDeviceCode, currentPage, pageSize, total, loading, loadLogs, getOpTagType };
    }
};
