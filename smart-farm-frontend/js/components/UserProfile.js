const UserProfile = {
    template: `
        <div style="max-width: 700px; margin: 0 auto;">
            <!-- 个人资料卡片 -->
            <el-card shadow="hover" style="margin-bottom: 20px;">
                <div style="background: linear-gradient(135deg, #67c23a, #409eff); height: 120px; margin: -20px -20px 0; border-radius: 4px 4px 0 0;"></div>
                <div style="padding: 0 0 20px; margin-top: -40px;">
                    <div style="display: flex; align-items: flex-end;">
                        <div style="position: relative; display: inline-block;">
                            <el-avatar :size="96" :style="{ backgroundColor: getRoleColor(user.role), border: '4px solid #fff', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }">
                                <img v-if="avatarUrl" :src="avatarUrl" style="width: 100%; height: 100%; object-fit: cover;" />
                                <i v-else class="fas fa-user" style="font-size: 36px;"></i>
                            </el-avatar>
                            <label style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); border-radius: 50%; cursor: pointer; opacity: 0; transition: opacity 0.3s;"
                                onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0">
                                <i class="fas fa-camera" style="color: #fff; font-size: 20px;"></i>
                                <input type="file" accept="image/*" style="display: none;" @change="onAvatarChange" />
                            </label>
                        </div>
                        <div style="margin-left: 20px; padding-bottom: 5px;">
                            <h2 style="margin: 0; font-size: 22px; color: #303133;">{{ user.username }}</h2>
                            <el-tag :type="getRoleTagType(user.role)" size="small" style="margin-top: 5px;">{{ getRoleName(user.role) }}</el-tag>
                        </div>
                    </div>
                    <p style="color: #909399; font-size: 13px; margin-top: 10px;">
                        <i class="fas fa-info-circle" style="margin-right: 4px;"></i>鼠标悬停头像可更换
                    </p>
                </div>
            </el-card>

            <!-- 账户安全 -->
            <el-card shadow="hover" style="margin-bottom: 20px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 style="margin: 0; font-size: 16px;"><i class="fas fa-lock" style="margin-right: 8px; color: #e6a23c;"></i>账户安全</h3>
                        <p style="color: #909399; font-size: 13px; margin-top: 5px;">定期修改密码可以提高账户安全性</p>
                    </div>
                    <el-button type="warning" @click="showPasswordModal = true">
                        <i class="fas fa-key" style="margin-right: 6px;"></i>修改密码
                    </el-button>
                </div>
            </el-card>

            <!-- 账号信息 -->
            <el-card shadow="hover">
                <template #header>
                    <span style="font-weight: bold;"><i class="fas fa-info-circle" style="margin-right: 8px; color: #409eff;"></i>账号信息</span>
                </template>
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="用户名">{{ user.username }}</el-descriptions-item>
                    <el-descriptions-item label="角色">{{ getRoleName(user.role) }}</el-descriptions-item>
                    <el-descriptions-item label="用户ID">{{ user.id }}</el-descriptions-item>
                </el-descriptions>
            </el-card>

            <!-- 修改密码弹窗 -->
            <el-dialog v-model="showPasswordModal" title="修改密码" width="450px">
                <el-form :model="passwordForm" label-width="80px">
                    <el-form-item label="当前密码">
                        <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码" show-password></el-input>
                    </el-form-item>
                    <el-form-item label="新密码">
                        <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password></el-input>
                    </el-form-item>
                    <el-form-item label="确认密码">
                        <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="再次输入新密码" show-password></el-input>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <el-button @click="showPasswordModal = false">取消</el-button>
                    <el-button type="primary" @click="changePassword">确认修改</el-button>
                </template>
            </el-dialog>
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
        const showPasswordModal = Vue.ref(false);

        const passwordForm = Vue.reactive({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        });

        const getRoleName = (role) => {
            const map = { 'ADMIN': '管理员', 'TECHNICIAN': '技术员', 'OPERATOR': '操作员', 'VIEWER': '观察者' };
            return map[role] || role;
        };

        const getRoleColor = (role) => {
            const map = { 'ADMIN': '#f56c6c', 'TECHNICIAN': '#409eff', 'OPERATOR': '#e6a23c', 'VIEWER': '#909399' };
            return map[role] || '#909399';
        };

        const getRoleTagType = (role) => {
            const map = { 'ADMIN': 'danger', 'TECHNICIAN': '', 'OPERATOR': 'warning', 'VIEWER': 'info' };
            return map[role] || '';
        };

        const onAvatarChange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
                ElementPlus.ElMessage.error('头像文件不能超过 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarUrl.value = e.target.result;
                localStorage.setItem('avatar_' + user.value.username, e.target.result);
                ElementPlus.ElMessage.success('头像更换成功');
            };
            reader.readAsDataURL(file);
        };

        const changePassword = async () => {
            if (!passwordForm.oldPassword || !passwordForm.newPassword) {
                ElementPlus.ElMessage.warning('请填写完整密码信息');
                return;
            }
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                ElementPlus.ElMessage.error('两次输入的新密码不一致');
                return;
            }
            if (passwordForm.newPassword.length < 6) {
                ElementPlus.ElMessage.error('新密码长度不能少于6位');
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
                    ElementPlus.ElMessage.success('密码修改成功');
                    showPasswordModal.value = false;
                    passwordForm.oldPassword = '';
                    passwordForm.newPassword = '';
                    passwordForm.confirmPassword = '';
                } else {
                    ElementPlus.ElMessage.error(data.message || '密码修改失败');
                }
            } catch (error) {
                ElementPlus.ElMessage.error('修改失败: ' + error.message);
            }
        };

        return {
            user, avatarUrl, showPasswordModal, passwordForm,
            getRoleName, getRoleColor, getRoleTagType, onAvatarChange, changePassword
        };
    }
};
