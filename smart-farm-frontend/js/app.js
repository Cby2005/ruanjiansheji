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

// 权限配置：ADMIN > TECHNICIAN > OPERATOR > VIEWER
// hasPermission 采用层级比较，requiredRole 表示"最低需要的角色"
const routes = [
    { path: '/login', component: Login, meta: { requiresAuth: false } },
    { path: '/', component: Dashboard, meta: { requiresAuth: true } },                                              // 所有角色
    { path: '/devices', component: DeviceList, meta: { requiresAuth: true } },                                       // 所有角色（操作权限在页面内控制）
    { path: '/environment', component: EnvironmentData, meta: { requiresAuth: true } },                               // 所有角色
    { path: '/statistics', component: Statistics, meta: { requiresAuth: true } },                                     // 所有角色
    { path: '/users', component: UserManagement, meta: { requiresAuth: true, requiredRole: 'ADMIN' } },                // 仅管理员
    { path: '/ai-assistant', component: AIAssistant, meta: { requiresAuth: true, requiredRole: 'TECHNICIAN' } },       // 技术员及以上（含知识图谱+Agent决策）
    { path: '/knowledge-graph', redirect: '/ai-assistant' },                                                            // 重定向到合并页面
    { path: '/agri-knowledge', component: AgriKnowledgeHub, meta: { requiresAuth: true } },                           // 所有角色
    { path: '/project-division', component: ProjectDivision, meta: { requiresAuth: true } },                          // 所有角色
    { path: '/profile', component: UserProfile, meta: { requiresAuth: true } },                                       // 所有角色
    { path: '/tasks', component: TaskManagement, meta: { requiresAuth: true } },                                      // 所有角色（操作权限在页面内控制）
    { path: '/drones', component: DroneManagement, meta: { requiresAuth: true } },                                   // 温室无人机巡检
    { path: '/alerts', component: AlertCenter, meta: { requiresAuth: true } },                                        // 所有角色（操作权限在页面内控制）
    { path: '/yield-prediction', component: YieldPrediction, meta: { requiresAuth: true, requiredRole: 'TECHNICIAN' } } // 技术员及以上
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

// 使用 Element Plus
app.use(ElementPlus);

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// 注册组件
app.component('app-layout', AppLayout);
app.component('login', Login);
app.component('dashboard', Dashboard);
app.component('device-list', DeviceList);
app.component('environment-data', EnvironmentData);
app.component('statistics', Statistics);
app.component('user-management', UserManagement);
app.component('ai-assistant', AIAssistant);
app.component('knowledge-graph', KnowledgeGraph);
app.component('agri-knowledge-hub', AgriKnowledgeHub);
app.component('project-division', ProjectDivision);
app.component('user-profile', UserProfile);
app.component('task-management', TaskManagement);
app.component('drone-management', DroneManagement);
app.component('alert-center', AlertCenter);

// 全局提供认证状态
app.provide('authStore', authStore);

// 使用路由
app.use(router);

// 挂载应用
app.mount('#app');
