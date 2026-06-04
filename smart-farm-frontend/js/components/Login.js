const Login = {
    template: `
        <div class="login-page">
            <div class="login-container">
                <!-- 左侧品牌区 -->
                <div class="login-brand">
                    <div class="login-brand-icon">
                        <i class="fas fa-seedling" style="font-size: 24px; color: #22c55e;"></i>
                    </div>
                    <h1>智慧农场综合管理平台</h1>
                    <p>基于物联网与多智能体协作的精准农业管理系统，覆盖环境监测、设备控制、产量预测与农事决策全流程。</p>
                    <div class="login-brand-features">
                        <div class="login-brand-feature">
                            <i class="fas fa-check-circle"></i>
                            <span>实时环境监测与智能预警</span>
                        </div>
                        <div class="login-brand-feature">
                            <i class="fas fa-check-circle"></i>
                            <span>多设备联动控制与状态管理</span>
                        </div>
                        <div class="login-brand-feature">
                            <i class="fas fa-check-circle"></i>
                            <span>产量预测与农事智能建议</span>
                        </div>
                        <div class="login-brand-feature">
                            <i class="fas fa-check-circle"></i>
                            <span>多代理协作决策支持</span>
                        </div>
                    </div>
                </div>

                <!-- 右侧表单区 -->
                <div class="login-form-panel">
                    <h2>{{ isLogin ? '账户登录' : '创建账户' }}</h2>
                    <p class="subtitle">{{ isLogin ? '欢迎回来，请输入您的账户信息' : '请填写以下信息完成注册' }}</p>

                    <!-- 登录/注册切换 -->
                    <div class="login-tabs">
                        <div class="login-tab" :class="{ active: isLogin }" @click="switchTab('login')">登录</div>
                        <div class="login-tab" :class="{ active: !isLogin }" @click="switchTab('register')">注册</div>
                    </div>

                    <!-- 登录表单 -->
                    <template v-if="isLogin">
                        <div style="margin-bottom: 16px;">
                            <label style="color: rgba(255,255,255,0.5); font-size: 12px; display: block; margin-bottom: 6px;">用户名</label>
                            <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large"
                                style="--el-input-border-color: rgba(255,255,255,0.1); --el-input-bg-color: rgba(255,255,255,0.04); --el-input-text-color: #e5e7eb;">
                            </el-input>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="color: rgba(255,255,255,0.5); font-size: 12px; display: block; margin-bottom: 6px;">密码</label>
                            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" show-password
                                @keyup.enter="handleLogin"
                                style="--el-input-border-color: rgba(255,255,255,0.1); --el-input-bg-color: rgba(255,255,255,0.04); --el-input-text-color: #e5e7eb;">
                            </el-input>
                        </div>

                        <button class="login-btn" :disabled="loading" @click="handleLogin">
                            {{ loading ? '验证中...' : '登 录' }}
                        </button>

                        <el-alert v-if="error" :title="error" type="error" show-icon style="margin-top: 16px;" @close="error = ''"></el-alert>
                    </template>

                    <!-- 注册表单 -->
                    <template v-else>
                        <div style="margin-bottom: 16px;">
                            <label style="color: rgba(255,255,255,0.5); font-size: 12px; display: block; margin-bottom: 6px;">用户名</label>
                            <el-input v-model="registerForm.username" placeholder="3-20位字母或数字" size="large"
                                @input="validateUsername"
                                style="--el-input-border-color: rgba(255,255,255,0.1); --el-input-bg-color: rgba(255,255,255,0.04); --el-input-text-color: #e5e7eb;">
                            </el-input>
                        </div>
                        <div style="margin-bottom: 8px;">
                            <label style="color: rgba(255,255,255,0.5); font-size: 12px; display: block; margin-bottom: 6px;">密码</label>
                            <el-input v-model="registerForm.password" type="password" placeholder="6-20位，建议包含字母和数字" size="large" show-password
                                @input="checkPasswordStrength"
                                style="--el-input-border-color: rgba(255,255,255,0.1); --el-input-bg-color: rgba(255,255,255,0.04); --el-input-text-color: #e5e7eb;">
                            </el-input>
                        </div>
                        <div class="login-password-rules">
                            <span class="password-rule" :class="{ passed: pwdLengthOk }">6-20位</span>
                            <span class="password-rule" :class="{ passed: pwdHasLetter }">包含字母</span>
                            <span class="password-rule" :class="{ passed: pwdHasNumber }">包含数字</span>
                        </div>
                        <div style="margin-bottom: 20px; margin-top: 12px;">
                            <label style="color: rgba(255,255,255,0.5); font-size: 12px; display: block; margin-bottom: 6px;">角色</label>
                            <el-select v-model="registerForm.role" placeholder="请选择角色" size="large" style="width: 100%;">
                                <el-option label="观察者（只读查看权限）" value="VIEWER"></el-option>
                                <el-option label="操作员（日常操作权限）" value="OPERATOR"></el-option>
                                <el-option label="技术员（设备配置权限）" value="TECHNICIAN"></el-option>
                                <el-option label="管理员（系统管理权限）" value="ADMIN"></el-option>
                            </el-select>
                        </div>

                        <button class="login-btn" :disabled="loading || !canRegister" @click="handleRegister">
                            {{ loading ? '注册中...' : '注 册' }}
                        </button>

                        <el-alert v-if="error" :title="error" type="error" show-icon style="margin-top: 16px;" @close="error = ''"></el-alert>
                    </template>

                    <!-- 演示账户 -->
                    <div v-if="isLogin" class="login-quick-accounts">
                        <p>快速体验账户</p>
                        <div class="quick-account-row">
                            <button class="quick-account-btn" @click="quickLogin('admin')">
                                <i class="fas fa-shield-alt" style="font-size: 11px;"></i>管理员
                            </button>
                            <button class="quick-account-btn" @click="quickLogin('tech')">
                                <i class="fas fa-wrench" style="font-size: 11px;"></i>技术员
                            </button>
                            <button class="quick-account-btn" @click="quickLogin('operator')">
                                <i class="fas fa-play" style="font-size: 11px;"></i>操作员
                            </button>
                            <button class="quick-account-btn" @click="quickLogin('viewer')">
                                <i class="fas fa-eye" style="font-size: 11px;"></i>观察者
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    setup() {
        const isLogin = Vue.ref(true);
        const loading = Vue.ref(false);
        const error = Vue.ref('');

        const loginForm = Vue.reactive({ username: '', password: '' });
        const registerForm = Vue.reactive({ username: '', password: '', role: 'VIEWER' });

        // 密码强度校验
        const pwdLengthOk = Vue.ref(false);
        const pwdHasLetter = Vue.ref(false);
        const pwdHasNumber = Vue.ref(false);

        const checkPasswordStrength = () => {
            const p = registerForm.password;
            pwdLengthOk.value = p.length >= 6 && p.length <= 20;
            pwdHasLetter.value = /[a-zA-Z]/.test(p);
            pwdHasNumber.value = /[0-9]/.test(p);
        };

        // 用户名校验
        const usernameValid = Vue.ref(true);
        const validateUsername = () => {
            const u = registerForm.username;
            usernameValid.value = u.length >= 3 && u.length <= 20 && /^[a-zA-Z0-9_]+$/.test(u);
        };

        const canRegister = Vue.computed(() => {
            return registerForm.username && registerForm.password
                && pwdLengthOk.value && pwdHasLetter.value && pwdHasNumber.value
                && usernameValid.value;
        });

        const switchTab = (tab) => {
            isLogin.value = tab === 'login';
            error.value = '';
        };

        const handleLogin = async () => {
            if (!loginForm.username || !loginForm.password) {
                error.value = '请输入用户名和密码';
                return;
            }
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
                    window.location.hash = '#/';
                    window.location.reload();
                } else {
                    error.value = data.message || '登录失败';
                }
            } catch (e) {
                error.value = '网络连接失败，请检查后端服务';
            } finally {
                loading.value = false;
            }
        };

        const handleRegister = async () => {
            if (!registerForm.username || !registerForm.password || !registerForm.role) {
                error.value = '请完整填写注册信息';
                return;
            }
            if (!canRegister.value) {
                error.value = '请按照规则设置用户名和密码';
                return;
            }
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
                    window.location.hash = '#/';
                    window.location.reload();
                } else {
                    error.value = data.message || '注册失败';
                }
            } catch (e) {
                error.value = '网络连接失败，请检查后端服务';
            } finally {
                loading.value = false;
            }
        };

        const quickLogin = (username) => {
            loginForm.username = username;
            loginForm.password = '123456';
            handleLogin();
        };

        return {
            isLogin, loading, error,
            loginForm, registerForm,
            pwdLengthOk, pwdHasLetter, pwdHasNumber,
            usernameValid, canRegister,
            switchTab, handleLogin, handleRegister,
            quickLogin, checkPasswordStrength, validateUsername
        };
    }
};
