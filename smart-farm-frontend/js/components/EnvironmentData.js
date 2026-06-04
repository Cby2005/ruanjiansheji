const EnvironmentData = {
    template: `
        <div>
            <!-- 当前环境数据 -->
            <el-row :gutter="20" style="margin-bottom: 20px;">
                <el-col :span="6" v-for="item in currentData" :key="item.label">
                    <el-card shadow="hover" :body-style="{ padding: '20px' }">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 24px; font-weight: bold;" :style="{ color: item.color }">{{ item.value }}</div>
                                <div style="font-size: 13px; color: #909399; margin-top: 5px;">{{ item.label }}</div>
                            </div>
                            <i :class="item.icon" style="font-size: 30px; opacity: 0.6;" :style="{ color: item.color }"></i>
                        </div>
                        <div style="margin-top: 10px;">
                            <el-progress :percentage="item.percent" :color="item.color" :show-text="false" :stroke-width="4"></el-progress>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <!-- 查询和操作 -->
            <el-card shadow="hover" style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <el-form :inline="true" :model="queryForm">
                        <el-form-item label="时间范围">
                            <el-date-picker v-model="queryForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" size="default" style="width: 300px;"></el-date-picker>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="loadHistory"><i class="fas fa-search" style="margin-right: 6px;"></i>查询</el-button>
                        </el-form-item>
                    </el-form>
                    <el-button type="success" @click="collectData"><i class="fas fa-database" style="margin-right: 6px;"></i>采集数据</el-button>
                </div>
            </el-card>

            <!-- 历史数据表格 -->
            <el-card shadow="hover">
                <template #header>
                    <span style="font-weight: bold;">历史环境数据</span>
                </template>
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
            </el-card>
        </div>
    `,

    setup() {
        const API_BASE_URL = 'http://localhost:8080';
        const historyData = Vue.ref([]);
        const queryForm = Vue.reactive({ dateRange: null });
        const currentPage = Vue.ref(1);
        const pageSize = 10;
        const total = Vue.ref(0);

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
                const res = await fetch(API_BASE_URL + '/api/environment/history?page=' + (currentPage.value - 1) + '&size=' + pageSize, { headers: getHeaders() });
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

        Vue.onMounted(() => {
            loadCurrent();
            loadHistory();
        });

        return { currentData, historyData, queryForm, currentPage, pageSize, total, loadHistory, collectData };
    }
};
