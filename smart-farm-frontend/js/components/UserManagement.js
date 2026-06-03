const UserManagement = {
    template: `
        <div class="space-y-6">
            <!-- 操作栏 -->
            <div class="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-800">
                    <i class="fas fa-users mr-2 text-purple-500"></i>用户管理
                </h3>
                <button @click="showAddModal = true"
                    class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
                    <i class="fas fa-plus mr-2"></i>添加用户
                </button>
            </div>

            <!-- 用户统计 -->
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div class="bg-white rounded-lg shadow-md p-4 text-center">
                    <p class="text-2xl font-bold text-gray-800">{{ stats.total || 0 }}</p>
                    <p class="text-sm text-gray-500">总用户数</p>
                </div>
                <div class="bg-white rounded-lg shadow-md p-4 text-center">
                    <p class="text-2xl font-bold text-red-500">{{ stats.admin || 0 }}</p>
                    <p class="text-sm text-gray-500">管理员</p>
                </div>
                <div class="bg-white rounded-lg shadow-md p-4 text-center">
                    <p class="text-2xl font-bold text-blue-500">{{ stats.technician || 0 }}</p>
                    <p class="text-sm text-gray-500">技术员</p>
                </div>
                <div class="bg-white rounded-lg shadow-md p-4 text-center">
                    <p class="text-2xl font-bold text-yellow-500">{{ stats.operator || 0 }}</p>
                    <p class="text-sm text-gray-500">操作员</p>
                </div>
                <div class="bg-white rounded-lg shadow-md p-4 text-center">
                    <p class="text-2xl font-bold text-gray-500">{{ stats.viewer || 0 }}</p>
                    <p class="text-sm text-gray-500">观察者</p>
                </div>
            </div>

            <!-- 用户列表 -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户名</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                            <td class="px-6 py-4 text-sm text-gray-500">{{ user.id }}</td>
                            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ user.username }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 text-xs rounded-full" :class="getRoleClass(user.role)">
                                    {{ getRoleName(user.role) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm space-x-2">
                                <button @click="editUser(user)"
                                    class="text-blue-500 hover:text-blue-700">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button @click="showResetPassword(user)"
                                    class="text-yellow-500 hover:text-yellow-700">
                                    <i class="fas fa-key"></i>
                                </button>
                                <button @click="deleteUser(user)"
                                    class="text-red-500 hover:text-red-700"
                                    :disabled="user.username === 'admin'">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 添加用户弹窗 -->
            <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                    <div class="p-6">
                        <h3 class="text-xl font-semibold mb-4">添加用户</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                                <input v-model="newUser.username" type="text"
                                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
                                <input v-model="newUser.password" type="password"
                                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">角色</label>
                                <select v-model="newUser.role"
                                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="ADMIN">管理员</option>
                                    <option value="TECHNICIAN">技术员</option>
                                    <option value="OPERATOR">操作员</option>
                                    <option value="VIEWER">观察者</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button @click="showAddModal = false"
                                class="px-4 py-2 text-gray-600 hover:text-gray-800">取消</button>
                            <button @click="addUser"
                                class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">确认</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 编辑用户弹窗 -->
            <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                    <div class="p-6">
                        <h3 class="text-xl font-semibold mb-4">编辑用户</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                                <input v-model="editForm.username" type="text"
                                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">角色</label>
                                <select v-model="editForm.role"
                                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="ADMIN">管理员</option>
                                    <option value="TECHNICIAN">技术员</option>
                                    <option value="OPERATOR">操作员</option>
                                    <option value="VIEWER">观察者</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button @click="showEditModal = false"
                                class="px-4 py-2 text-gray-600 hover:text-gray-800">取消</button>
                            <button @click="updateUser"
                                class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">确认</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 重置密码弹窗 -->
            <div v-if="showResetModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                    <div class="p-6">
                        <h3 class="text-xl font-semibold mb-4">重置密码 - {{ resetUser?.username }}</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                                <input v-model="newPassword" type="password"
                                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                            </div>
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button @click="showResetModal = false"
                                class="px-4 py-2 text-gray-600 hover:text-gray-800">取消</button>
                            <button @click="resetPassword"
                                class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">确认重置</button>
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
        const users = Vue.ref([]);
        const stats = Vue.ref({});
        const showAddModal = Vue.ref(false);
        const showEditModal = Vue.ref(false);
        const showResetModal = Vue.ref(false);
        const message = Vue.ref(null);
        const newPassword = Vue.ref('');
        const resetUser = Vue.ref(null);
        const editingUser = Vue.ref(null);

        const newUser = Vue.reactive({
            username: '',
            password: '',
            role: 'VIEWER'
        });

        const editForm = Vue.reactive({
            username: '',
            role: ''
        });

        const showMessage = (text, type = 'success') => {
            message.value = { text, type };
            setTimeout(() => message.value = null, 3000);
        };

        const getRoleClass = (role) => {
            const map = {
                'ADMIN': 'bg-red-100 text-red-800',
                'TECHNICIAN': 'bg-blue-100 text-blue-800',
                'OPERATOR': 'bg-yellow-100 text-yellow-800',
                'VIEWER': 'bg-gray-100 text-gray-800'
            };
            return map[role] || 'bg-gray-100 text-gray-800';
        };

        const getRoleName = (role) => {
            const map = {
                'ADMIN': '管理员',
                'TECHNICIAN': '技术员',
                'OPERATOR': '操作员',
                'VIEWER': '观察者'
            };
            return map[role] || role;
        };

        const loadUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/users', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                const data = await response.json();
                if (data.code === 200) {
                    users.value = data.data;
                }
            } catch (error) {
                console.error('加载用户列表失败:', error);
            }
        };

        const loadStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/users/stats', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                const data = await response.json();
                if (data.code === 200) {
                    stats.value = data.data;
                }
            } catch (error) {
                console.error('加载统计失败:', error);
            }
        };

        const addUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(newUser)
                });
                const data = await response.json();
                if (data.code === 200) {
                    showMessage('用户添加成功');
                    showAddModal.value = false;
                    newUser.username = '';
                    newUser.password = '';
                    newUser.role = 'VIEWER';
                    loadUsers();
                    loadStats();
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                showMessage('添加失败: ' + error.message, 'error');
            }
        };

        const editUser = (user) => {
            editingUser.value = user;
            editForm.username = user.username;
            editForm.role = user.role;
            showEditModal.value = true;
        };

        const updateUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/users/' + editingUser.value.id, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(editForm)
                });
                const data = await response.json();
                if (data.code === 200) {
                    showMessage('用户信息更新成功');
                    showEditModal.value = false;
                    loadUsers();
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                showMessage('更新失败: ' + error.message, 'error');
            }
        };

        const showResetPassword = (user) => {
            resetUser.value = user;
            newPassword.value = '';
            showResetModal.value = true;
        };

        const resetPassword = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/users/' + resetUser.value.id + '/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ newPassword: newPassword.value })
                });
                const data = await response.json();
                if (data.code === 200) {
                    showMessage('密码重置成功');
                    showResetModal.value = false;
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                showMessage('重置失败: ' + error.message, 'error');
            }
        };

        const deleteUser = async (user) => {
            if (user.username === 'admin') {
                showMessage('不能删除管理员账户', 'error');
                return;
            }
            if (!confirm('确定要删除用户 ' + user.username + ' 吗？')) return;

            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/users/' + user.id, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                const data = await response.json();
                if (data.code === 200) {
                    showMessage('用户删除成功');
                    loadUsers();
                    loadStats();
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                showMessage('删除失败: ' + error.message, 'error');
            }
        };

        Vue.onMounted(() => {
            loadUsers();
            loadStats();
        });

        return {
            users,
            stats,
            showAddModal,
            showEditModal,
            showResetModal,
            message,
            newUser,
            editForm,
            newPassword,
            resetUser,
            getRoleClass,
            getRoleName,
            addUser,
            editUser,
            updateUser,
            showResetPassword,
            resetPassword,
            deleteUser
        };
    }
};
