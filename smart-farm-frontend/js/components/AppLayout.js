const AppLayout = {
    template: `
        <div class="min-h-screen flex">
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
                        <div class="flex items-center space-x-2">
                            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                                <i class="fas fa-user"></i>
                            </div>
                            <span class="text-sm text-gray-600">管理员</span>
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
        </div>
    `,

    setup() {
        const route = VueRouter.useRoute();

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

        return {
            menuItems,
            isActive,
            currentPageTitle,
            refreshData
        };
    }
};
