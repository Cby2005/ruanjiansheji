const TaskManagement = {
    template: `
        <div>
            <el-card shadow="hover">
                <template #header>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <el-form :inline="true" :model="queryForm" style="margin-bottom: 0;">
                            <el-form-item label="任务状态" style="margin-bottom: 0;">
                                <el-select v-model="queryForm.status" placeholder="全部状态" clearable size="default" style="width: 150px;">
                                    <el-option label="待执行" value="PENDING"></el-option>
                                    <el-option label="执行中" value="IN_PROGRESS"></el-option>
                                    <el-option label="已完成" value="COMPLETED"></el-option>
                                    <el-option label="已取消" value="CANCELLED"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item style="margin-bottom: 0;">
                                <el-button type="primary" @click="loadTasks"><i class="fas fa-search" style="margin-right: 6px;"></i>查询</el-button>
                            </el-form-item>
                        </el-form>
                        <el-button type="success" @click="showDialog = true; resetForm();">
                            <i class="fas fa-plus" style="margin-right: 6px;"></i>新增任务
                        </el-button>
                    </div>
                </template>

                <el-table :data="filteredTasks" stripe border style="width: 100%;">
                    <el-table-column prop="id" label="ID" width="70"></el-table-column>
                    <el-table-column prop="taskName" label="任务名称" width="200"></el-table-column>
                    <el-table-column prop="taskType" label="任务类型" width="120">
                        <template #default="{ row }">
                            <el-tag size="small">{{ row.taskType }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态" width="100">
                        <template #default="{ row }">
                            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="priority" label="优先级" width="80">
                        <template #default="{ row }">
                            <el-tag :type="row.priority === 'HIGH' ? 'danger' : row.priority === 'MEDIUM' ? 'warning' : 'info'" size="small">
                                {{ row.priority === 'HIGH' ? '高' : row.priority === 'MEDIUM' ? '中' : '低' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="assignee" label="负责人" width="100"></el-table-column>
                    <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
                    <el-table-column prop="deadline" label="截止时间" width="180"></el-table-column>
                    <el-table-column label="操作" width="200" fixed="right">
                        <template #default="{ row }">
                            <el-button v-if="row.status === 'PENDING'" type="success" size="small" link @click="updateTaskStatus(row, 'IN_PROGRESS')">
                                <i class="fas fa-play" style="margin-right: 4px;"></i>开始
                            </el-button>
                            <el-button v-if="row.status === 'IN_PROGRESS'" type="primary" size="small" link @click="updateTaskStatus(row, 'COMPLETED')">
                                <i class="fas fa-check" style="margin-right: 4px;"></i>完成
                            </el-button>
                            <el-button v-if="row.status !== 'COMPLETED' && row.status !== 'CANCELLED'" type="danger" size="small" link @click="confirmCancel(row)">
                                <i class="fas fa-times" style="margin-right: 4px;"></i>取消
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>

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
                    <el-form-item label="优先级">
                        <el-radio-group v-model="taskForm.priority">
                            <el-radio label="HIGH">高</el-radio>
                            <el-radio label="MEDIUM">中</el-radio>
                            <el-radio label="LOW">低</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="负责人">
                        <el-input v-model="taskForm.assignee" placeholder="请输入负责人"></el-input>
                    </el-form-item>
                    <el-form-item label="截止时间">
                        <el-date-picker v-model="taskForm.deadline" type="datetime" placeholder="选择截止时间" style="width: 100%;"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="备注">
                        <el-input v-model="taskForm.remark" type="textarea" :rows="3" placeholder="请输入备注"></el-input>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <el-button @click="showDialog = false">取消</el-button>
                    <el-button type="primary" @click="addTask">确定</el-button>
                </template>
            </el-dialog>
        </div>
    `,

    setup() {
        const tasks = Vue.ref([
            { id: 1, taskName: 'A区灌溉作业', taskType: '灌溉', status: 'PENDING', priority: 'HIGH', assignee: '张三', createdAt: '2026-06-03 08:00', deadline: '2026-06-04 18:00' },
            { id: 2, taskName: 'B区施肥', taskType: '施肥', status: 'IN_PROGRESS', priority: 'MEDIUM', assignee: '李四', createdAt: '2026-06-02 10:00', deadline: '2026-06-05 12:00' },
            { id: 3, taskName: '虫情巡检', taskType: '巡检', status: 'COMPLETED', priority: 'LOW', assignee: '王五', createdAt: '2026-06-01 09:00', deadline: '2026-06-03 17:00' },
            { id: 4, taskName: 'C区除虫', taskType: '除虫', status: 'PENDING', priority: 'HIGH', assignee: '张三', createdAt: '2026-06-03 14:00', deadline: '2026-06-04 12:00' }
        ]);
        const showDialog = Vue.ref(false);
        const queryForm = Vue.reactive({ status: '' });
        const taskForm = Vue.reactive({ taskName: '', taskType: '灌溉', priority: 'MEDIUM', assignee: '', deadline: '', remark: '' });

        const filteredTasks = Vue.computed(() => {
            if (!queryForm.status) return tasks.value;
            return tasks.value.filter(t => t.status === queryForm.status);
        });

        const getStatusText = (status) => {
            const map = { 'PENDING': '待执行', 'IN_PROGRESS': '执行中', 'COMPLETED': '已完成', 'CANCELLED': '已取消' };
            return map[status] || status;
        };

        const getStatusType = (status) => {
            const map = { 'PENDING': 'info', 'IN_PROGRESS': 'warning', 'COMPLETED': 'success', 'CANCELLED': 'danger' };
            return map[status] || '';
        };

        const resetForm = () => {
            taskForm.taskName = '';
            taskForm.taskType = '灌溉';
            taskForm.priority = 'MEDIUM';
            taskForm.assignee = '';
            taskForm.deadline = '';
            taskForm.remark = '';
        };

        const addTask = () => {
            if (!taskForm.taskName) {
                ElementPlus.ElMessage.warning('请输入任务名称');
                return;
            }
            tasks.value.push({
                id: tasks.value.length + 1,
                taskName: taskForm.taskName,
                taskType: taskForm.taskType,
                status: 'PENDING',
                priority: taskForm.priority,
                assignee: taskForm.assignee || '未分配',
                createdAt: new Date().toLocaleString('zh-CN'),
                deadline: taskForm.deadline ? new Date(taskForm.deadline).toLocaleString('zh-CN') : '未设置'
            });
            showDialog.value = false;
            ElementPlus.ElMessage.success('任务创建成功');
        };

        const updateTaskStatus = (task, status) => {
            task.status = status;
            ElementPlus.ElMessage.success('任务状态已更新');
        };

        const confirmCancel = (task) => {
            ElementPlus.ElMessageBox.confirm(
                '确定要取消任务「' + task.taskName + '」吗？',
                '确认取消',
                { confirmButtonText: '确定取消', cancelButtonText: '返回', type: 'warning' }
            ).then(() => { task.status = 'CANCELLED'; ElementPlus.ElMessage.success('任务已取消'); }).catch(() => {});
        };

        const loadTasks = () => {
            ElementPlus.ElMessage.info('已刷新任务列表');
        };

        return {
            tasks, filteredTasks, showDialog, queryForm, taskForm,
            getStatusText, getStatusType, resetForm, addTask, updateTaskStatus, confirmCancel, loadTasks
        };
    }
};
