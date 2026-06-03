// 路由配置
const routes = [
    { path: '/', component: Dashboard },
    { path: '/devices', component: DeviceList },
    { path: '/environment', component: EnvironmentData },
    { path: '/statistics', component: Statistics }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
});

// 创建 Vue 应用
const app = Vue.createApp({
    template: '<app-layout></app-layout>'
});

// 注册组件
app.component('app-layout', AppLayout);
app.component('dashboard', Dashboard);
app.component('device-list', DeviceList);
app.component('environment-data', EnvironmentData);
app.component('statistics', Statistics);

// 使用路由
app.use(router);

// 挂载应用
app.mount('#app');
