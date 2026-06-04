const UserProfile = {
    template: `
        <div class="max-w-2xl mx-auto space-y-6">
            <!-- 个人资料卡片 -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <!-- 顶部背景 -->
                <div class="h-32 bg-gradient-to-r from-green-400 to-blue-500"></div>

                <!-- 头像和基本信息 -->
                <div class="px-6 pb-6">
                    <div class="flex items-end -mt-16 mb-4">
                        <div class="relative group">
                            <div class="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                                <img v-if="avatarUrl" :src="avatarUrl" class="w-full h-full object-cover" />
                                <div v-else class="w-full h-full flex items-center justify-center text-white text-3xl"
                                    :class="getRoleBgColor(user.role)">
                                    <i class="fas fa-user"></i>
                                </div>
                            </div>
                            <label class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                <i class="fas fa-camera text-white text-xl"></i>
                                <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
                            </label>
                        </div>
                        <div class="ml-4 mb-1">
                            <h2 class="text-2xl font-bold text-gray-800">{{ user.username }}</h2>
                            <span class="inline-block px-3 py-1 text-xs rounded-full mt-1"
                                :class="getRoleBadgeColor(user.role)">
                                {{ getRoleName(user.role) }}
                            </span>
                        </div>
                    </div>
                    <p class="text-sm text-gray-500">
                        <i class="fas fa-info-circle mr-1"></i>鼠标悬停头像可更换
                    </p>
                </div>
            </div>

            <!-- 修改密码 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                    <i class="fas fa-lock mr-2 text-yellow-500"></i>修改密码
                </h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">当前密码</label>
                        <input v-model="passwordForm.oldPassword" type="password"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="请输入当前密码" />
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">新密码</label>
                        <input v-model="passwordForm.newPassword" type="password"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="请输入新密码" />
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">确认新密码</label>
                        <input v-model="passwordForm.confirmPassword" type="password"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="再次输入新密码" />
                    </div>
                    <button @click="changePassword"
                        class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                        <i class="fas fa-save mr-2"></i>保存修改
                    </button>
                </div>
            </div>

            <!-- 账号信息 -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                    <i class="fas fa-info-circle mr-2 text-blue-500"></i>账号信息
                </h3>
                <div class="space-y-3">
                    <div class="flex justify-between p-3 bg-gray-50 rounded">
                        <span class="text-gray-600">用户名</span>
                        <span class="font-medium">{{ user.username }}</span>
                    </div>
                    <div class="flex justify-between p-3 bg-gray-50 rounded">
                        <span class="text-gray-600">角色</span>
                        <span class="font-medium">{{ getRoleName(user.role) }}</span>
                    </div>
                    <div class="flex justify-between p-3 bg-gray-50 rounded">
                        <span class="text-gray-600">用户ID</span>
                        <span class="font-medium">{{ user.id }}</span>
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
        const API_BASE_URL = 'http://localhost:8080';
        const user = Vue.computed(() => {
            try {
                return JSON.parse(localStorage.getItem('user') || '{}');
            } catch {
                return {};
            }
        });

        const avatarUrl = Vue.ref(localStorage.getItem('avatar_' + user.value.username) || '');
        const message = Vue.ref(null);

        const passwordForm = Vue.reactive({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        });

        const showMessage = (text, type = 'success') => {
            message.value = { text, type };
            setTimeout(() => message.value = null, 3000);
        };

        const getRoleName = (role) => {
            const map = { 'ADMIN': '管理员', 'TECHNICIAN': '技术员', 'OPERATOR': '操作员', 'VIEWER': '观察者' };
            return map[role] || role;
        };

        const getRoleBgColor = (role) => {
            const map = { 'ADMIN': 'bg-red-500', 'TECHNICIAN': 'bg-blue-500', 'OPERATOR': 'bg-yellow-500', 'VIEWER': 'bg-gray-500' };
            return map[role] || 'bg-gray-500';
        };

        const getRoleBadgeColor = (role) => {
            const map = { 'ADMIN': 'bg-red-100 text-red-800', 'TECHNICIAN': 'bg-blue-100 text-blue-800', 'OPERATOR': 'bg-yellow-100 text-yellow-800', 'VIEWER': 'bg-gray-100 text-gray-800' };
            return map[role] || 'bg-gray-100 text-gray-800';
        };

        const onAvatarChange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
                showMessage('头像文件不能超过 2MB', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarUrl.value = e.target.result;
                localStorage.setItem('avatar_' + user.value.username, e.target.result);
                showMessage('头像更换成功');
            };
            reader.readAsDataURL(file);
        };

        const changePassword = async () => {
            if (!passwordForm.oldPassword || !passwordForm.newPassword) {
                showMessage('请填写完整密码信息', 'error');
                return;
            }
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                showMessage('两次输入的新密码不一致', 'error');
                return;
            }
            if (passwordForm.newPassword.length < 6) {
                showMessage('新密码长度不能少于6位', 'error');
                return;
            }
            try {
                const response = await fetch(API_BASE_URL + '/api/auth/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        username: user.value.username,
                        oldPassword: passwordForm.oldPassword,
                        newPassword: passwordForm.newPassword
                    })
                });
                const data = await response.json();
                if (data.code === 200) {
                    showMessage('密码修改成功');
                    passwordForm.oldPassword = '';
                    passwordForm.newPassword = '';
                    passwordForm.confirmPassword = '';
                } else {
                    showMessage(data.message || '密码修改失败', 'error');
                }
            } catch (error) {
                showMessage('修改失败: ' + error.message, 'error');
            }
        };

        return {
            user,
            avatarUrl,
            message,
            passwordForm,
            getRoleName,
            getRoleBgColor,
            getRoleBadgeColor,
            onAvatarChange,
            changePassword,
            showMessage
        };
    }
};
