const AlertCenter = {
    template: `
        <div>
            <!-- 页面头部 -->
            <div class="page-header">
                <div class="page-header-left">
                    <h1 class="page-header-title">预警中心</h1>
                    <p class="page-header-subtitle">查看设备故障、环境异常、虫情预警等告警信息</p>
                </div>
            </div>

            <!-- 预警统计 -->
            <el-row :gutter="16" style="margin-bottom: 16px;">
                <el-col :xs="12" :sm="6" v-for="stat in alertStatCards" :key="stat.label">
                    <div class="stat-card" style="margin-bottom: 16px;">
                        <div class="stat-card-inner">
                            <div class="stat-card-info">
                                <div class="stat-card-value" :style="{ color: stat.color }">{{ stat.value }}</div>
                                <div class="stat-card-label">{{ stat.label }}</div>
                            </div>
                            <i :class="stat.icon" class="stat-card-icon" :style="{ color: stat.color }"></i>
                        </div>
                    </div>
                </el-col>
            </el-row>

            <!-- 查询栏 -->
            <div class="query-bar">
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

            <!-- 预警列表 -->
            <div class="content-card">
                <div class="content-card-body">
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
                                <el-button v-if="!row.handled && canHandle" type="success" size="small" link @click="resolveAlert(row)">
                                    <i class="fas fa-check" style="margin-right: 4px;"></i>处理
                                </el-button>
                                <span v-else-if="row.handled" style="color: #909399; font-size: 12px;">已处理</span>
                                <span v-else style="color: #909399; font-size: 12px;">无权限</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
    `,

    setup() {
        const API_BASE_URL = 'http://localhost:8080';
        const queryLevel = Vue.ref('');
        const alerts = Vue.ref([]);
        const loading = Vue.ref(false);

        const alertStats = Vue.ref({ critical: 0, warning: 0, info: 0, resolved: 0 });

        const alertStatCards = Vue.computed(() => [
            { label: '严重预警', value: alertStats.value.critical, icon: 'fas fa-exclamation-circle', color: '#f56c6c' },
            { label: '一般预警', value: alertStats.value.warning, icon: 'fas fa-exclamation-triangle', color: '#e6a23c' },
            { label: '提示信息', value: alertStats.value.info, icon: 'fas fa-info-circle', color: '#409eff' },
            { label: '已处理', value: alertStats.value.resolved, icon: 'fas fa-check-circle', color: '#67c23a' }
        ]);

        // 权限判断：观察者(VIEWER)不能处理预警，ADMIN/TECHNICIAN/OPERATOR可以
        const userRole = Vue.computed(() => {
            try { return JSON.parse(localStorage.getItem('user') || '{}').role || 'VIEWER'; } catch { return 'VIEWER'; }
        });
        const canHandle = Vue.computed(() => ['ADMIN', 'TECHNICIAN', 'OPERATOR'].includes(userRole.value));

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

        return { queryLevel, alerts, alertStats, alertStatCards, filteredAlerts, loading, getLevelType, getLevelText, resolveAlert, loadAlerts, canHandle };
    }
};
