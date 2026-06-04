const TaskManagement = {
    template: `
        <div>
            <!-- 页面头部 -->
            <div class="page-header">
                <div class="page-header-left">
                    <h1 class="page-header-title">农事任务管理</h1>
                    <p class="page-header-subtitle">安排灌溉、施肥、除虫、巡检等农事活动</p>
                </div>
                <el-button v-if="canCreateTask" type="primary" @click="showDialog = true; resetForm();">
                    <i class="fas fa-plus" style="margin-right: 6px;"></i>新增任务
                </el-button>
            </div>

            <!-- 任务概览 -->
            <el-row :gutter="16" style="margin-bottom: 16px;">
                <el-col :xs="12" :sm="6" v-for="stat in taskStats" :key="stat.label">
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
                <el-form :inline="true" :model="queryForm" style="margin-bottom: 0;">
                    <el-form-item label="任务状态" style="margin-bottom: 0;">
                        <el-select v-model="queryForm.status" placeholder="全部状态" clearable size="default" style="width: 150px;">
                            <el-option label="待办" value="TODO"></el-option>
                            <el-option label="进行中" value="DOING"></el-option>
                            <el-option label="已完成" value="DONE"></el-option>
                            <el-option label="已取消" value="CANCELLED"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item style="margin-bottom: 0;">
                        <el-button type="primary" @click="loadTasks"><i class="fas fa-search" style="margin-right: 6px;"></i>查询</el-button>
                    </el-form-item>
                </el-form>
            </div>

            <!-- 任务列表 -->
            <div class="content-card">
                <div class="content-card-body">
                    <el-table :data="filteredTasks" stripe border style="width: 100%;" v-loading="loading">
                        <el-table-column prop="id" label="ID" width="70"></el-table-column>
                        <el-table-column prop="taskName" label="任务名称" width="200"></el-table-column>
                        <el-table-column prop="taskType" label="任务类型" width="120">
                            <template #default="{ row }">
                                <el-tag size="small">{{ row.taskType || '未分类' }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="status" label="状态" width="100">
                            <template #default="{ row }">
                                <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="assignee" label="负责人" width="100">
                            <template #default="{ row }">{{ row.assignee || '未分配' }}</template>
                        </el-table-column>
                        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
                        <el-table-column prop="finishTime" label="完成时间" width="180">
                            <template #default="{ row }">{{ row.finishTime || '--' }}</template>
                        </el-table-column>
                        <el-table-column label="操作" width="250" fixed="right">
                            <template #default="{ row }">
                                <el-button v-if="row.status === 'TODO' && canExecuteTask" type="success" size="small" link @click="startTask(row)">
                                    <i class="fas fa-play" style="margin-right: 4px;"></i>开始
                                </el-button>
                                <el-button v-if="row.status === 'DOING' && canExecuteTask" type="primary" size="small" link @click="completeTask(row)">
                                    <i class="fas fa-check" style="margin-right: 4px;"></i>完成
                                </el-button>
                                <el-button v-if="row.status !== 'DONE' && row.status !== 'CANCELLED' && canCancelTask" type="warning" size="small" link @click="cancelTask(row)">
                                    <i class="fas fa-times" style="margin-right: 4px;"></i>取消
                                </el-button>
                                <el-button v-if="canDeleteTask" type="danger" size="small" link @click="confirmDelete(row)">
                                    <i class="fas fa-trash" style="margin-right: 4px;"></i>删除
                                </el-button>
                                <span v-if="!canExecuteTask && !canDeleteTask" style="color: #909399; font-size: 12px;">只读</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>

            <!-- 新增任务弹窗 -->
            <el-dialog v-model="showDialog" title="新增农事任务" width="500px">
                <el-form :model="taskForm" label-width="80px">
                    <el-form-item label="任务名称">
                        <el-input v-model="taskForm.taskName" placeholder="请输入任务名称"></el-input>
                    </el-form-item>
                    <el-form-item label="任务类型">
                        <el-select v-model="taskForm.taskType" placeholder="请选择" style="width: 100%;">
                            <el-option label="灌溉" value="灌溉"></el-option>
                            <el-option label="施肥" value="施肥"></el-option>
                            <el-option label="除虫" value="除虫"></el-option>
                            <el-option label="巡检" value="巡检"></el-option>
                            <el-option label="采收" value="采收"></el-option>
                            <el-option label="其他" value="其他"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="负责人">
                        <el-input v-model="taskForm.assignee" placeholder="请输入负责人"></el-input>
                    </el-form-item>
                    <el-form-item label="备注">
                        <el-input v-model="taskForm.remark" type="textarea" :rows="3" placeholder="请输入备注"></el-input>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <el-button @click="showDialog = false">取消</el-button>
                    <el-button type="primary" @click="addTask" :loading="saving">确定</el-button>
                </template>
            </el-dialog>
        </div>
    `,

    setup() {
        const API_BASE_URL = 'http://localhost:8080';
        const tasks = Vue.ref([]);
        const loading = Vue.ref(false);
        const saving = Vue.ref(false);
        const showDialog = Vue.ref(false);
        const queryForm = Vue.reactive({ status: '' });
        const taskForm = Vue.reactive({ taskName: '', taskType: '灌溉', assignee: '', remark: '' });

        const filteredTasks = Vue.computed(() => {
            if (!queryForm.status) return tasks.value;
            return tasks.value.filter(t => t.status === queryForm.status);
        });

        const taskStats = Vue.computed(() => {
            const all = tasks.value;
            return [
                { label: '全部任务', value: all.length, icon: 'fas fa-clipboard-list', color: '#409eff' },
                { label: '待办', value: all.filter(t => t.status === 'TODO').length, icon: 'fas fa-clock', color: '#909399' },
                { label: '进行中', value: all.filter(t => t.status === 'DOING').length, icon: 'fas fa-spinner', color: '#e6a23c' },
                { label: '已完成', value: all.filter(t => t.status === 'DONE').length, icon: 'fas fa-check-circle', color: '#67c23a' }
            ];
        });

        const getHeaders = () => ({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        });

        const userRole = Vue.computed(() => {
            try { return JSON.parse(localStorage.getItem('user') || '{}').role || 'VIEWER'; } catch { return 'VIEWER'; }
        });
        // ADMIN/TECHNICIAN：全部操作；OPERATOR：仅开始/完成；VIEWER：只读
        const canCreateTask = Vue.computed(() => ['ADMIN', 'TECHNICIAN'].includes(userRole.value));
        const canExecuteTask = Vue.computed(() => ['ADMIN', 'TECHNICIAN', 'OPERATOR'].includes(userRole.value));
        const canCancelTask = Vue.computed(() => ['ADMIN', 'TECHNICIAN'].includes(userRole.value));
        const canDeleteTask = Vue.computed(() => ['ADMIN', 'TECHNICIAN'].includes(userRole.value));

        const getStatusText = (status) => {
            const map = { 'TODO': '待办', 'DOING': '进行中', 'DONE': '已完成', 'CANCELLED': '已取消' };
            return map[status] || status;
        };

        const getStatusType = (status) => {
            const map = { 'TODO': 'info', 'DOING': 'warning', 'DONE': 'success', 'CANCELLED': 'danger' };
            return map[status] || '';
        };

        const loadTasks = async () => {
            loading.value = true;
            try {
                const res = await fetch(API_BASE_URL + '/api/tasks', { headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200) tasks.value = data.data || [];
            } catch (e) {
                console.error(e);
            }
            loading.value = false;
        };

        const addTask = async () => {
            if (!taskForm.taskName) {
                ElementPlus.ElMessage.warning('请输入任务名称');
                return;
            }
            saving.value = true;
            try {
                const res = await fetch(API_BASE_URL + '/api/tasks', {
                    method: 'POST', headers: getHeaders(),
                    body: JSON.stringify(taskForm)
                });
                const data = await res.json();
                if (data.code === 200) {
                    ElementPlus.ElMessage.success('任务创建成功');
                    showDialog.value = false;
                    loadTasks();
                } else {
                    ElementPlus.ElMessage.error(data.message || '创建失败');
                }
            } catch (e) {
                ElementPlus.ElMessage.error('创建失败');
            }
            saving.value = false;
        };

        const startTask = async (task) => {
            try {
                const res = await fetch(API_BASE_URL + '/api/tasks/' + task.id + '/start', { method: 'PUT', headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200) { ElementPlus.ElMessage.success('任务已开始'); loadTasks(); }
            } catch (e) { ElementPlus.ElMessage.error('操作失败'); }
        };

        const completeTask = async (task) => {
            try {
                const res = await fetch(API_BASE_URL + '/api/tasks/' + task.id + '/finish', { method: 'PUT', headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200) { ElementPlus.ElMessage.success('任务已完成'); loadTasks(); }
            } catch (e) { ElementPlus.ElMessage.error('操作失败'); }
        };

        const cancelTask = (task) => {
            ElementPlus.ElMessageBox.confirm(
                '确定要取消任务「' + task.taskName + '」吗？',
                '确认取消',
                { confirmButtonText: '确定取消', cancelButtonText: '返回', type: 'warning' }
            ).then(async () => {
                try {
                    const res = await fetch(API_BASE_URL + '/api/tasks/' + task.id + '/cancel', { method: 'PUT', headers: getHeaders() });
                    const data = await res.json();
                    if (data.code === 200) { ElementPlus.ElMessage.success('任务已取消'); loadTasks(); }
                } catch (e) { ElementPlus.ElMessage.error('操作失败'); }
            }).catch(() => {});
        };

        const confirmDelete = (task) => {
            ElementPlus.ElMessageBox.confirm(
                '确定要删除任务「' + task.taskName + '」吗？此操作不可恢复。',
                '确认删除',
                { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'error' }
            ).then(async () => {
                try {
                    const res = await fetch(API_BASE_URL + '/api/tasks/' + task.id, { method: 'DELETE', headers: getHeaders() });
                    const data = await res.json();
                    if (data.code === 200) { ElementPlus.ElMessage.success('删除成功'); loadTasks(); }
                } catch (e) { ElementPlus.ElMessage.error('删除失败'); }
            }).catch(() => {});
        };

        const resetForm = () => {
            taskForm.taskName = '';
            taskForm.taskType = '灌溉';
            taskForm.assignee = '';
            taskForm.remark = '';
        };

        Vue.onMounted(() => loadTasks());

        return {
            tasks, filteredTasks, taskStats, loading, saving, showDialog, queryForm, taskForm,
            getStatusText, getStatusType, loadTasks, addTask,
            startTask, completeTask, cancelTask, confirmDelete, resetForm,
            canCreateTask, canExecuteTask, canCancelTask, canDeleteTask
        };
    }
};
