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

                <el-table :data="filteredAlerts" stripe border style="width: 100%;" v-loading="loading">
                    <el-table-column prop="id" label="ID" width="70"></el-table-column>
                    <el-table-column prop="alertLevel" label="级别" width="100">
                        <template #default="{ row }">
                            <el-tag :type="getLevelType(row.alertLevel)" size="small">{{ getLevelText(row.alertLevel) }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="alertType" label="预警类型" width="150"></el-table-column>
                    <el-table-column prop="message" label="详细描述"></el-table-column>
                    <el-table-column prop="createTime" label="预警时间" width="180"></el-table-column>
                    <el-table-column prop="handled" label="状态" width="100">
                        <template #default="{ row }">
                            <el-tag :type="row.handled ? 'success' : 'danger'" size="small">
                                {{ row.handled ? '已处理' : '未处理' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120" fixed="right">
                        <template #default="{ row }">
                            <el-button v-if="!row.handled" type="success" size="small" link @click="resolveAlert(row)">
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
        const API_BASE_URL = 'http://localhost:8080';
        const queryLevel = Vue.ref('');
        const alerts = Vue.ref([]);
        const loading = Vue.ref(false);

        const alertStats = Vue.ref({ critical: 0, warning: 0, info: 0, resolved: 0 });

        const getHeaders = () => ({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        });

        const filteredAlerts = Vue.computed(() => {
            if (!queryLevel.value) return alerts.value;
            return alerts.value.filter(a => a.alertLevel === queryLevel.value);
        });

        const getLevelType = (level) => {
            const map = { 'CRITICAL': 'danger', 'WARNING': 'warning', 'INFO': '' };
            return map[level] || '';
        };

        const getLevelText = (level) => {
            const map = { 'CRITICAL': '严重', 'WARNING': '一般', 'INFO': '提示', 'ERROR': '错误' };
            return map[level] || level;
        };

        const loadAlerts = async () => {
            loading.value = true;
            try {
                const [listRes, statsRes] = await Promise.all([
                    fetch(API_BASE_URL + '/api/alerts', { headers: getHeaders() }),
                    fetch(API_BASE_URL + '/api/alerts/stats', { headers: getHeaders() })
                ]);
                const listData = await listRes.json();
                const statsData = await statsRes.json();
                if (listData.code === 200) alerts.value = listData.data || [];
                if (statsData.code === 200) alertStats.value = statsData.data;
            } catch (e) {
                console.error(e);
            }
            loading.value = false;
        };

        const resolveAlert = (alert) => {
            ElementPlus.ElMessageBox.confirm(
                '确定要将此预警标记为已处理吗？',
                '确认处理',
                { confirmButtonText: '确定', cancelButtonText: '取消', type: 'success' }
            ).then(async () => {
                try {
                    const res = await fetch(API_BASE_URL + '/api/alerts/' + alert.id + '/handle', {
                        method: 'PUT', headers: getHeaders()
                    });
                    const data = await res.json();
                    if (data.code === 200) {
                        ElementPlus.ElMessage.success('预警已处理');
                        loadAlerts();
                    }
                } catch (e) {
                    ElementPlus.ElMessage.error('操作失败');
                }
            }).catch(() => {});
        };

        Vue.onMounted(() => loadAlerts());

        return { queryLevel, alerts, alertStats, filteredAlerts, loading, getLevelType, getLevelText, resolveAlert, loadAlerts };
    }
};
