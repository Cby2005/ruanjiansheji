const AppLayout = {
    template: `
        <div class="min-h-screen flex">
            <!-- 登录页面：不显示侧边栏 -->
            <template v-if="isLoginPage">
                <div class="flex-1">
                    <router-view v-slot="{ Component }">
                        <transition name="fade" mode="out-in">
                            <component :is="Component" />
                        </transition>
                    </router-view>
                </div>
            </template>

            <!-- 其他页面：显示完整布局 -->
            <template v-else>
                <!-- 侧边栏 -->
                <aside class="w-64 bg-gradient-to-b from-green-800 to-green-900 text-white shadow-lg">
                    <div class="p-6">
                        <h1 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-seedling mr-3 text-green-300"></i>
                            智慧农场
                        </h1>
                        <p class="text-green-300 text-sm mt-1">综合管理平台</p>
                    </div>

                    <nav class="mt-6">
                        <router-link
                            v-for="item in menuItems"
                            :key="item.path"
                            :to="item.path"
                            class="flex items-center px-6 py-3 text-green-100 hover:bg-green-700 transition-colors"
                            :class="{ 'bg-green-700 border-l-4 border-green-300': isActive(item.path) }"
                        >
                            <i :class="item.icon" class="mr-3 w-5"></i>
                            <span>{{ item.name }}</span>
                        </router-link>
                    </nav>

                    <div class="absolute bottom-0 w-64 p-4 bg-green-900">
                        <div class="flex items-center text-sm text-green-300">
                            <i class="fas fa-circle text-green-400 mr-2"></i>
                            <span>系统运行中</span>
                        </div>
                    </div>
                </aside>

                <!-- 主内容区 -->
                <main class="flex-1 flex flex-col">
                    <!-- 顶部导航 -->
                    <header class="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                        <div class="flex items-center">
                            <h2 class="text-xl font-semibold text-gray-800">{{ currentPageTitle }}</h2>
                        </div>
                        <div class="flex items-center space-x-4">
                            <button @click="refreshData" class="text-gray-500 hover:text-green-600 transition-colors">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            <!-- 用户信息和退出 -->
                            <div class="relative" v-if="user">
                                <button @click="showUserMenu = !showUserMenu"
                                    class="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                                        :class="getRoleBgColor(user.role)">
                                        <i class="fas fa-user"></i>
                                    </div>
                                    <div class="text-left">
                                        <p class="text-sm font-medium text-gray-700">{{ user.username }}</p>
                                        <p class="text-xs text-gray-400">{{ getRoleName(user.role) }}</p>
                                    </div>
                                    <i class="fas fa-chevron-down text-xs text-gray-400"></i>
                                </button>

                                <!-- 下拉菜单 -->
                                <div v-if="showUserMenu"
                                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-50">
                                    <div class="p-3 border-b">
                                        <p class="text-sm font-medium text-gray-700">{{ user.username }}</p>
                                        <p class="text-xs text-gray-400">角色：{{ getRoleName(user.role) }}</p>
                                    </div>
                                    <button @click="logout"
                                        class="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                        <i class="fas fa-sign-out-alt mr-2"></i>退出登录
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>

                    <!-- 页面内容 -->
                    <div class="flex-1 p-6 overflow-auto">
                        <router-view v-slot="{ Component }">
                            <transition name="fade" mode="out-in">
                                <component :is="Component" />
                            </transition>
                        </router-view>
                    </div>
                </main>
            </template>
        </div>
    `,

    setup() {
        const route = VueRouter.useRoute();
        const showUserMenu = Vue.ref(false);

        // 判断是否是登录页面
        const isLoginPage = Vue.computed(() => {
            return route.path === '/login';
        });

        const user = Vue.computed(() => {
            try {
                return JSON.parse(localStorage.getItem('user') || 'null');
            } catch {
                return null;
            }
        });

        const menuItems = [
            { path: '/', name: '系统总览', icon: 'fas fa-tachometer-alt' },
            { path: '/devices', name: '设备管理', icon: 'fas fa-cogs' },
            { path: '/environment', name: '环境监测', icon: 'fas fa-leaf' },
            { path: '/statistics', name: '数据统计', icon: 'fas fa-chart-bar' }
        ];

        const isActive = (path) => {
            if (path === '/') return route.path === '/';
            return route.path.startsWith(path);
        };

        const currentPageTitle = Vue.computed(() => {
            const item = menuItems.find(m => isActive(m.path));
            return item ? item.name : '智慧农场';
        });

        const refreshData = () => {
            window.location.reload();
        };

        const logout = () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '#/login';
            window.location.reload();
        };

        const getRoleName = (role) => {
            const roleNames = {
                'ADMIN': '管理员',
                'TECHNICIAN': '技术员',
                'OPERATOR': '操作员',
                'VIEWER': '观察者'
            };
            return roleNames[role] || role;
        };

        const getRoleBgColor = (role) => {
            const colors = {
                'ADMIN': 'bg-red-500',
                'TECHNICIAN': 'bg-blue-500',
                'OPERATOR': 'bg-yellow-500',
                'VIEWER': 'bg-gray-500'
            };
            return colors[role] || 'bg-gray-500';
        };

        // 点击外部关闭菜单
        Vue.onMounted(() => {
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.relative')) {
                    showUserMenu.value = false;
                }
            });
        });

        return {
            isLoginPage,
            menuItems,
            isActive,
            currentPageTitle,
            refreshData,
            user,
            showUserMenu,
            logout,
            getRoleName,
            getRoleBgColor
        };
    }
};
