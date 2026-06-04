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
                        <el-button v-if="canManageDevice" type="success" plain @click="openDeviceDialog()"><i class="fas fa-plus" style="margin-right: 6px;"></i>新增设备</el-button>
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
                            <el-button type="primary" size="small" plain @click="openPatternDialog(device)">
                                <i class="fas fa-cubes" style="margin-right: 4px;"></i>模式
                            </el-button>
                            <el-button v-if="canManageDevice" type="warning" size="small" plain @click="openDeviceDialog(device)">
                                <i class="fas fa-edit" style="margin-right: 4px;"></i>编辑
                            </el-button>
                            <el-button v-if="canManageDevice" type="danger" size="small" plain @click="deleteDevice(device)">
                                <i class="fas fa-trash" style="margin-right: 4px;"></i>删除
                            </el-button>
                            <span v-if="!canStart && !canMaintain" style="color: #909399; font-size: 12px; line-height: 32px;">当前角色无设备控制权限</span>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <el-empty v-if="filteredDevices.length === 0" description="暂无设备数据"></el-empty>

            <el-dialog v-model="deviceDialogVisible" :title="editingDevice ? '编辑设备' : '新增设备'" width="520px">
                <el-form :model="deviceForm" label-width="100px">
                    <el-form-item label="设备编号">
                        <el-input v-model="deviceForm.deviceCode" :disabled="!!editingDevice" placeholder="DEV-IRR-003"></el-input>
                    </el-form-item>
                    <el-form-item label="设备名称">
                        <el-input v-model="deviceForm.deviceName" placeholder="请输入设备名称"></el-input>
                    </el-form-item>
                    <el-form-item label="设备类型">
                        <el-select v-model="deviceForm.deviceType" style="width: 100%;">
                            <el-option label="灌溉阀" value="灌溉阀"></el-option>
                            <el-option label="通风风扇" value="通风风扇"></el-option>
                            <el-option label="补光灯" value="补光灯"></el-option>
                            <el-option label="卷帘" value="卷帘"></el-option>
                            <el-option label="加热器" value="加热器"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="安装区域">
                        <el-input v-model="deviceForm.area" placeholder="例如：A区1号温室"></el-input>
                    </el-form-item>
                    <el-form-item label="在线状态">
                        <el-switch v-model="deviceForm.online" active-text="在线" inactive-text="离线"></el-switch>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <el-button @click="deviceDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveDevice">保存</el-button>
                </template>
            </el-dialog>

            <el-dialog v-model="patternDialogVisible" title="设备设计模式演示" width="760px">
                <el-alert
                    v-if="selectedDevice"
                    :title="'当前设备：' + selectedDevice.deviceName + '（' + selectedDevice.deviceCode + '）'"
                    type="info"
                    show-icon
                    :closable="false"
                    style="margin-bottom: 16px;">
                </el-alert>

                <el-tabs>
                    <el-tab-pane label="命令模式">
                        <el-form :inline="true" size="small">
                            <el-form-item label="命令">
                                <el-select v-model="commandType" style="width: 190px;">
                                    <el-option label="开启灌溉" value="OPEN_IRRIGATION"></el-option>
                                    <el-option label="关闭灌溉" value="CLOSE_IRRIGATION"></el-option>
                                    <el-option label="启动风机" value="START_FAN"></el-option>
                                    <el-option label="停止风机" value="STOP_FAN"></el-option>
                                    <el-option label="调节补光" value="ADJUST_LIGHT"></el-option>
                                    <el-option label="升起卷帘" value="LIFT_ROLLER"></el-option>
                                    <el-option label="放下卷帘" value="LOWER_ROLLER"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" :loading="patternLoading" @click="addCommand">加入队列</el-button>
                                <el-button type="success" :loading="patternLoading" @click="executeCommands">执行队列</el-button>
                                <el-button type="warning" :loading="patternLoading" @click="undoCommand">撤销上一步</el-button>
                                <el-button plain :loading="patternLoading" @click="loadQueueStatus">队列状态</el-button>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                    <el-tab-pane label="代理模式">
                        <el-form :inline="true" size="small">
                            <el-form-item label="远程用户">
                                <el-select v-model="remoteUser" style="width: 140px;">
                                    <el-option label="admin" value="admin"></el-option>
                                    <el-option label="tech" value="tech"></el-option>
                                    <el-option label="operator" value="operator"></el-option>
                                    <el-option label="viewer" value="viewer"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" :loading="patternLoading" @click="remoteControl">远程控制校验</el-button>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                    <el-tab-pane label="装饰器模式">
                        <el-button type="primary" :loading="patternLoading" @click="decoratorDemo">查看设备增强能力</el-button>
                        <span style="margin-left: 10px; color: #909399;">能耗监测、故障预测、运行统计可动态叠加</span>
                    </el-tab-pane>
                </el-tabs>
                <el-input type="textarea" :rows="8" readonly :model-value="patternLog" style="margin-top: 12px;"></el-input>
            </el-dialog>
        </div>
    `,

    setup() {
        const API_BASE_URL = 'http://localhost:8080';
        const devices = Vue.ref([]);
        const queryForm = Vue.reactive({ name: '', state: '' });
        const deviceDialogVisible = Vue.ref(false);
        const patternDialogVisible = Vue.ref(false);
        const editingDevice = Vue.ref(null);
        const selectedDevice = Vue.ref(null);
        const deviceForm = Vue.reactive({ deviceCode: '', deviceName: '', deviceType: '灌溉阀', area: '', online: true });
        const commandType = Vue.ref('OPEN_IRRIGATION');
        const remoteUser = Vue.ref('admin');
        const patternLog = Vue.ref('请选择设备后运行命令、代理或装饰器模式演示。');
        const patternLoading = Vue.ref(false);

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
        const canManageDevice = Vue.computed(() => ['ADMIN', 'TECHNICIAN'].includes(userRole.value));

        const loadDevices = async () => {
            try {
                const res = await fetch(API_BASE_URL + '/api/devices/list', { headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200) devices.value = data.data;
            } catch (e) {
                console.error(e);
            }
        };

        const resetDeviceForm = () => {
            deviceForm.deviceCode = 'DEV-DEMO-' + String(Date.now()).slice(-5);
            deviceForm.deviceName = '';
            deviceForm.deviceType = '灌溉阀';
            deviceForm.area = '';
            deviceForm.online = true;
        };

        const openDeviceDialog = (device) => {
            editingDevice.value = device || null;
            if (device) {
                deviceForm.deviceCode = device.deviceCode;
                deviceForm.deviceName = device.deviceName;
                deviceForm.deviceType = device.deviceType;
                deviceForm.area = device.area || '';
                deviceForm.online = device.online !== false;
            } else {
                resetDeviceForm();
            }
            deviceDialogVisible.value = true;
        };

        const saveDevice = async () => {
            if (!deviceForm.deviceCode || !deviceForm.deviceName) {
                ElementPlus.ElMessage.warning('请填写设备编号和设备名称');
                return;
            }
            const payload = {
                deviceCode: deviceForm.deviceCode,
                deviceName: deviceForm.deviceName,
                deviceType: deviceForm.deviceType,
                area: deviceForm.area,
                online: deviceForm.online
            };
            const url = editingDevice.value
                ? API_BASE_URL + '/api/devices/' + editingDevice.value.deviceCode
                : API_BASE_URL + '/api/devices';
            const method = editingDevice.value ? 'PUT' : 'POST';
            try {
                const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(payload) });
                const data = await res.json();
                if (data.code === 200) {
                    ElementPlus.ElMessage.success('设备保存成功');
                    deviceDialogVisible.value = false;
                    loadDevices();
                } else {
                    ElementPlus.ElMessage.error(data.message || '设备保存失败');
                }
            } catch (e) {
                ElementPlus.ElMessage.error('设备保存失败');
            }
        };

        const deleteDevice = (device) => {
            ElementPlus.ElMessageBox.confirm(
                '确定删除设备「' + device.deviceName + '」吗？',
                '确认删除',
                { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
            ).then(async () => {
                try {
                    const res = await fetch(API_BASE_URL + '/api/devices/' + device.deviceCode, { method: 'DELETE', headers: getHeaders() });
                    const data = await res.json();
                    if (data.code === 200) {
                        ElementPlus.ElMessage.success('设备已删除');
                        loadDevices();
                    } else {
                        ElementPlus.ElMessage.error(data.message || '删除失败');
                    }
                } catch (e) {
                    ElementPlus.ElMessage.error('删除失败');
                }
            }).catch(() => {});
        };

        const openPatternDialog = (device) => {
            selectedDevice.value = device;
            patternLog.value = '已选择设备：' + device.deviceCode + '。可演示命令队列、代理权限校验和装饰器增强。';
            patternDialogVisible.value = true;
        };

        const writePatternLog = (title, data) => {
            patternLog.value = title + '\n' + JSON.stringify(data, null, 2);
        };

        const runPatternRequest = async (title, url, options = {}) => {
            if (!selectedDevice.value) return;
            patternLoading.value = true;
            try {
                const res = await fetch(url, Object.assign({ headers: getHeaders() }, options));
                const data = await res.json();
                writePatternLog(title, data.data || data);
            } catch (e) {
                ElementPlus.ElMessage.error(title + '失败');
            } finally {
                patternLoading.value = false;
            }
        };

        const addCommand = () => runPatternRequest(
            '命令已加入队列',
            API_BASE_URL + '/api/commands/add?deviceCode=' + selectedDevice.value.deviceCode + '&commandType=' + commandType.value + '&operator=frontend-demo&value=60',
            { method: 'POST' }
        );

        const executeCommands = () => runPatternRequest('命令队列执行结果', API_BASE_URL + '/api/commands/execute-all', { method: 'POST' });
        const undoCommand = () => runPatternRequest('命令撤销结果', API_BASE_URL + '/api/commands/undo-last', { method: 'POST' });
        const loadQueueStatus = () => runPatternRequest('命令队列状态', API_BASE_URL + '/api/commands/queue-status');
        const remoteControl = () => runPatternRequest(
            '代理模式远程控制结果',
            API_BASE_URL + '/api/devices/remote-control?username=' + remoteUser.value + '&deviceCode=' + selectedDevice.value.deviceCode + '&action=START',
            { method: 'POST' }
        );
        const decoratorDemo = () => runPatternRequest('装饰器模式增强结果', API_BASE_URL + '/api/devices/decorator-demo/' + selectedDevice.value.deviceCode);

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
            canStart, canStop, canMaintain, canFault, canCalibrate, canManageDevice,
            deviceDialogVisible, patternDialogVisible, editingDevice, selectedDevice,
            deviceForm, commandType, remoteUser, patternLog, patternLoading,
            openDeviceDialog, saveDevice, deleteDevice, openPatternDialog,
            addCommand, executeCommands, undoCommand, loadQueueStatus,
            remoteControl, decoratorDemo
        };
    }
};
