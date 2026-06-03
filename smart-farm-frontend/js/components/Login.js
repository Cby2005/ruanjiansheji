const Login = {
    template: `
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
            <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <!-- Logo -->
                <div class="text-center mb-8">
                    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-seedling text-4xl text-green-500"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-800">智慧农场综合管理平台</h1>
                    <p class="text-gray-500 mt-2">{{ isLogin ? '登录您的账户' : '创建新账户' }}</p>
                </div>

                <!-- 登录/注册切换 -->
                <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
                    <button @click="isLogin = true"
                        class="flex-1 py-2 rounded-md transition-all"
                        :class="isLogin ? 'bg-white shadow-md text-green-600 font-semibold' : 'text-gray-500'">
                        登录
                    </button>
                    <button @click="isLogin = false"
                        class="flex-1 py-2 rounded-md transition-all"
                        :class="!isLogin ? 'bg-white shadow-md text-green-600 font-semibold' : 'text-gray-500'">
                        注册
                    </button>
                </div>

                <!-- 登录表单 -->
                <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                        <div class="relative">
                            <span class="absolute left-3 top-3 text-gray-400">
                                <i class="fas fa-user"></i>
                            </span>
                            <input v-model="loginForm.username" type="text" required
                                class="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="请输入用户名">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
                        <div class="relative">
                            <span class="absolute left-3 top-3 text-gray-400">
                                <i class="fas fa-lock"></i>
                            </span>
                            <input v-model="loginForm.password" type="password" required
                                class="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="请输入密码">
                        </div>
                    </div>
                    <button type="submit"
                        class="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                        :disabled="loading">
                        <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
                        {{ loading ? '登录中...' : '登录' }}
                    </button>
                </form>

                <!-- 注册表单 -->
                <form v-else @submit.prevent="handleRegister" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                        <div class="relative">
                            <span class="absolute left-3 top-3 text-gray-400">
                                <i class="fas fa-user"></i>
                            </span>
                            <input v-model="registerForm.username" type="text" required
                                class="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="请输入用户名">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
                        <div class="relative">
                            <span class="absolute left-3 top-3 text-gray-400">
                                <i class="fas fa-lock"></i>
                            </span>
                            <input v-model="registerForm.password" type="password" required
                                class="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="请输入密码">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">角色</label>
                        <div class="relative">
                            <span class="absolute left-3 top-3 text-gray-400">
                                <i class="fas fa-user-tag"></i>
                            </span>
                            <select v-model="registerForm.role"
                                class="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none">
                                <option value="VIEWER">观察者 (VIEWER)</option>
                                <option value="OPERATOR">操作员 (OPERATOR)</option>
                                <option value="TECHNICIAN">技术员 (TECHNICIAN)</option>
                                <option value="ADMIN">管理员 (ADMIN)</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit"
                        class="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                        :disabled="loading">
                        <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
                        {{ loading ? '注册中...' : '注册' }}
                    </button>
                </form>

                <!-- 快速登录 -->
                <div v-if="isLogin" class="mt-6 pt-6 border-t">
                    <p class="text-sm text-gray-500 text-center mb-3">快速登录（演示账户）</p>
                    <div class="grid grid-cols-2 gap-2">
                        <button @click="quickLogin('admin', '123456')"
                            class="py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm">
                            <i class="fas fa-crown mr-1"></i>管理员
                        </button>
                        <button @click="quickLogin('tech', '123456')"
                            class="py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                            <i class="fas fa-tools mr-1"></i>技术员
                        </button>
                        <button @click="quickLogin('operator', '123456')"
                            class="py-2 px-3 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors text-sm">
                            <i class="fas fa-hand-pointer mr-1"></i>操作员
                        </button>
                        <button @click="quickLogin('viewer', '123456')"
                            class="py-2 px-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                            <i class="fas fa-eye mr-1"></i>观察者
                        </button>
                    </div>
                </div>

                <!-- 错误提示 -->
                <div v-if="error" class="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                    <i class="fas fa-exclamation-circle mr-1"></i>{{ error }}
                </div>
            </div>
        </div>
    `,

    setup() {
        const isLogin = Vue.ref(true);
        const loading = Vue.ref(false);
        const error = Vue.ref('');

        const loginForm = Vue.reactive({
            username: '',
            password: ''
        });

        const registerForm = Vue.reactive({
            username: '',
            password: '',
            role: 'VIEWER'
        });

        const handleLogin = async () => {
            loading.value = true;
            error.value = '';
            try {
                const response = await fetch('http://localhost:8080/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginForm)
                });
                const data = await response.json();
                if (data.code === 200) {
                    localStorage.setItem('token', data.data.token);
                    localStorage.setItem('user', JSON.stringify(data.data.user));
                    window.location.href = '#/';
                    window.location.reload();
                } else {
                    error.value = data.message;
                }
            } catch (e) {
                error.value = '登录失败，请检查网络连接';
            } finally {
                loading.value = false;
            }
        };

        const handleRegister = async () => {
            loading.value = true;
            error.value = '';
            try {
                const response = await fetch('http://localhost:8080/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registerForm)
                });
                const data = await response.json();
                if (data.code === 200) {
                    localStorage.setItem('token', data.data.token);
                    localStorage.setItem('user', JSON.stringify(data.data.user));
                    window.location.href = '#/';
                    window.location.reload();
                } else {
                    error.value = data.message;
                }
            } catch (e) {
                error.value = '注册失败，请检查网络连接';
            } finally {
                loading.value = false;
            }
        };

        const quickLogin = (username, password) => {
            loginForm.username = username;
            loginForm.password = password;
            handleLogin();
        };

        return {
            isLogin,
            loading,
            error,
            loginForm,
            registerForm,
            handleLogin,
            handleRegister,
            quickLogin
        };
    }
};
