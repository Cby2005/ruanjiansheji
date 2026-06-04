const DeviceList = {
    template: `
        <div>
            <!-- 查询条件 -->
            <el-card shadow="hover" style="margin-bottom: 20px;">
                <el-form :inline="true" :model="queryForm">
                    <el-form-item label="设备名称">
                        <el-input v-model="queryForm.name" placeholder="请输入设备名称" clearable size="default" style="width: 200px;"></el-input>
                    </el-form-item>
                    <el-form-item label="设备状态">
                        <el-select v-model="queryForm.state" placeholder="全部状态" clearable size="default" style="width: 150px;">
                            <el-option label="运行中" value="RUNNING"></el-option>
                            <el-option label="待机" value="STANDBY"></el-option>
                            <el-option label="故障" value="FAULT"></el-option>
                            <el-option label="维护中" value="MAINTENANCE"></el-option>
                            <el-option label="校准中" value="CALIBRATION"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="loadDevices"><i class="fas fa-search" style="margin-right: 6px;"></i>查询</el-button>
                    </el-form-item>
                </el-form>
            </el-card>

            <!-- 设备卡片 -->
            <el-row :gutter="20">
                <el-col :span="8" v-for="device in filteredDevices" :key="device.deviceCode" style="margin-bottom: 20px;">
                    <el-card class="device-card" shadow="hover">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                            <div>
                                <h3 style="margin: 0 0 5px 0; font-size: 16px;">{{ device.deviceName }}</h3>
                                <p style="margin: 0; color: #909399; font-size: 12px;">{{ device.deviceCode }}</p>
                            </div>
                            <span class="device-status" :class="'status-' + device.state.toLowerCase()">
                                {{ getStatusText(device.state) }}
                            </span>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <el-descriptions :column="1" size="small" border>
                                <el-descriptions-item label="设备类型">{{ device.deviceType }}</el-descriptions-item>
                                <el-descriptions-item label="安装区域">{{ device.area || '未分配' }}</el-descriptions-item>
                                <el-descriptions-item label="在线状态">
                                    <el-tag :type="device.online ? 'success' : 'danger'" size="small">
                                        {{ device.online ? '在线' : '离线' }}
                                    </el-tag>
                                </el-descriptions-item>
                            </el-descriptions>
                        </div>
                        <el-divider style="margin: 10px 0;"></el-divider>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <el-button v-if="device.state === 'STANDBY' && canStart" type="success" size="small" @click="startDevice(device)">
                                <i class="fas fa-play" style="margin-right: 4px;"></i>启动
                            </el-button>
                            <el-button v-if="device.state === 'RUNNING' && canStop" type="danger" size="small" @click="confirmStop(device)">
                                <i class="fas fa-stop" style="margin-right: 4px;"></i>停止
                            </el-button>
                            <el-button v-if="(device.state === 'FAULT' || device.state === 'STANDBY') && canMaintain" type="warning" size="small" @click="maintainDevice(device)">
                                <i class="fas fa-wrench" style="margin-right: 4px;"></i>维护
                            </el-button>
                            <el-button v-if="device.state === 'RUNNING' && canFault" type="info" size="small" @click="confirmFault(device)">
                                <i class="fas fa-exclamation-triangle" style="margin-right: 4px;"></i>标记故障
                            </el-button>
                            <el-button v-if="device.state === 'MAINTENANCE' && canMaintain" type="success" size="small" @click="startDevice(device)">
                                <i class="fas fa-check" style="margin-right: 4px;"></i>完成维护
                            </el-button>
                            <el-button v-if="device.state === 'STANDBY' && canCalibrate" type="primary" size="small" plain @click="calibrateDevice(device)">
                                <i class="fas fa-ruler" style="margin-right: 4px;"></i>校准
                            </el-button>
                            <span v-if="!canStart && !canMaintain" style="color: #909399; font-size: 12px; line-height: 32px;">当前角色无设备控制权限</span>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <el-empty v-if="filteredDevices.length === 0" description="暂无设备数据"></el-empty>
        </div>
    `,

    setup() {
        const API_BASE_URL = 'http://localhost:8080';
        const devices = Vue.ref([]);
        const queryForm = Vue.reactive({ name: '', state: '' });

        const filteredDevices = Vue.computed(() => {
            return devices.value.filter(d => {
                if (queryForm.name && !d.deviceName.includes(queryForm.name)) return false;
                if (queryForm.state && d.state !== queryForm.state) return false;
                return true;
            });
        });

        const getStatusText = (state) => {
            const map = { 'RUNNING': '运行中', 'STANDBY': '待机', 'FAULT': '故障', 'MAINTENANCE': '维护中', 'CALIBRATION': '校准中' };
            return map[state] || state;
        };

        const getHeaders = () => ({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        });

        const userRole = Vue.computed(() => {
            try { return JSON.parse(localStorage.getItem('user') || '{}').role || 'VIEWER'; } catch { return 'VIEWER'; }
        });

        // 操作权限判断：ADMIN全部，TECHNICIAN可启停维护校准，OPERATOR仅启停，VIEWER只读
        const canStart = Vue.computed(() => ['ADMIN', 'TECHNICIAN', 'OPERATOR'].includes(userRole.value));
        const canStop = Vue.computed(() => ['ADMIN', 'TECHNICIAN', 'OPERATOR'].includes(userRole.value));
        const canMaintain = Vue.computed(() => ['ADMIN', 'TECHNICIAN'].includes(userRole.value));
        const canFault = Vue.computed(() => ['ADMIN', 'TECHNICIAN'].includes(userRole.value));
        const canCalibrate = Vue.computed(() => ['ADMIN', 'TECHNICIAN'].includes(userRole.value));

        const loadDevices = async () => {
            try {
                const res = await fetch(API_BASE_URL + '/api/devices/list', { headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200) devices.value = data.data;
            } catch (e) {
                console.error(e);
            }
        };

        const startDevice = async (device) => {
            try {
                const res = await fetch(API_BASE_URL + '/api/devices/' + device.deviceCode + '/start', { method: 'POST', headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200) {
                    ElementPlus.ElMessage.success(device.deviceName + ' 已启动');
                    loadDevices();
                } else {
                    ElementPlus.ElMessage.error(data.message);
                }
            } catch (e) {
                ElementPlus.ElMessage.error('操作失败');
            }
        };

        const confirmStop = (device) => {
            ElementPlus.ElMessageBox.confirm(
                '确定要停止设备「' + device.deviceName + '」吗？',
                '确认停止',
                { confirmButtonText: '确定停止', cancelButtonText: '取消', type: 'warning' }
            ).then(() => stopDevice(device)).catch(() => {});
        };

        const stopDevice = async (device) => {
            try {
                const res = await fetch(API_BASE_URL + '/api/devices/' + device.deviceCode + '/stop', { method: 'POST', headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200) {
                    ElementPlus.ElMessage.success(device.deviceName + ' 已停止');
                    loadDevices();
                } else {
                    ElementPlus.ElMessage.error(data.message);
                }
            } catch (e) {
                ElementPlus.ElMessage.error('操作失败');
            }
        };

        const confirmFault = (device) => {
            ElementPlus.ElMessageBox.confirm(
                '确定要将设备「' + device.deviceName + '」标记为故障吗？',
                '确认标记故障',
                { confirmButtonText: '确定', cancelButtonText: '取消', type: 'error' }
            ).then(() => markFault(device)).catch(() => {});
        };

        const markFault = async (device) => {
            try {
                const res = await fetch(API_BASE_URL + '/api/devices/' + device.deviceCode + '/fault', { method: 'POST', headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200) {
                    ElementPlus.ElMessage.success(device.deviceName + ' 已标记故障');
                    loadDevices();
                } else {
                    ElementPlus.ElMessage.error(data.message);
                }
            } catch (e) {
                ElementPlus.ElMessage.error('操作失败');
            }
        };

        const maintainDevice = async (device) => {
            try {
                const res = await fetch(API_BASE_URL + '/api/devices/' + device.deviceCode + '/maintain', { method: 'POST', headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200) {
                    ElementPlus.ElMessage.success(device.deviceName + ' 已进入维护模式');
                    loadDevices();
                } else {
                    ElementPlus.ElMessage.error(data.message);
                }
            } catch (e) {
                ElementPlus.ElMessage.error('操作失败');
            }
        };

        const calibrateDevice = async (device) => {
            try {
                const res = await fetch(API_BASE_URL + '/api/devices/' + device.deviceCode + '/calibrate', { method: 'POST', headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200) {
                    ElementPlus.ElMessage.success(device.deviceName + ' 已开始校准');
                    loadDevices();
                } else {
                    ElementPlus.ElMessage.error(data.message);
                }
            } catch (e) {
                ElementPlus.ElMessage.error('操作失败');
            }
        };

        Vue.onMounted(() => loadDevices());

        return {
            devices, queryForm, filteredDevices, getStatusText,
            loadDevices, startDevice, confirmStop, confirmFault,
            maintainDevice, calibrateDevice,
            canStart, canStop, canMaintain, canFault, canCalibrate
        };
    }
};
