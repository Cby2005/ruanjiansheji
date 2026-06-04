const AlertCenter = {
    template: `
        <div>
            <!-- 预警统计 -->
            <el-row :gutter="20" style="margin-bottom: 20px;">
                <el-col :span="6">
                    <el-card shadow="hover" :body-style="{ padding: '20px' }">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 28px; font-weight: bold; color: #f56c6c;">{{ alertStats.critical }}</div>
                                <div style="font-size: 13px; color: #909399; margin-top: 5px;">严重预警</div>
                            </div>
                            <i class="fas fa-exclamation-circle" style="font-size: 32px; color: #f56c6c; opacity: 0.6;"></i>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card shadow="hover" :body-style="{ padding: '20px' }">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 28px; font-weight: bold; color: #e6a23c;">{{ alertStats.warning }}</div>
                                <div style="font-size: 13px; color: #909399; margin-top: 5px;">一般预警</div>
                            </div>
                            <i class="fas fa-exclamation-triangle" style="font-size: 32px; color: #e6a23c; opacity: 0.6;"></i>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card shadow="hover" :body-style="{ padding: '20px' }">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 28px; font-weight: bold; color: #409eff;">{{ alertStats.info }}</div>
                                <div style="font-size: 13px; color: #909399; margin-top: 5px;">提示信息</div>
                            </div>
                            <i class="fas fa-info-circle" style="font-size: 32px; color: #409eff; opacity: 0.6;"></i>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card shadow="hover" :body-style="{ padding: '20px' }">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 28px; font-weight: bold; color: #67c23a;">{{ alertStats.resolved }}</div>
                                <div style="font-size: 13px; color: #909399; margin-top: 5px;">已处理</div>
                            </div>
                            <i class="fas fa-check-circle" style="font-size: 32px; color: #67c23a; opacity: 0.6;"></i>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <!-- 预警列表 -->
            <el-card shadow="hover">
                <template #header>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold;">预警记录</span>
                        <el-form :inline="true" style="margin-bottom: 0;">
                            <el-form-item label="预警级别" style="margin-bottom: 0;">
                                <el-select v-model="queryLevel" placeholder="全部" clearable size="default" style="width: 120px;">
                                    <el-option label="严重" value="CRITICAL"></el-option>
                                    <el-option label="一般" value="WARNING"></el-option>
                                    <el-option label="提示" value="INFO"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item style="margin-bottom: 0;">
                                <el-button type="primary" size="default" @click="loadAlerts"><i class="fas fa-search" style="margin-right: 4px;"></i>查询</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </template>

                <el-table :data="filteredAlerts" stripe border style="width: 100%;">
                    <el-table-column prop="id" label="ID" width="70"></el-table-column>
                    <el-table-column prop="level" label="级别" width="100">
                        <template #default="{ row }">
                            <el-tag :type="getLevelType(row.level)" size="small">{{ getLevelText(row.level) }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="title" label="预警标题" width="250"></el-table-column>
                    <el-table-column prop="description" label="详细描述"></el-table-column>
                    <el-table-column prop="source" label="来源" width="120"></el-table-column>
                    <el-table-column prop="time" label="预警时间" width="180"></el-table-column>
                    <el-table-column prop="status" label="状态" width="100">
                        <template #default="{ row }">
                            <el-tag :type="row.status === 'RESOLVED' ? 'success' : 'danger'" size="small">
                                {{ row.status === 'RESOLVED' ? '已处理' : '未处理' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120" fixed="right">
                        <template #default="{ row }">
                            <el-button v-if="row.status !== 'RESOLVED'" type="success" size="small" link @click="resolveAlert(row)">
                                <i class="fas fa-check" style="margin-right: 4px;"></i>处理
                            </el-button>
                            <span v-else style="color: #909399; font-size: 12px;">已处理</span>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </div>
    `,

    setup() {
        const queryLevel = Vue.ref('');
        const alerts = Vue.ref([
            { id: 1, level: 'CRITICAL', title: '土壤湿度过低', description: 'A区土壤湿度降至15%，低于安全阈值20%，需要立即灌溉', source: '土壤传感器', time: '2026-06-04 10:30:00', status: 'PENDING' },
            { id: 2, level: 'WARNING', title: '空气温度偏高', description: '温室温度达到38°C，超过作物适宜温度范围', source: '气象站', time: '2026-06-04 09:15:00', status: 'PENDING' },
            { id: 3, level: 'INFO', title: 'CO₂浓度变化', description: '大棚CO₂浓度降至350ppm，建议适当通风补充', source: '环境监测', time: '2026-06-04 08:00:00', status: 'RESOLVED' },
            { id: 4, level: 'WARNING', title: '设备异常', description: '灌溉泵P003运行电流偏高，建议检查', source: '设备监控', time: '2026-06-03 16:45:00', status: 'RESOLVED' },
            { id: 5, level: 'CRITICAL', title: '虫害预警', description: 'B区发现蚜虫密度超标，需要立即处理', source: '虫情监测', time: '2026-06-03 14:20:00', status: 'PENDING' }
        ]);

        const alertStats = Vue.computed(() => {
            return {
                critical: alerts.value.filter(a => a.level === 'CRITICAL' && a.status === 'PENDING').length,
                warning: alerts.value.filter(a => a.level === 'WARNING' && a.status === 'PENDING').length,
                info: alerts.value.filter(a => a.level === 'INFO' && a.status === 'PENDING').length,
                resolved: alerts.value.filter(a => a.status === 'RESOLVED').length
            };
        });

        const filteredAlerts = Vue.computed(() => {
            if (!queryLevel.value) return alerts.value;
            return alerts.value.filter(a => a.level === queryLevel.value);
        });

        const getLevelType = (level) => {
            const map = { 'CRITICAL': 'danger', 'WARNING': 'warning', 'INFO': '' };
            return map[level] || '';
        };

        const getLevelText = (level) => {
            const map = { 'CRITICAL': '严重', 'WARNING': '一般', 'INFO': '提示' };
            return map[level] || level;
        };

        const resolveAlert = (alert) => {
            ElementPlus.ElMessageBox.confirm(
                '确定要将预警「' + alert.title + '」标记为已处理吗？',
                '确认处理',
                { confirmButtonText: '确定', cancelButtonText: '取消', type: 'success' }
            ).then(() => {
                alert.status = 'RESOLVED';
                ElementPlus.ElMessage.success('预警已处理');
            }).catch(() => {});
        };

        const loadAlerts = () => {
            ElementPlus.ElMessage.info('已刷新预警列表');
        };

        return { queryLevel, alerts, alertStats, filteredAlerts, getLevelType, getLevelText, resolveAlert, loadAlerts };
    }
};
