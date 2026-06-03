const Dashboard = {
    template: `
        <div class="space-y-6">
            <!-- 系统状态卡片 -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div v-for="stat in stats" :key="stat.title"
                    class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500">{{ stat.title }}</p>
                            <p class="text-3xl font-bold" :class="stat.color">{{ stat.value }}</p>
                        </div>
                        <div class="w-12 h-12 rounded-full flex items-center justify-center" :class="stat.bgColor">
                            <i :class="stat.icon" class="text-xl text-white"></i>
                        </div>
                    </div>
                    <p class="text-xs text-gray-400 mt-2">{{ stat.desc }}</p>
                </div>
            </div>

            <!-- 快速操作 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold mb-4 text-gray-800">
                    <i class="fas fa-bolt mr-2 text-yellow-500"></i>快速操作
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button @click="initDevices"
                        class="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
                        <i class="fas fa-download text-2xl text-blue-500 mb-2"></i>
                        <p class="text-sm text-gray-700">初始化设备</p>
                    </button>
                    <button @click="initUsers"
                        class="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
                        <i class="fas fa-users text-2xl text-purple-500 mb-2"></i>
                        <p class="text-sm text-gray-700">初始化用户</p>
                    </button>
                    <button @click="collectData"
                        class="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
                        <i class="fas fa-database text-2xl text-green-500 mb-2"></i>
                        <p class="text-sm text-gray-700">采集环境数据</p>
                    </button>
                    <button @click="healthCheck"
                        class="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center">
                        <i class="fas fa-heartbeat text-2xl text-orange-500 mb-2"></i>
                        <p class="text-sm text-gray-700">系统健康检查</p>
                    </button>
                </div>
            </div>

            <!-- 最新环境数据 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800">
                        <i class="fas fa-thermometer-half mr-2 text-red-500"></i>环境数据
                    </h3>
                    <div v-if="envData" class="space-y-4">
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span class="text-gray-600">空气温度</span>
                            <span class="font-semibold text-red-500">{{ envData.airTemperature }}°C</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span class="text-gray-600">空气湿度</span>
                            <span class="font-semibold text-blue-500">{{ envData.airHumidity }}%</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span class="text-gray-600">土壤湿度</span>
                            <span class="font-semibold text-green-500">{{ envData.soilHumidity }}%</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span class="text-gray-600">光照强度</span>
                            <span class="font-semibold text-yellow-500">{{ envData.lightIntensity }} lux</span>
                        </div>
                    </div>
                    <div v-else class="text-center text-gray-400 py-8">
                        <i class="fas fa-inbox text-4xl mb-2"></i>
                        <p>暂无数据，请先采集环境数据</p>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800">
                        <i class="fas fa-cogs mr-2 text-blue-500"></i>设备状态
                    </h3>
                    <div v-if="devices.length" class="space-y-3">
                        <div v-for="device in devices.slice(0, 5)" :key="device.id"
                            class="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div>
                                <p class="font-medium text-gray-800">{{ device.deviceName }}</p>
                                <p class="text-xs text-gray-400">{{ device.deviceCode }}</p>
                            </div>
                            <span class="px-2 py-1 text-xs rounded-full"
                                :class="getStatusClass(device.status)">
                                {{ getStatusText(device.status) }}
                            </span>
                        </div>
                    </div>
                    <div v-else class="text-center text-gray-400 py-8">
                        <i class="fas fa-inbox text-4xl mb-2"></i>
                        <p>暂无设备，请先初始化设备</p>
                    </div>
                </div>
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
        const stats = Vue.ref([
            { title: '设备总数', value: '-', icon: 'fas fa-microchip', color: 'text-blue-600', bgColor: 'bg-blue-500', desc: '已注册设备数量' },
            { title: '运行中', value: '-', icon: 'fas fa-play-circle', color: 'text-green-600', bgColor: 'bg-green-500', desc: '正在运行的设备' },
            { title: '故障设备', value: '-', icon: 'fas fa-exclamation-triangle', color: 'text-red-600', bgColor: 'bg-red-500', desc: '需要维修的设备' },
            { title: '今日操作', value: '-', icon: 'fas fa-history', color: 'text-purple-600', bgColor: 'bg-purple-500', desc: '今日操作次数' }
        ]);

        const envData = Vue.ref(null);
        const devices = Vue.ref([]);
        const message = Vue.ref(null);

        const showMessage = (text, type = 'success') => {
            message.value = { text, type };
            setTimeout(() => message.value = null, 3000);
        };

        const getStatusClass = (status) => {
            const map = {
                'RUNNING': 'bg-green-100 text-green-800',
                'STANDBY': 'bg-gray-100 text-gray-800',
                'FAULT': 'bg-red-100 text-red-800',
                'MAINTENANCE': 'bg-yellow-100 text-yellow-800',
                'CALIBRATION': 'bg-blue-100 text-blue-800'
            };
            return map[status] || 'bg-gray-100 text-gray-800';
        };

        const getStatusText = (status) => {
            const map = {
                'RUNNING': '运行中',
                'STANDBY': '待机',
                'FAULT': '故障',
                'MAINTENANCE': '维护中',
                'CALIBRATION': '校准中'
            };
            return map[status] || status;
        };

        const loadData = async () => {
            try {
                const [overview, env, deviceList] = await Promise.all([
                    statisticsApi.getOverview().catch(() => null),
                    environmentApi.getLatest().catch(() => null),
                    deviceApi.getList().catch(() => [])
                ]);

                if (overview) {
                    stats.value[0].value = overview.deviceTotal || 0;
                    stats.value[1].value = overview.deviceRunning || 0;
                    stats.value[2].value = overview.deviceFault || 0;
                    stats.value[3].value = overview.todayOperations || 0;
                }

                envData.value = env;
                devices.value = deviceList || [];
            } catch (error) {
                console.error('Load data failed:', error);
            }
        };

        const initDevices = async () => {
            try {
                await systemApi.initDevices();
                showMessage('设备初始化成功');
                loadData();
            } catch (error) {
                showMessage('设备初始化失败: ' + error.message, 'error');
            }
        };

        const initUsers = async () => {
            try {
                await systemApi.initUsers();
                showMessage('用户初始化成功');
            } catch (error) {
                showMessage('用户初始化失败: ' + error.message, 'error');
            }
        };

        const collectData = async () => {
            try {
                await environmentApi.collectAndControl();
                showMessage('环境数据采集成功');
                loadData();
            } catch (error) {
                showMessage('数据采集失败: ' + error.message, 'error');
            }
        };

        const healthCheck = async () => {
            try {
                const result = await systemApi.health();
                showMessage('系统状态: ' + result.status);
            } catch (error) {
                showMessage('健康检查失败: ' + error.message, 'error');
            }
        };

        Vue.onMounted(() => {
            loadData();
        });

        return {
            stats,
            envData,
            devices,
            message,
            getStatusClass,
            getStatusText,
            initDevices,
            initUsers,
            collectData,
            healthCheck
        };
    }
};
