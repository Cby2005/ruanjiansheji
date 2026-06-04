// 认证状态管理
const authStore = {
    state: Vue.reactive({
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        token: localStorage.getItem('token') || null
    }),

    get isLoggedIn() {
        return !!this.state.token && !!this.state.user;
    },

    get currentUser() {
        return this.state.user;
    },

    get userRole() {
        return this.state.user?.role || 'VIEWER';
    },

    login(token, user) {
        this.state.token = token;
        this.state.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },

    logout() {
        this.state.token = null;
        this.state.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '#/login';
        window.location.reload();
    },

    hasPermission(requiredRole) {
        const roleHierarchy = {
            'ADMIN': 4,
            'TECHNICIAN': 3,
            'OPERATOR': 2,
            'VIEWER': 1
        };
        return (roleHierarchy[this.userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
    }
};

// 路由配置
const routes = [
    { path: '/login', component: Login, meta: { requiresAuth: false } },
    { path: '/', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/devices', component: DeviceList, meta: { requiresAuth: true } },
    { path: '/environment', component: EnvironmentData, meta: { requiresAuth: true } },
    { path: '/statistics', component: Statistics, meta: { requiresAuth: true } },
    { path: '/users', component: UserManagement, meta: { requiresAuth: true, requiredRole: 'ADMIN' } },
    { path: '/ai-assistant', component: AIAssistant, meta: { requiresAuth: true } },
    { path: '/profile', component: UserProfile, meta: { requiresAuth: true } }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth !== false && !authStore.isLoggedIn) {
        next('/login');
    } else if (to.path === '/login' && authStore.isLoggedIn) {
        next('/');
    } else if (to.meta.requiredRole && !authStore.hasPermission(to.meta.requiredRole)) {
        next('/'); // 权限不足，跳转首页
    } else {
        next();
    }
});

// 创建 Vue 应用
const app = Vue.createApp({
    template: '<app-layout></app-layout>'
});

// 注册组件
app.component('app-layout', AppLayout);
app.component('login', Login);
app.component('dashboard', Dashboard);
app.component('device-list', DeviceList);
app.component('environment-data', EnvironmentData);
app.component('statistics', Statistics);
app.component('user-management', UserManagement);
app.component('ai-assistant', AIAssistant);
app.component('user-profile', UserProfile);

// 全局提供认证状态
app.provide('authStore', authStore);

// 使用路由
app.use(router);

// 挂载应用
app.mount('#app');
