const Statistics = {
    template: `
        <div class="space-y-6">
            <!-- 统计概览 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- 设备统计 -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800">
                        <i class="fas fa-microchip mr-2 text-blue-500"></i>设备统计
                    </h3>
                    <div v-if="deviceStats" class="space-y-4">
                        <div class="flex justify-between items-center p-3 bg-blue-50 rounded">
                            <span class="text-gray-600">设备总数</span>
                            <span class="text-2xl font-bold text-blue-600">{{ deviceStats.total }}</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-green-50 rounded">
                            <span class="text-gray-600">在线设备</span>
                            <span class="text-2xl font-bold text-green-600">{{ deviceStats.online }}</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-yellow-50 rounded">
                            <span class="text-gray-600">运行中</span>
                            <span class="text-2xl font-bold text-yellow-600">{{ deviceStats.running }}</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-red-50 rounded">
                            <span class="text-gray-600">故障设备</span>
                            <span class="text-2xl font-bold text-red-600">{{ deviceStats.fault }}</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-purple-50 rounded">
                            <span class="text-gray-600">今日操作</span>
                            <span class="text-2xl font-bold text-purple-600">{{ deviceStats.todayOperations }}</span>
                        </div>
                    </div>
                    <div v-else class="text-center text-gray-400 py-8">
                        <i class="fas fa-spinner fa-spin text-4xl"></i>
                    </div>
                </div>

                <!-- 环境统计 -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800">
                        <i class="fas fa-leaf mr-2 text-green-500"></i>环境统计
                    </h3>
                    <div v-if="envStats" class="space-y-4">
                        <div class="flex justify-between items-center p-3 bg-red-50 rounded">
                            <span class="text-gray-600">平均温度</span>
                            <span class="text-2xl font-bold text-red-600">{{ envStats.avgTemperature }}°C</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-blue-50 rounded">
                            <span class="text-gray-600">平均湿度</span>
                            <span class="text-2xl font-bold text-blue-600">{{ envStats.avgHumidity }}%</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-green-50 rounded">
                            <span class="text-gray-600">平均土壤湿度</span>
                            <span class="text-2xl font-bold text-green-600">{{ envStats.avgSoilHumidity }}%</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-yellow-50 rounded">
                            <span class="text-gray-600">平均光照</span>
                            <span class="text-2xl font-bold text-yellow-600">{{ envStats.avgLight }} lux</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-orange-50 rounded">
                            <span class="text-gray-600">最大虫情指数</span>
                            <span class="text-2xl font-bold text-orange-600">{{ envStats.maxPest }}</span>
                        </div>
                    </div>
                    <div v-else class="text-center text-gray-400 py-8">
                        <i class="fas fa-spinner fa-spin text-4xl"></i>
                    </div>
                </div>
            </div>

            <!-- 产量预测 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold mb-4 text-gray-800">
                    <i class="fas fa-chart-line mr-2 text-purple-500"></i>产量预测
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">作物名称</label>
                            <input v-model="yieldForm.cropName"
                                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="例：番茄">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">基础产量 (kg/亩)</label>
                            <input v-model.number="yieldForm.baseYield" type="number"
                                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="例：5000">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">环境适宜度 (0-1)</label>
                            <input v-model.number="yieldForm.envScore" type="number" step="0.1" min="0" max="1"
                                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="例：0.85">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">农事完成率 (0-1)</label>
                            <input v-model.number="yieldForm.taskScore" type="number" step="0.1" min="0" max="1"
                                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="例：0.9">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">设备稳定系数 (0-1)</label>
                            <input v-model.number="yieldForm.deviceScore" type="number" step="0.1" min="0" max="1"
                                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="例：0.95">
                        </div>
                        <button @click="predictYield"
                            class="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                            <i class="fas fa-calculator mr-2"></i>计算预测产量
                        </button>
                    </div>
                    <div class="flex items-center justify-center">
                        <div v-if="yieldResult" class="text-center p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
                            <p class="text-gray-500 mb-2">预测产量</p>
                            <p class="text-5xl font-bold text-purple-600">{{ yieldResult.predictedYield }}</p>
                            <p class="text-gray-500 mt-2">kg/亩</p>
                            <div class="mt-4 text-sm text-gray-400">
                                <p>作物：{{ yieldResult.cropName }}</p>
                                <p>计算公式：基础产量 × 环境适宜度 × 农事完成率 × 设备稳定系数</p>
                            </div>
                        </div>
                        <div v-else class="text-center text-gray-400">
                            <i class="fas fa-calculator text-6xl mb-4"></i>
                            <p>填写参数后点击计算</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 加载状态 -->
            <div v-if="loading" class="text-center py-12">
                <i class="fas fa-spinner fa-spin text-4xl text-purple-500"></i>
                <p class="text-gray-500 mt-4">加载中...</p>
            </div>

            <!-- 消息提示 -->
            <div v-if="message" class="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg"
                :class="message.type === 'success' ? 'bg-green-500' : 'bg-red-500'">
                <div class="flex items-center text-white">
                    <i :class="message.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"
                        class="mr-2"></i>
                    <span>{{ message.text }}</span>
                </div>
            </div>
        </div>
    `,

    setup() {
        const deviceStats = Vue.ref(null);
        const envStats = Vue.ref(null);
        const loading = Vue.ref(false);
        const message = Vue.ref(null);
        const yieldResult = Vue.ref(null);

        const yieldForm = Vue.reactive({
            cropName: '番茄',
            baseYield: 5000,
            envScore: 0.85,
            taskScore: 0.9,
            deviceScore: 0.95
        });

        const showMessage = (text, type = 'success') => {
            message.value = { text, type };
            setTimeout(() => message.value = null, 3000);
        };

        const loadStats = async () => {
            loading.value = true;
            try {
                const [devStats, envSummary] = await Promise.all([
                    statisticsApi.getDeviceSummary().catch(() => null),
                    statisticsApi.getEnvironmentSummary().catch(() => null)
                ]);

                if (devStats) {
                    deviceStats.value = {
                        total: devStats.deviceTotal || 0,
                        online: devStats.deviceOnline || 0,
                        running: devStats.deviceRunning || 0,
                        fault: devStats.deviceFault || 0,
                        todayOperations: devStats.todayOperations || 0
                    };
                }

                if (envSummary) {
                    envStats.value = {
                        avgTemperature: envSummary.avgAirTemperature || 0,
                        avgHumidity: envSummary.avgAirHumidity || 0,
                        avgSoilHumidity: envSummary.avgSoilHumidity || 0,
                        avgLight: envSummary.avgLightIntensity || 0,
                        maxPest: envSummary.maxPestCount || 0
                    };
                }
            } catch (error) {
                console.error('Load stats failed:', error);
            } finally {
                loading.value = false;
            }
        };

        const predictYield = async () => {
            if (!yieldForm.cropName || !yieldForm.baseYield) {
                showMessage('请填写作物名称和基础产量', 'error');
                return;
            }

            try {
                const result = await statisticsApi.predictYield(yieldForm);
                yieldResult.value = result;
                showMessage('产量预测计算完成');
            } catch (error) {
                showMessage('预测失败: ' + error.message, 'error');
            }
        };

        Vue.onMounted(() => {
            loadStats();
        });

        return {
            deviceStats,
            envStats,
            loading,
            message,
            yieldForm,
            yieldResult,
            predictYield
        };
    }
};
