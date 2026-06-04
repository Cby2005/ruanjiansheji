const YieldPrediction = {
    template: `
        <div class="yield-prediction-page">
            <!-- 顶部统计卡片 -->
            <el-row :gutter="20" style="margin-bottom: 20px;">
                <el-col :span="6">
                    <el-card shadow="hover" style="border-left: 4px solid #67c23a;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 13px; color: #909399;">预测次数</div>
                                <div style="font-size: 28px; font-weight: bold; color: #303133; margin-top: 8px;">{{ historyData.length }}</div>
                            </div>
                            <i class="fas fa-chart-line" style="font-size: 36px; color: #67c23a; opacity: 0.6;"></i>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card shadow="hover" style="border-left: 4px solid #409eff;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 13px; color: #909399;">最近预测产量</div>
                                <div style="font-size: 28px; font-weight: bold; color: #303133; margin-top: 8px;">{{ lastPrediction ? lastPrediction.predictedYield + ' kg' : '--' }}</div>
                            </div>
                            <i class="fas fa-weight-hanging" style="font-size: 36px; color: #409eff; opacity: 0.6;"></i>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card shadow="hover" style="border-left: 4px solid #e6a23c;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 13px; color: #909399;">最近预测作物</div>
                                <div style="font-size: 28px; font-weight: bold; color: #303133; margin-top: 8px;">{{ lastPrediction ? lastPrediction.cropName : '--' }}</div>
                            </div>
                            <i class="fas fa-seedling" style="font-size: 36px; color: #e6a23c; opacity: 0.6;"></i>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card shadow="hover" style="border-left: 4px solid #f56c6c;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 13px; color: #909399;">平均环境评分</div>
                                <div style="font-size: 28px; font-weight: bold; color: #303133; margin-top: 8px;">{{ avgEnvScore }}</div>
                            </div>
                            <i class="fas fa-thermometer-half" style="font-size: 36px; color: #f56c6c; opacity: 0.6;"></i>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <!-- 左侧：预测表单 -->
                <el-col :span="10">
                    <el-card shadow="hover">
                        <template #header>
                            <div style="display: flex; align-items: center;">
                                <i class="fas fa-calculator" style="margin-right: 8px; color: #409eff;"></i>
                                <span style="font-weight: bold;">产量预测</span>
                            </div>
                        </template>

                        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" label-position="top">
                            <el-form-item label="作物名称" prop="cropName">
                                <el-select v-model="form.cropName" placeholder="请选择作物" style="width: 100%;">
                                    <el-option label="水稻" value="水稻"></el-option>
                                    <el-option label="小麦" value="小麦"></el-option>
                                    <el-option label="玉米" value="玉米"></el-option>
                                    <el-option label="大豆" value="大豆"></el-option>
                                    <el-option label="番茄" value="番茄"></el-option>
                                    <el-option label="黄瓜" value="黄瓜"></el-option>
                                    <el-option label="辣椒" value="辣椒"></el-option>
                                    <el-option label="白菜" value="白菜"></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="基础产量(kg)" prop="baseYield">
                                <el-input-number v-model="form.baseYield" :min="1" :max="100000" :step="100" style="width: 100%;"></el-input-number>
                            </el-form-item>

                            <el-form-item label="环境适宜度" prop="envScore">
                                <el-slider v-model="form.envScore" :min="0" :max="1" :step="0.01" show-input :format-tooltip="v => (v * 100).toFixed(0) + '%'"></el-slider>
                                <div style="font-size: 12px; color: #909399; margin-top: 4px;">基于当前温湿度、光照、CO2等环境数据评估</div>
                            </el-form-item>

                            <el-form-item label="农事完成率" prop="taskScore">
                                <el-slider v-model="form.taskScore" :min="0" :max="1" :step="0.01" show-input :format-tooltip="v => (v * 100).toFixed(0) + '%'"></el-slider>
                                <div style="font-size: 12px; color: #909399; margin-top: 4px;">农事任务完成比例</div>
                            </el-form-item>

                            <el-form-item label="设备稳定系数" prop="deviceScore">
                                <el-slider v-model="form.deviceScore" :min="0" :max="1" :step="0.01" show-input :format-tooltip="v => (v * 100).toFixed(0) + '%'"></el-slider>
                                <div style="font-size: 12px; color: #909399; margin-top: 4px;">设备运行稳定性评估</div>
                            </el-form-item>

                            <el-form-item>
                                <el-button type="primary" @click="handlePredict" :loading="loading" style="width: 100%; height: 44px; font-size: 16px;">
                                    <i class="fas fa-magic" style="margin-right: 6px;"></i>开始预测
                                </el-button>
                            </el-form-item>
                        </el-form>

                        <!-- 预测结果 -->
                        <el-alert v-if="predictionResult" title="预测结果" type="success" show-icon :closable="false" style="margin-top: 10px;">
                            <template #default>
                                <div style="font-size: 14px; line-height: 1.8;">
                                    <div><strong>作物：</strong>{{ predictionResult.cropName }}</div>
                                    <div><strong>预测产量：</strong><span style="color: #67c23a; font-size: 20px; font-weight: bold;">{{ predictionResult.predictedYield }} kg</span></div>
                                    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e1f3d8;">
                                        <div>基础产量 {{ form.baseYield }} kg x 环境 {{ (form.envScore * 100).toFixed(0) }}% x 农事 {{ (form.taskScore * 100).toFixed(0) }}% x 设备 {{ (form.deviceScore * 100).toFixed(0) }}%</div>
                                    </div>
                                </div>
                            </template>
                        </el-alert>
                    </el-card>
                </el-col>

                <!-- 右侧：预测历史和图表 -->
                <el-col :span="14">
                    <el-card shadow="hover" style="margin-bottom: 20px;">
                        <template #header>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center;">
                                    <i class="fas fa-chart-bar" style="margin-right: 8px; color: #e6a23c;"></i>
                                    <span style="font-weight: bold;">预测趋势</span>
                                </div>
                            </div>
                        </template>
                        <div ref="trendChart" style="height: 300px;"></div>
                    </el-card>

                    <el-card shadow="hover">
                        <template #header>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center;">
                                    <i class="fas fa-history" style="margin-right: 8px; color: #909399;"></i>
                                    <span style="font-weight: bold;">预测历史</span>
                                </div>
                                <el-button type="primary" plain size="small" @click="loadHistory">
                                    <i class="fas fa-sync-alt" style="margin-right: 4px;"></i>刷新
                                </el-button>
                            </div>
                        </template>
                        <el-table :data="historyData" stripe style="width: 100%;" v-loading="historyLoading">
                            <el-table-column prop="cropName" label="作物" width="80"></el-table-column>
                            <el-table-column prop="baseYield" label="基础产量(kg)" width="110"></el-table-column>
                            <el-table-column label="环境评分" width="90">
                                <template #default="{ row }">
                                    <el-tag :type="getScoreType(row.envScore)" size="small">{{ formatScore(row.envScore) }}</el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column label="农事评分" width="90">
                                <template #default="{ row }">
                                    <el-tag :type="getScoreType(row.taskScore)" size="small">{{ formatScore(row.taskScore) }}</el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column label="设备评分" width="90">
                                <template #default="{ row }">
                                    <el-tag :type="getScoreType(row.deviceScore)" size="small">{{ formatScore(row.deviceScore) }}</el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column label="预测产量(kg)" width="120">
                                <template #default="{ row }">
                                    <span style="color: #67c23a; font-weight: bold;">{{ row.predictedYield }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="createTime" label="预测时间" min-width="160">
                                <template #default="{ row }">
                                    {{ formatTime(row.createTime) }}
                                </template>
                            </el-table-column>
                        </el-table>
                        <el-pagination
                            v-if="totalHistory > pageSize"
                            style="margin-top: 15px; justify-content: center;"
                            layout="total, prev, pager, next"
                            :total="totalHistory"
                            :page-size="pageSize"
                            :current-page="currentPage"
                            @current-change="handlePageChange">
                        </el-pagination>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    `,

    setup() {
        const formRef = Vue.ref(null);
        const trendChart = Vue.ref(null);
        const loading = Vue.ref(false);
        const historyLoading = Vue.ref(false);
        const predictionResult = Vue.ref(null);
        const historyData = Vue.ref([]);
        const totalHistory = Vue.ref(0);
        const currentPage = Vue.ref(1);
        const pageSize = 10;

        const form = Vue.reactive({
            cropName: '水稻',
            baseYield: 5000,
            envScore: 0.85,
            taskScore: 0.90,
            deviceScore: 0.95
        });

        const rules = {
            cropName: [{ required: true, message: '请选择作物', trigger: 'change' }],
            baseYield: [{ required: true, message: '请输入基础产量', trigger: 'blur' }],
            envScore: [{ required: true, message: '请设置环境适宜度', trigger: 'change' }],
            taskScore: [{ required: true, message: '请设置农事完成率', trigger: 'change' }],
            deviceScore: [{ required: true, message: '请设置设备稳定系数', trigger: 'change' }]
        };

        const lastPrediction = Vue.computed(() => {
            return historyData.value.length > 0 ? historyData.value[0] : null;
        });

        const avgEnvScore = Vue.computed(() => {
            if (historyData.value.length === 0) return '--';
            const avg = historyData.value.reduce((sum, r) => sum + (r.envScore || 0), 0) / historyData.value.length;
            return (avg * 100).toFixed(0) + '%';
        });

        const getScoreType = (score) => {
            const normalized = score > 1 ? score : score * 100;
            if (normalized >= 80) return 'success';
            if (normalized >= 60) return 'warning';
            return 'danger';
        };

        const formatScore = (score) => {
            if (score == null) return '--';
            return score > 1 ? score.toFixed(0) + '%' : (score * 100).toFixed(0) + '%';
        };

        const formatTime = (time) => {
            if (!time) return '--';
            if (Array.isArray(time)) {
                const [y, m, d, h = 0, min = 0, s = 0] = time;
                return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0') + ' ' +
                       String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0') + ':' + String(s).padStart(2, '0');
            }
            return new Date(time).toLocaleString('zh-CN');
        };

        const handlePredict = async () => {
            if (!formRef.value) return;
            try {
                await formRef.value.validate();
            } catch {
                return;
            }

            loading.value = true;
            predictionResult.value = null;
            try {
                const response = await fetch('http://localhost:8080/api/statistics/yield-predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify(form)
                });
                const data = await response.json();
                if (data.code === 200) {
                    predictionResult.value = data.data;
                    ElMessage.success('预测完成，预测产量: ' + data.data.predictedYield + ' kg');
                    loadHistory();
                } else {
                    ElMessage.error(data.message || '预测失败');
                }
            } catch (e) {
                ElMessage.error('预测失败，请检查网络连接');
            } finally {
                loading.value = false;
            }
        };

        const loadHistory = async () => {
            historyLoading.value = true;
            try {
                const response = await fetch(
                    'http://localhost:8080/api/statistics/yield-predict/history?page=' + (currentPage.value - 1) + '&size=' + pageSize,
                    {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    }
                );
                const data = await response.json();
                if (data.code === 200 && data.data) {
                    historyData.value = data.data.content || [];
                    totalHistory.value = data.data.totalElements || 0;
                    renderTrendChart();
                }
            } catch (e) {
                console.error('加载预测历史失败', e);
            } finally {
                historyLoading.value = false;
            }
        };

        const handlePageChange = (page) => {
            currentPage.value = page;
            loadHistory();
        };

        let chartInstance = null;
        const renderTrendChart = () => {
            if (!trendChart.value || historyData.value.length === 0) return;

            if (!chartInstance) {
                chartInstance = echarts.init(trendChart.value);
            }

            const sorted = [...historyData.value].reverse();
            const labels = sorted.map(r => r.cropName + ' (' + formatTime(r.createTime).split(' ')[0] + ')');
            const yields = sorted.map(r => r.predictedYield);
            const baseYields = sorted.map(r => r.baseYield);

            chartInstance.setOption({
                tooltip: { trigger: 'axis' },
                legend: { data: ['预测产量', '基础产量'], top: 0 },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '40px', containLabel: true },
                xAxis: { type: 'category', data: labels, axisLabel: { rotate: 30, fontSize: 11 } },
                yAxis: { type: 'value', name: '产量(kg)' },
                series: [
                    {
                        name: '基础产量',
                        type: 'bar',
                        data: baseYields,
                        itemStyle: { color: '#dcdfe6' },
                        barWidth: '30%'
                    },
                    {
                        name: '预测产量',
                        type: 'line',
                        data: yields,
                        smooth: true,
                        itemStyle: { color: '#67c23a' },
                        areaStyle: { color: 'rgba(103,194,58,0.15)' },
                        markPoint: {
                            data: [
                                { type: 'max', name: '最大值' },
                                { type: 'min', name: '最小值' }
                            ]
                        }
                    }
                ]
            });
        };

        Vue.onMounted(() => {
            loadHistory();
            window.addEventListener('resize', () => {
                chartInstance && chartInstance.resize();
            });
        });

        Vue.onBeforeUnmount(() => {
            chartInstance && chartInstance.dispose();
        });

        return {
            formRef, trendChart, loading, historyLoading,
            form, rules, predictionResult,
            historyData, totalHistory, currentPage, pageSize,
            lastPrediction, avgEnvScore,
            getScoreType, formatScore, formatTime,
            handlePredict, loadHistory, handlePageChange
        };
    }
};
