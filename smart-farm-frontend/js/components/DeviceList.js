const DeviceList = {
    template: `
        <div class="space-y-6">
            <!-- 操作栏 -->
            <div class="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-800">
                    <i class="fas fa-microchip mr-2 text-blue-500"></i>设备列表
                </h3>
                <button @click="loadDevices"
                    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    <i class="fas fa-sync-alt mr-2"></i>刷新
                </button>
            </div>

            <!-- 设备列表 -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="device in devices" :key="device.id"
                    class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <!-- 设备头部 -->
                    <div class="p-4 border-b"
                        :class="getStatusHeaderClass(device.state)">
                        <div class="flex justify-between items-center">
                            <div>
                                <h4 class="font-semibold text-gray-800">{{ device.deviceName }}</h4>
                                <p class="text-sm text-gray-500">{{ device.deviceCode }}</p>
                            </div>
                            <span class="px-3 py-1 text-sm rounded-full"
                                :class="getStatusClass(device.state)">
                                {{ getStatusText(device.state) }}
                            </span>
                        </div>
                    </div>

                    <!-- 设备信息 -->
                    <div class="p-4 space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">设备类型</span>
                            <span class="text-gray-800">{{ device.deviceType }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">安装区域</span>
                            <span class="text-gray-800">{{ device.area || '-' }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">在线状态</span>
                            <span class="text-gray-800">
                                <i class="fas fa-circle mr-1" :class="device.online ? 'text-green-500' : 'text-red-500'"></i>
                                {{ device.online ? '在线' : '离线' }}
                            </span>
                        </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="p-4 bg-gray-50 flex flex-wrap gap-2">
                        <button @click="startDevice(device)"
                            :disabled="device.state !== 'STANDBY'"
                            class="px-3 py-1 text-sm rounded transition-colors"
                            :class="device.state === 'STANDBY' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'">
                            <i class="fas fa-play mr-1"></i>启动
                        </button>
                        <button @click="stopDevice(device)"
                            :disabled="device.state !== 'RUNNING'"
                            class="px-3 py-1 text-sm rounded transition-colors"
                            :class="device.state === 'RUNNING' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'">
                            <i class="fas fa-stop mr-1"></i>停止
                        </button>
                        <button @click="maintainDevice(device)"
                            :disabled="device.state !== 'FAULT' && device.state !== 'STANDBY'"
                            class="px-3 py-1 text-sm rounded transition-colors"
                            :class="(device.state === 'FAULT' || device.state === 'STANDBY') ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'">
                            <i class="fas fa-wrench mr-1"></i>维护
                        </button>
                        <button @click="showDetail(device)"
                            class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            <i class="fas fa-info-circle mr-1"></i>详情
                        </button>
                    </div>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-if="!loading && devices.length === 0"
                class="bg-white rounded-lg shadow-md p-12 text-center">
                <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-lg">暂无设备数据</p>
                <p class="text-gray-400 text-sm mt-2">请先在系统总览中初始化设备</p>
            </div>

            <!-- 加载状态 -->
            <div v-if="loading" class="text-center py-12">
                <i class="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
                <p class="text-gray-500 mt-4">加载中...</p>
            </div>

            <!-- 设备详情弹窗 -->
            <div v-if="selectedDevice" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-semibold text-gray-800">设备详情</h3>
                            <button @click="selectedDevice = null" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div class="space-y-3">
                            <div class="flex justify-between py-2 border-b">
                                <span class="text-gray-500">设备编号</span>
                                <span class="font-medium">{{ selectedDevice.deviceCode }}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b">
                                <span class="text-gray-500">设备名称</span>
                                <span class="font-medium">{{ selectedDevice.deviceName }}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b">
                                <span class="text-gray-500">设备类型</span>
                                <span class="font-medium">{{ selectedDevice.deviceType }}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b">
                                <span class="text-gray-500">当前状态</span>
                                <span class="px-2 py-1 text-sm rounded-full"
                                    :class="getStatusClass(selectedDevice.state)">
                                    {{ getStatusText(selectedDevice.state) }}
                                </span>
                            </div>
                            <div class="flex justify-between py-2 border-b">
                                <span class="text-gray-500">安装区域</span>
                                <span class="font-medium">{{ selectedDevice.area || '-' }}</span>
                            </div>
                            <div class="flex justify-between py-2">
                                <span class="text-gray-500">在线状态</span>
                                <span class="font-medium">
                                    <i class="fas fa-circle mr-1" :class="selectedDevice.online ? 'text-green-500' : 'text-red-500'"></i>
                                    {{ selectedDevice.online ? '在线' : '离线' }}
                                </span>
                            </div>
                        </div>
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
        const devices = Vue.ref([]);
        const loading = Vue.ref(false);
        const selectedDevice = Vue.ref(null);
        const message = Vue.ref(null);

        const showMessage = (text, type = 'success') => {
            message.value = { text, type };
            setTimeout(() => message.value = null, 3000);
        };

        const getStatusClass = (state) => {
            const map = {
                'RUNNING': 'bg-green-100 text-green-800',
                'STANDBY': 'bg-gray-100 text-gray-800',
                'FAULT': 'bg-red-100 text-red-800',
                'MAINTENANCE': 'bg-yellow-100 text-yellow-800',
                'CALIBRATION': 'bg-blue-100 text-blue-800'
            };
            return map[state] || 'bg-gray-100 text-gray-800';
        };

        const getStatusHeaderClass = (state) => {
            const map = {
                'RUNNING': 'bg-green-50',
                'STANDBY': 'bg-gray-50',
                'FAULT': 'bg-red-50',
                'MAINTENANCE': 'bg-yellow-50',
                'CALIBRATION': 'bg-blue-50'
            };
            return map[state] || 'bg-gray-50';
        };

        const getStatusText = (state) => {
            const map = {
                'RUNNING': '运行中',
                'STANDBY': '待机',
                'FAULT': '故障',
                'MAINTENANCE': '维护中',
                'CALIBRATION': '校准中'
            };
            return map[state] || state;
        };

        const loadDevices = async () => {
            loading.value = true;
            try {
                devices.value = await deviceApi.getList();
            } catch (error) {
                showMessage('加载设备列表失败: ' + error.message, 'error');
            } finally {
                loading.value = false;
            }
        };

        const startDevice = async (device) => {
            try {
                await deviceApi.start(device.deviceCode);
                showMessage(`${device.deviceName} 已启动`);
                loadDevices();
            } catch (error) {
                showMessage('启动失败: ' + error.message, 'error');
            }
        };

        const stopDevice = async (device) => {
            try {
                await deviceApi.stop(device.deviceCode);
                showMessage(`${device.deviceName} 已停止`);
                loadDevices();
            } catch (error) {
                showMessage('停止失败: ' + error.message, 'error');
            }
        };

        const maintainDevice = async (device) => {
            try {
                await deviceApi.maintain(device.deviceCode);
                showMessage(`${device.deviceName} 已进入维护模式`);
                loadDevices();
            } catch (error) {
                showMessage('维护失败: ' + error.message, 'error');
            }
        };

        const showDetail = (device) => {
            selectedDevice.value = device;
        };

        Vue.onMounted(() => {
            loadDevices();
        });

        return {
            devices,
            loading,
            selectedDevice,
            message,
            getStatusClass,
            getStatusHeaderClass,
            getStatusText,
            loadDevices,
            startDevice,
            stopDevice,
            maintainDevice,
            showDetail
        };
    }
};
