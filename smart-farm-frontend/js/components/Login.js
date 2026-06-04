const Login = {
    template: `
        <div class="login-page">
            <el-card class="login-card" shadow="always">
                <!-- Logo -->
                <div style="text-align: center; margin-bottom: 24px;">
                    <div class="login-logo">
                        <i class="fas fa-seedling" style="font-size: 32px; color: #67c23a;"></i>
                    </div>
                    <h2 style="margin: 0; color: #303133; font-size: 20px;">智慧农场综合管理平台</h2>
                    <p style="color: #909399; margin-top: 6px; font-size: 13px;">{{ isLogin ? '登录您的账户' : '创建新账户' }}</p>
                </div>

                <!-- 登录/注册切换 -->
                <el-tabs v-model="activeTab" @tab-click="onTabChange" style="margin-bottom: 10px;">
                    <el-tab-pane label="登录" name="login"></el-tab-pane>
                    <el-tab-pane label="注册" name="register"></el-tab-pane>
                </el-tabs>

                <!-- 登录表单 -->
                <el-form v-if="isLogin" :model="loginForm" @submit.prevent="handleLogin" label-position="top">
                    <el-form-item label="用户名">
                        <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User" size="large"></el-input>
                    </el-form-item>
                    <el-form-item label="密码">
                        <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" size="large" show-password></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%; height: 44px; font-size: 16px;" size="large">
                            {{ loading ? '登录中...' : '登录' }}
                        </el-button>
                    </el-form-item>
                </el-form>

                <!-- 注册表单 -->
                <el-form v-else :model="registerForm" @submit.prevent="handleRegister" label-position="top">
                    <el-form-item label="用户名">
                        <el-input v-model="registerForm.username" placeholder="请输入用户名" prefix-icon="User" size="large"></el-input>
                    </el-form-item>
                    <el-form-item label="密码">
                        <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" size="large" show-password></el-input>
                    </el-form-item>
                    <el-form-item label="角色">
                        <el-select v-model="registerForm.role" placeholder="请选择角色" style="width: 100%;" size="large">
                            <el-option label="观察者" value="VIEWER"></el-option>
                            <el-option label="操作员" value="OPERATOR"></el-option>
                            <el-option label="技术员" value="TECHNICIAN"></el-option>
                            <el-option label="管理员" value="ADMIN"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleRegister" :loading="loading" style="width: 100%; height: 44px; font-size: 16px;" size="large">
                            {{ loading ? '注册中...' : '注册' }}
                        </el-button>
                    </el-form-item>
                </el-form>

                <!-- 快速登录 -->
                <div v-if="isLogin" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ebeef5;">
                    <p style="font-size: 13px; color: #909399; text-align: center; margin-bottom: 12px;">快速登录（演示账户）</p>
                    <el-row :gutter="10">
                        <el-col :span="12">
                            <el-button @click="quickLogin('admin', '123456')" style="width: 100%;" type="danger" plain size="default">
                                <i class="fas fa-crown" style="margin-right: 4px;"></i>管理员
                            </el-button>
                        </el-col>
                        <el-col :span="12">
                            <el-button @click="quickLogin('tech', '123456')" style="width: 100%;" type="primary" plain size="default">
                                <i class="fas fa-tools" style="margin-right: 4px;"></i>技术员
                            </el-button>
                        </el-col>
                    </el-row>
                    <el-row :gutter="10" style="margin-top: 10px;">
                        <el-col :span="12">
                            <el-button @click="quickLogin('operator', '123456')" style="width: 100%;" type="warning" plain size="default">
                                <i class="fas fa-hand-pointer" style="margin-right: 4px;"></i>操作员
                            </el-button>
                        </el-col>
                        <el-col :span="12">
                            <el-button @click="quickLogin('viewer', '123456')" style="width: 100%;" type="info" plain size="default">
                                <i class="fas fa-eye" style="margin-right: 4px;"></i>观察者
                            </el-button>
                        </el-col>
                    </el-row>
                </div>

                <!-- 错误提示 -->
                <el-alert v-if="error" :title="error" type="error" show-icon style="margin-top: 15px;" @close="error = ''"></el-alert>
            </el-card>
        </div>
    `,

    setup() {
        const isLogin = Vue.ref(true);
        const activeTab = Vue.ref('login');
        const loading = Vue.ref(false);
        const error = Vue.ref('');

        const loginForm = Vue.reactive({ username: '', password: '' });
        const registerForm = Vue.reactive({ username: '', password: '', role: 'VIEWER' });

        const onTabChange = (tab) => {
            isLogin.value = tab.paneName === 'login';
        };

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
            isLogin, activeTab, loading, error,
            loginForm, registerForm,
            onTabChange, handleLogin, handleRegister, quickLogin
        };
    }
};
