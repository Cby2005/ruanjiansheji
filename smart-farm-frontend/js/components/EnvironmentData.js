const EnvironmentData = {
    template: `
        <div class="space-y-6">
            <!-- 操作栏 -->
            <div class="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-800">
                    <i class="fas fa-leaf mr-2 text-green-500"></i>环境监测
                </h3>
                <div class="space-x-2">
                    <button @click="collectData"
                        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                        <i class="fas fa-download mr-2"></i>采集数据
                    </button>
                    <button @click="collectAndControl"
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                        <i class="fas fa-robot mr-2"></i>采集并自动控制
                    </button>
                </div>
            </div>

            <!-- 最新数据卡片 -->
            <div v-if="latestData" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-temperature-high text-red-500 text-xl"></i>
                        </div>
                        <span class="text-sm text-gray-400">空气温度</span>
                    </div>
                    <p class="text-3xl font-bold text-red-500">{{ latestData.airTemperature }}°C</p>
                    <p class="text-sm text-gray-400 mt-2">
                        <i class="fas fa-clock mr-1"></i>{{ formatTime(latestData.collectTime) }}
                    </p>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-tint text-blue-500 text-xl"></i>
                        </div>
                        <span class="text-sm text-gray-400">空气湿度</span>
                    </div>
                    <p class="text-3xl font-bold text-blue-500">{{ latestData.airHumidity }}%</p>
                    <p class="text-sm text-gray-400 mt-2">
                        <i class="fas fa-clock mr-1"></i>{{ formatTime(latestData.collectTime) }}
                    </p>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-seedling text-green-500 text-xl"></i>
                        </div>
                        <span class="text-sm text-gray-400">土壤湿度</span>
                    </div>
                    <p class="text-3xl font-bold text-green-500">{{ latestData.soilHumidity }}%</p>
                    <p class="text-sm text-gray-400 mt-2">
                        <i class="fas fa-clock mr-1"></i>{{ formatTime(latestData.collectTime) }}
                    </p>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-sun text-yellow-500 text-xl"></i>
                        </div>
                        <span class="text-sm text-gray-400">光照强度</span>
                    </div>
                    <p class="text-3xl font-bold text-yellow-500">{{ latestData.lightIntensity }} lux</p>
                    <p class="text-sm text-gray-400 mt-2">
                        <i class="fas fa-clock mr-1"></i>{{ formatTime(latestData.collectTime) }}
                    </p>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-wind text-purple-500 text-xl"></i>
                        </div>
                        <span class="text-sm text-gray-400">CO₂ 浓度</span>
                    </div>
                    <p class="text-3xl font-bold text-purple-500">{{ latestData.co2Concentration }} ppm</p>
                    <p class="text-sm text-gray-400 mt-2">
                        <i class="fas fa-clock mr-1"></i>{{ formatTime(latestData.collectTime) }}
                    </p>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-bug text-orange-500 text-xl"></i>
                        </div>
                        <span class="text-sm text-gray-400">虫情指数</span>
                    </div>
                    <p class="text-3xl font-bold" :class="latestData.pestCount > 10 ? 'text-red-500' : 'text-green-500'">
                        {{ latestData.pestCount }}
                    </p>
                    <p class="text-sm text-gray-400 mt-2">
                        <i class="fas fa-clock mr-1"></i>{{ formatTime(latestData.collectTime) }}
                    </p>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-if="!loading && !latestData"
                class="bg-white rounded-lg shadow-md p-12 text-center">
                <i class="fas fa-cloud-sun text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-lg">暂无环境数据</p>
                <p class="text-gray-400 text-sm mt-2">请点击"采集数据"按钮获取环境信息</p>
            </div>

            <!-- 历史数据表格 -->
            <div v-if="historyData.length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="p-4 border-b">
                    <h4 class="font-semibold text-gray-800">
                        <i class="fas fa-history mr-2 text-gray-500"></i>历史数据
                    </h4>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">采集时间</th>
                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">温度(°C)</th>
                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">空气湿度(%)</th>
                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">土壤湿度(%)</th>
                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">光照(lux)</th>
                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">CO₂(ppm)</th>
                                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">虫情</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y">
                            <tr v-for="record in historyData.slice(0, 10)" :key="record.id"
                                class="hover:bg-gray-50">
                                <td class="px-4 py-3 text-sm text-gray-600">{{ formatTime(record.collectTime) }}</td>
                                <td class="px-4 py-3 text-sm text-gray-800">{{ record.airTemperature }}</td>
                                <td class="px-4 py-3 text-sm text-gray-800">{{ record.airHumidity }}</td>
                                <td class="px-4 py-3 text-sm text-gray-800">{{ record.soilHumidity }}</td>
                                <td class="px-4 py-3 text-sm text-gray-800">{{ record.lightIntensity }}</td>
                                <td class="px-4 py-3 text-sm text-gray-800">{{ record.co2Concentration }}</td>
                                <td class="px-4 py-3 text-sm" :class="record.pestCount > 10 ? 'text-red-500' : 'text-green-500'">
                                    {{ record.pestCount }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 加载状态 -->
            <div v-if="loading" class="text-center py-12">
                <i class="fas fa-spinner fa-spin text-4xl text-green-500"></i>
                <p class="text-gray-500 mt-4">采集中...</p>
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
        const latestData = Vue.ref(null);
        const historyData = Vue.ref([]);
        const loading = Vue.ref(false);
        const message = Vue.ref(null);

        const showMessage = (text, type = 'success') => {
            message.value = { text, type };
            setTimeout(() => message.value = null, 3000);
        };

        const formatTime = (time) => {
            if (!time) return '-';
            const date = new Date(time);
            return date.toLocaleString('zh-CN');
        };

        const loadData = async () => {
            try {
                const [latest, list] = await Promise.all([
                    environmentApi.getLatest().catch(() => null),
                    environmentApi.getList().catch(() => [])
                ]);
                latestData.value = latest;
                historyData.value = list || [];
            } catch (error) {
                console.error('Load environment data failed:', error);
            }
        };

        const collectData = async () => {
            loading.value = true;
            try {
                await environmentApi.collect();
                showMessage('环境数据采集成功');
                loadData();
            } catch (error) {
                showMessage('数据采集失败: ' + error.message, 'error');
            } finally {
                loading.value = false;
            }
        };

        const collectAndControl = async () => {
            loading.value = true;
            try {
                const result = await environmentApi.collectAndControl();
                showMessage('数据采集成功，已触发自动控制');
                loadData();
            } catch (error) {
                showMessage('采集失败: ' + error.message, 'error');
            } finally {
                loading.value = false;
            }
        };

        Vue.onMounted(() => {
            loadData();
        });

        return {
            latestData,
            historyData,
            loading,
            message,
            formatTime,
            collectData,
            collectAndControl
        };
    }
};
