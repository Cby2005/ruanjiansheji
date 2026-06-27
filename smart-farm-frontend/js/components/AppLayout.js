const AppLayout = {
    template: `
        <div>
            <!-- 登录页面不显示布局 -->
            <template v-if="isLoginPage">
                <router-view></router-view>
            </template>

            <!-- 后台管理布局 -->
            <template v-else>
                <el-container style="height: 100vh;">
                    <!-- 左侧菜单 -->
                    <el-aside :width="isCollapse ? '64px' : '220px'" style="transition: width 0.3s; background-color: #304156;">
                        <div style="height: 60px; display: flex; align-items: center; justify-content: center; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <i class="fas fa-seedling" style="font-size: 20px; color: #67c23a;"></i>
                            <span v-if="!isCollapse" style="margin-left: 10px; font-size: 16px; font-weight: bold; white-space: nowrap;">智慧农场</span>
                        </div>
                        <el-scrollbar>
                            <el-menu
                                :default-active="activeMenu"
                                :collapse="isCollapse"
                                background-color="#304156"
                                text-color="#bfcbd9"
                                active-text-color="#409eff"
                                router
                                :collapse-transition="false">
                                <el-menu-item index="/">
                                    <i class="fas fa-tachometer-alt" style="margin-right: 10px; width: 20px; text-align: center;"></i>
                                    <template #title>首页大屏</template>
                                </el-menu-item>
                                <el-menu-item index="/environment">
                                    <i class="fas fa-leaf" style="margin-right: 10px; width: 20px; text-align: center;"></i>
                                    <template #title>环境监测</template>
                                </el-menu-item>
                                <el-menu-item index="/ai-assistant" v-if="hasPermission('TECHNICIAN')">
                                    <i class="fas fa-brain" style="margin-right: 10px; width: 20px; text-align: center;"></i>
                                    <template #title>智能决策中心</template>
                                </el-menu-item>
                                <el-menu-item index="/agri-knowledge">
                                    <i class="fas fa-cloud-sun-rain" style="margin-right: 10px; width: 20px; text-align: center;"></i>
                                    <template #title>农业知识决策</template>
                                </el-menu-item>
                                <el-menu-item index="/project-division">
                                    <i class="fas fa-clipboard-check" style="margin-right: 10px; width: 20px; text-align: center;"></i>
                                    <template #title>分工功能看板</template>
                                </el-menu-item>
                                <el-menu-item index="/devices">
                                    <i class="fas fa-cogs" style="margin-right: 10px; width: 20px; text-align: center;"></i>
                                    <template #title>智能设备控制</template>
                                </el-menu-item>
                                <el-menu-item index="/tasks">
                                    <i class="fas fa-tasks" style="margin-right: 10px; width: 20px; text-align: center;"></i>
                                    <template #title>农事任务管理</template>
                                </el-menu-item>
                                <el-sub-menu index="drone">
                                    <template #title>
                                        <i class="fas fa-helicopter" style="margin-right: 10px; width: 20px; text-align: center;"></i>
                                        <span>无人机巡检</span>
                                    </template>
                                    <el-menu-item index="/drones?tab=devices">无人机设备</el-menu-item>
                                    <el-menu-item index="/drones?tab=points">巡检点位</el-menu-item>
                                    <el-menu-item index="/drones?tab=routes">路径规划</el-menu-item>
                                    <el-menu-item index="/drones?tab=tasks">巡检任务</el-menu-item>
                                    <el-menu-item index="/drones?tab=images">巡检影像</el-menu-item>
                                    <el-menu-item index="/drones?tab=reports">巡检报告</el-menu-item>
                                </el-sub-menu>
                                <el-menu-item index="/alerts">
                                    <i class="fas fa-exclamation-triangle" style="margin-right: 10px; width: 20px; text-align: center;"></i>
                                    <template #title>预警中心</template>
                                </el-menu-item>
                                <el-menu-item index="/statistics">
                                    <i class="fas fa-chart-bar" style="margin-right: 10px; width: 20px; text-align: center;"></i>
                                    <template #title>统计分析</template>
                                </el-menu-item>
                                <el-menu-item index="/yield-prediction" v-if="hasPermission('TECHNICIAN')">
                                    <i class="fas fa-chart-line" style="margin-right: 10px; width: 20px; text-align: center;"></i>
                                    <template #title>产量预测</template>
                                </el-menu-item>
                                <el-sub-menu index="system" v-if="hasPermission('ADMIN')">
                                    <template #title>
                                        <i class="fas fa-cog" style="margin-right: 10px; width: 20px; text-align: center;"></i>
                                        <span>系统管理</span>
                                    </template>
                                    <el-menu-item index="/users">
                                        <i class="fas fa-users" style="margin-right: 10px; width: 20px; text-align: center;"></i>
                                        用户管理
                                    </el-menu-item>
                                </el-sub-menu>
                            </el-menu>
                        </el-scrollbar>
                    </el-aside>

                    <!-- 右侧区域 -->
                    <el-container>
                        <!-- 顶部栏 -->
                        <el-header style="height: 60px; background: #fff; box-shadow: 0 1px 4px rgba(0,21,41,0.08); display: flex; align-items: center; justify-content: space-between; padding: 0 20px;">
                            <div style="display: flex; align-items: center;">
                                <el-icon style="cursor: pointer; font-size: 20px;" @click="isCollapse = !isCollapse">
                                    <i :class="isCollapse ? 'fas fa-indent' : 'fas fa-outdent'" style="color: #606266;"></i>
                                </el-icon>
                                <el-breadcrumb separator="/" style="margin-left: 20px;">
                                    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                                    <el-breadcrumb-item v-if="currentPageTitle !== '首页大屏'">{{ currentPageTitle }}</el-breadcrumb-item>
                                </el-breadcrumb>
                            </div>
                            <div style="display: flex; align-items: center;">
                                <el-tooltip content="刷新" placement="bottom">
                                    <el-button :icon="Refresh" circle size="small" @click="refreshData" style="margin-right: 15px;"></el-button>
                                </el-tooltip>
                                <el-dropdown @command="handleCommand" trigger="click">
                                    <div style="display: flex; align-items: center; cursor: pointer;">
                                        <el-avatar :size="32" :style="{ backgroundColor: getRoleColor(user?.role) }">
                                            <img v-if="userAvatar" :src="userAvatar" style="width: 100%; height: 100%; object-fit: cover;" />
                                            <i v-else class="fas fa-user"></i>
                                        </el-avatar>
                                        <span style="margin-left: 8px; font-size: 14px; color: #606266;">{{ user?.username }}</span>
                                        <el-icon style="margin-left: 4px;"><i class="fas fa-chevron-down" style="font-size: 10px; color: #909399;"></i></el-icon>
                                    </div>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item command="profile">
                                                <i class="fas fa-user-circle" style="margin-right: 8px;"></i>个人中心
                                            </el-dropdown-item>
                                            <el-dropdown-item command="logout" divided>
                                                <i class="fas fa-sign-out-alt" style="margin-right: 8px;"></i>退出登录
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </div>
                        </el-header>

                        <!-- 内容区 -->
                        <el-main style="background: #f0f2f5; padding: 20px; overflow: auto;">
                            <router-view v-slot="{ Component }">
                                <transition name="fade" mode="out-in">
                                    <component :is="Component" />
                                </transition>
                            </router-view>
                        </el-main>
                    </el-container>
                </el-container>
            </template>
        </div>
    `,

    setup() {
        const route = VueRouter.useRoute();
        const router = VueRouter.useRouter();
        const isCollapse = Vue.ref(false);

        const Refresh = ElementPlusIconsVue.Refresh;

        const isLoginPage = Vue.computed(() => route.path === '/login');

        const user = Vue.computed(() => {
            try {
                return JSON.parse(localStorage.getItem('user') || 'null');
            } catch {
                return null;
            }
        });

        const userAvatar = Vue.computed(() => {
            if (!user.value) return '';
            return localStorage.getItem('avatar_' + user.value.username) || '';
        });

        const menuItems = [
            { path: '/', name: '首页大屏' },
            { path: '/environment', name: '环境监测' },
            { path: '/ai-assistant', name: '智能决策中心' },
            { path: '/agri-knowledge', name: '农业知识决策' },
            { path: '/project-division', name: '分工功能看板' },
            { path: '/devices', name: '智能设备控制' },
            { path: '/tasks', name: '农事任务管理' },
            { path: '/drones', name: '无人机巡检' },
            { path: '/alerts', name: '预警中心' },
            { path: '/statistics', name: '统计分析' },
            { path: '/yield-prediction', name: '产量预测' },
            { path: '/users', name: '用户管理' }
        ];

        const activeMenu = Vue.computed(() => {
            return route.path === '/drones' ? route.fullPath : route.path;
        });

        const currentPageTitle = Vue.computed(() => {
            if (route.path === '/drones') {
                const names = { devices: '无人机设备', points: '巡检点位', routes: '路径规划', tasks: '巡检任务', images: '巡检影像', reports: '巡检报告' };
                return names[route.query.tab] || '无人机巡检';
            }
            const item = menuItems.find(m => m.path === route.path);
            return item ? item.name : '首页大屏';
        });

        const getRoleColor = (role) => {
            const map = { 'ADMIN': '#f56c6c', 'TECHNICIAN': '#409eff', 'OPERATOR': '#e6a23c', 'VIEWER': '#909399' };
            return map[role] || '#909399';
        };

        const hasPermission = (requiredRole) => {
            const roleHierarchy = { 'ADMIN': 4, 'TECHNICIAN': 3, 'OPERATOR': 2, 'VIEWER': 1 };
            const userRole = user.value?.role || 'VIEWER';
            return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
        };

        const refreshData = () => {
            window.location.reload();
        };

        const handleCommand = (command) => {
            if (command === 'profile') {
                router.push('/profile');
            } else if (command === 'logout') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '#/login';
                window.location.reload();
            }
        };

        return {
            isCollapse,
            isLoginPage,
            user,
            userAvatar,
            activeMenu,
            currentPageTitle,
            getRoleColor,
            hasPermission,
            refreshData,
            handleCommand,
            Refresh
        };
    }
};
