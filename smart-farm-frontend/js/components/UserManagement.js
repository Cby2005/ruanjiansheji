const UserManagement = {
    template: `
        <div>
            <el-card shadow="hover">
                <template #header>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <el-form :inline="true" :model="queryForm" style="margin-bottom: 0;">
                            <el-form-item label="用户名" style="margin-bottom: 0;">
                                <el-input v-model="queryForm.username" placeholder="输入用户名" clearable size="default" style="width: 200px;"></el-input>
                            </el-form-item>
                            <el-form-item label="角色" style="margin-bottom: 0;">
                                <el-select v-model="queryForm.role" placeholder="全部角色" clearable size="default" style="width: 150px;">
                                    <el-option label="管理员" value="ADMIN"></el-option>
                                    <el-option label="技术员" value="TECHNICIAN"></el-option>
                                    <el-option label="操作员" value="OPERATOR"></el-option>
                                    <el-option label="观察者" value="VIEWER"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item style="margin-bottom: 0;">
                                <el-button type="primary" @click="loadUsers"><i class="fas fa-search" style="margin-right: 6px;"></i>查询</el-button>
                            </el-form-item>
                        </el-form>
                        <el-button type="success" @click="showDialog = true; resetForm();">
                            <i class="fas fa-plus" style="margin-right: 6px;"></i>新增用户
                        </el-button>
                    </div>
                </template>

                <el-table :data="filteredUsers" stripe border style="width: 100%;">
                    <el-table-column prop="id" label="ID" width="70"></el-table-column>
                    <el-table-column prop="username" label="用户名" width="150"></el-table-column>
                    <el-table-column prop="role" label="角色" width="120">
                        <template #default="{ row }">
                            <el-tag :type="getRoleTagType(row.role)" size="small">{{ getRoleName(row.role) }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="createdAt" label="创建时间"></el-table-column>
                    <el-table-column label="操作" width="200" fixed="right">
                        <template #default="{ row }">
                            <el-button type="primary" size="small" link @click="editUser(row)">
                                <i class="fas fa-edit" style="margin-right: 4px;"></i>编辑
                            </el-button>
                            <el-button type="danger" size="small" link @click="confirmDelete(row)">
                                <i class="fas fa-trash" style="margin-right: 4px;"></i>删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>

            <!-- 新增/编辑弹窗 -->
            <el-dialog v-model="showDialog" :title="isEdit ? '编辑用户' : '新增用户'" width="450px">
                <el-form :model="userForm" label-width="80px">
                    <el-form-item label="用户名">
                        <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="isEdit"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" v-if="!isEdit">
                        <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password></el-input>
                    </el-form-item>
                    <el-form-item label="角色">
                        <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%;">
                            <el-option label="管理员" value="ADMIN"></el-option>
                            <el-option label="技术员" value="TECHNICIAN"></el-option>
                            <el-option label="操作员" value="OPERATOR"></el-option>
                            <el-option label="观察者" value="VIEWER"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <el-button @click="showDialog = false">取消</el-button>
                    <el-button type="primary" @click="saveUser">确定</el-button>
                </template>
            </el-dialog>
        </div>
    `,

    setup() {
        const API_BASE_URL = 'http://localhost:8080';
        const users = Vue.ref([]);
        const showDialog = Vue.ref(false);
        const isEdit = Vue.ref(false);
        const queryForm = Vue.reactive({ username: '', role: '' });
        const userForm = Vue.reactive({ username: '', password: '', role: 'VIEWER' });

        const filteredUsers = Vue.computed(() => {
            return users.value.filter(u => {
                if (queryForm.username && !u.username.includes(queryForm.username)) return false;
                if (queryForm.role && u.role !== queryForm.role) return false;
                return true;
            });
        });

        const getHeaders = () => ({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        });

        const getRoleName = (role) => {
            const map = { 'ADMIN': '管理员', 'TECHNICIAN': '技术员', 'OPERATOR': '操作员', 'VIEWER': '观察者' };
            return map[role] || role;
        };

        const getRoleTagType = (role) => {
            const map = { 'ADMIN': 'danger', 'TECHNICIAN': '', 'OPERATOR': 'warning', 'VIEWER': 'info' };
            return map[role] || '';
        };

        const resetForm = () => {
            isEdit.value = false;
            userForm.username = '';
            userForm.password = '';
            userForm.role = 'VIEWER';
        };

        const loadUsers = async () => {
            try {
                const res = await fetch(API_BASE_URL + '/api/users/list', { headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200) users.value = data.data;
            } catch (e) {
                console.error(e);
            }
        };

        const editUser = (user) => {
            isEdit.value = true;
            userForm.username = user.username;
            userForm.role = user.role;
            showDialog.value = true;
        };

        const saveUser = async () => {
            try {
                const url = isEdit.value
                    ? API_BASE_URL + '/api/users/' + userForm.username
                    : API_BASE_URL + '/api/auth/register';
                const method = isEdit.value ? 'PUT' : 'POST';
                const body = isEdit.value
                    ? { role: userForm.role }
                    : { username: userForm.username, password: userForm.password, role: userForm.role };
                const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(body) });
                const data = await res.json();
                if (data.code === 200) {
                    ElementPlus.ElMessage.success(isEdit.value ? '修改成功' : '创建成功');
                    showDialog.value = false;
                    loadUsers();
                } else {
                    ElementPlus.ElMessage.error(data.message || '操作失败');
                }
            } catch (e) {
                ElementPlus.ElMessage.error('操作失败');
            }
        };

        const confirmDelete = (user) => {
            ElementPlus.ElMessageBox.confirm(
                '确定要删除用户「' + user.username + '」吗？此操作不可恢复。',
                '确认删除',
                { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'error' }
            ).then(() => deleteUser(user.username)).catch(() => {});
        };

        const deleteUser = async (username) => {
            try {
                const res = await fetch(API_BASE_URL + '/api/users/' + username, { method: 'DELETE', headers: getHeaders() });
                const data = await res.json();
                if (data.code === 200) {
                    ElementPlus.ElMessage.success('删除成功');
                    loadUsers();
                } else {
                    ElementPlus.ElMessage.error(data.message || '删除失败');
                }
            } catch (e) {
                ElementPlus.ElMessage.error('删除失败');
            }
        };

        Vue.onMounted(() => loadUsers());

        return {
            users, filteredUsers, queryForm, userForm, showDialog, isEdit,
            getRoleName, getRoleTagType, resetForm, loadUsers, editUser, saveUser, confirmDelete
        };
    }
};
