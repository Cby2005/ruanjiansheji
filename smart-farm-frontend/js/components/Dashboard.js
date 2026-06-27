// useTilt - 鼠标跟随 3D 卡片效果
function useTilt(cardRef, options) {
    const maxRotate = options?.maxRotate || 10;
    const speed = options?.speed || 400;
    const glareOpacity = options?.glareOpacity || 0.08;

    let rafId = null;
    const state = Vue.reactive({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, hovering: false });

    const handleMove = (e) => {
        if (!cardRef.value) return;
        const rect = cardRef.value.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * maxRotate;
        const rotateX = ((centerY - y) / centerY) * maxRotate;
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            state.rotateX = rotateX;
            state.rotateY = rotateY;
            state.glareX = glareX;
            state.glareY = glareY;
        });
    };

    const handleEnter = () => { state.hovering = true; };
    const handleLeave = () => {
        state.hovering = false;
        state.rotateX = 0;
        state.rotateY = 0;
        state.glareX = 50;
        state.glareY = 50;
    };

    const style = Vue.computed(() => ({
        transform: state.hovering
            ? 'perspective(800px) rotateX(' + state.rotateX + 'deg) rotateY(' + state.rotateY + 'deg)'
            : 'perspective(800px) rotateX(0deg) rotateY(0deg)',
        transition: state.hovering ? 'transform 0.1s ease-out' : 'transform ' + (speed / 1000) + 's ease-out'
    }));

    const glareStyle = Vue.computed(() => ({
        background: 'radial-gradient(circle at ' + state.glareX + '% ' + state.glareY + '%, rgba(255,255,255,' + glareOpacity + '), transparent 60%)',
        opacity: state.hovering ? 1 : 0,
        transition: 'opacity 0.3s ease'
    }));

    Vue.onUnmounted(() => { if (rafId) cancelAnimationFrame(rafId); });

    return { style, glareStyle, handleMove, handleEnter, handleLeave };
}

// Dashboard 主组件
const Dashboard = {
    template: `
        <div class="dashboard-page">
            <!-- ===== Hero 区域 ===== -->
            <section class="hero-section">
                <video
                    src="./assets/videos/strawberry-greenhouse.mp4"
                    autoplay
                    muted
                    loop
                    playsinline
                    preload="metadata"
                    aria-hidden="true"
                    style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.42;"
                ></video>
                <div class="hero-bg"></div>
                <div class="hero-content">
                    <div class="hero-left">
                        <div class="hero-badge">
                            <i class="fas fa-leaf"></i>
                            <span>智慧农业管理系统 v2.0</span>
                        </div>
                        <h1 class="hero-title">智慧农场<br>智能决策中心</h1>
                        <p class="hero-desc">
                            基于多智能体协同决策与知识图谱技术，实时监测温室环境数据，
                            自动联动灌溉、通风、补光设备，为作物全生长周期提供精准农事建议。
                        </p>
                        <div class="hero-actions">
                            <el-button v-if="isNotViewer" type="primary" size="large" @click="$router.push('/ai-assistant')">
                                <i class="fas fa-brain" style="margin-right: 8px;"></i>进入决策中心
                            </el-button>
                            <el-button v-if="isNotViewer" size="large" class="hero-btn-ghost" @click="$router.push('/environment')">
                                <i class="fas fa-chart-line" style="margin-right: 8px;"></i>查看监测数据
                            </el-button>
                        </div>
                        <div class="hero-stats">
                            <div class="hero-stat-item">
                                <span class="hero-stat-num">42,000+</span>
                                <span class="hero-stat-label">农业概念</span>
                            </div>
                            <div class="hero-stat-item">
                                <span class="hero-stat-num">50,000+</span>
                                <span class="hero-stat-label">语义关系</span>
                            </div>
                            <div class="hero-stat-item">
                                <span class="hero-stat-num">4 级</span>
                                <span class="hero-stat-label">异常处理链</span>
                            </div>
                        </div>
                    </div>
                    <div class="hero-right">
                        <div
                            ref="tiltCard"
                            class="tilt-card"
                            :style="tilt.style.value"
                            @mousemove="tilt.handleMove"
                            @mouseenter="tilt.handleEnter"
                            @mouseleave="tilt.handleLeave"
                        >
                            <div class="tilt-card-glare" :style="tilt.glareStyle.value"></div>
                            <div class="tilt-card-inner">
                                <div class="tilt-card-header">
                                    <div class="tilt-card-dot green"></div>
                                    <div class="tilt-card-dot yellow"></div>
                                    <div class="tilt-card-dot red"></div>
                                    <span class="tilt-card-title">实时监测面板</span>
                                </div>
                                <div class="tilt-card-grid">
                                    <div class="tilt-metric" v-for="m in heroMetrics" :key="m.label">
                                        <div class="tilt-metric-icon" :style="{ color: m.color }">
                                            <i :class="m.icon"></i>
                                        </div>
                                        <div class="tilt-metric-info">
                                            <span class="tilt-metric-value">{{ m.value }}</span>
                                            <span class="tilt-metric-label">{{ m.label }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="tilt-card-footer">
                                    <div class="tilt-status-dot"></div>
                                    <span>数据更新于 {{ lastUpdate }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ===== 数据概览区 ===== -->
            <section class="section-block">
                <div class="section-header">
                    <h2 class="section-title">环境数据概览</h2>
                    <span class="section-subtitle">当前温室内实时传感器数据</span>
                </div>
                <el-row :gutter="16">
                    <el-col :xs="12" :sm="8" :md="4" v-for="card in overviewCards" :key="card.label" style="margin-bottom: 16px;">
                        <div class="data-card" :style="{ borderTopColor: card.color }">
                            <div class="data-card-top">
                                <span class="data-card-value" :style="{ color: card.color }">{{ card.value }}</span>
                                <span class="data-card-unit">{{ card.unit }}</span>
                            </div>
                            <div class="data-card-bottom">
                                <span class="data-card-label">{{ card.label }}</span>
                                <i :class="card.icon" :style="{ color: card.color }"></i>
                            </div>
                            <div class="data-card-range">
                                <span>正常范围 {{ card.range }}</span>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </section>

            <!-- ===== 多智能体决策区 + 预警区 ===== -->
            <el-row :gutter="16" style="margin-bottom: 24px;">
                <el-col :xs="24" :lg="14">
                    <div class="section-block" style="margin-bottom: 0;">
                        <div class="section-header">
                            <h2 class="section-title">智能决策建议</h2>
                            <el-button size="small" text type="primary" @click="$router.push('/ai-assistant')">
                                查看全部 <i class="fas fa-arrow-right" style="margin-left: 4px;"></i>
                            </el-button>
                        </div>
                        <div class="agent-grid">
                            <div class="agent-card" v-for="agent in agentCards" :key="agent.name">
                                <div class="agent-card-header">
                                    <div class="agent-card-avatar" :style="{ background: agent.bgColor }">
                                        <i :class="agent.icon" :style="{ color: agent.color }"></i>
                                    </div>
                                    <div>
                                        <div class="agent-card-name">{{ agent.name }}</div>
                                        <div class="agent-card-role">{{ agent.role }}</div>
                                    </div>
                                    <el-tag :type="agent.tagType" size="small" style="margin-left: auto;">{{ agent.status }}</el-tag>
                                </div>
                                <div class="agent-card-body">{{ agent.advice }}</div>
                                <div class="agent-card-footer">
                                    <span class="agent-card-time">{{ agent.time }}</span>
                                    <span class="agent-card-confidence">置信度 {{ agent.confidence }}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-col>
                <el-col :xs="24" :lg="10">
                    <div class="section-block" style="margin-bottom: 0;">
                        <div class="section-header">
                            <h2 class="section-title">近期预警</h2>
                            <el-button size="small" text type="primary" @click="$router.push('/alerts')">
                                查看全部 <i class="fas fa-arrow-right" style="margin-left: 4px;"></i>
                            </el-button>
                        </div>
                        <div class="alert-list">
                            <div class="alert-item" v-for="(alert, idx) in recentAlerts" :key="idx">
                                <div class="alert-item-indicator" :style="{ background: alert.color }"></div>
                                <div class="alert-item-content">
                                    <div class="alert-item-title">{{ alert.title }}</div>
                                    <div class="alert-item-desc">{{ alert.desc }}</div>
                                </div>
                                <div class="alert-item-meta">
                                    <el-tag :type="alert.tagType" size="small">{{ alert.level }}</el-tag>
                                    <span class="alert-item-time">{{ alert.time }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-col>
            </el-row>

            <!-- ===== 趋势图 ===== -->
            <div class="section-block">
                <div class="section-header">
                    <h2 class="section-title">环境数据趋势</h2>
                    <el-button-group size="small">
                        <el-button :type="chartType === 'temp' ? 'primary' : ''" @click="updateChart('temp')">温度</el-button>
                        <el-button :type="chartType === 'humidity' ? 'primary' : ''" @click="updateChart('humidity')">湿度</el-button>
                        <el-button :type="chartType === 'light' ? 'primary' : ''" @click="updateChart('light')">光照</el-button>
                    </el-button-group>
                </div>
                <div ref="chartRef" style="height: 320px; width: 100%;"></div>
            </div>
        </div>
    `,

    setup() {
        const API_BASE_URL = 'http://localhost:8080';
        const tiltCard = Vue.ref(null);
        const chartRef = Vue.ref(null);
        const chartType = Vue.ref('temp');
        let chartInstance = null;

        // 角色权限判断
        const isNotViewer = Vue.computed(() => {
            try { return JSON.parse(localStorage.getItem('user') || '{}').role !== 'VIEWER'; } catch { return true; }
        });

        // 3D tilt 效果
        const tilt = useTilt(tiltCard, { maxRotate: 10, speed: 500, glareOpacity: 0.1 });

        // Hero 右侧卡片数据
        const heroMetrics = Vue.ref([
            { label: '土壤湿度', value: '--', icon: 'fas fa-tint', color: '#409eff' },
            { label: '空气温度', value: '--', icon: 'fas fa-temperature-half', color: '#f56c6c' },
            { label: '光照强度', value: '--', icon: 'fas fa-sun', color: '#e6a23c' },
            { label: 'CO₂ 浓度', value: '--', icon: 'fas fa-wind', color: '#67c23a' }
        ]);
        const lastUpdate = Vue.ref('--:--');

        // 数据概览卡片
        const overviewCards = Vue.ref([
            { label: '土壤湿度', value: '--', unit: '%', icon: 'fas fa-tint', color: '#409eff', range: '60-80%' },
            { label: '空气温度', value: '--', unit: '°C', icon: 'fas fa-temperature-half', color: '#f56c6c', range: '20-30°C' },
            { label: '光照强度', value: '--', unit: 'lux', icon: 'fas fa-sun', color: '#e6a23c', range: '10000-30000' },
            { label: 'CO₂ 浓度', value: '--', unit: 'ppm', icon: 'fas fa-wind', color: '#67c23a', range: '400-1000' },
            { label: '病虫害风险', value: '低', unit: '', icon: 'fas fa-shield-halved', color: '#22c55e', range: '-' }
        ]);

        // 多智能体决策卡片
        const agentCards = Vue.ref([
            {
                name: '气象专家', role: '环境监测 Agent', icon: 'fas fa-cloud-sun',
                color: '#e6a23c', bgColor: '#fdf6ec', tagType: 'success', status: '正常',
                advice: '当前气温 26.5°C，相对湿度 68%，未来 6 小时无降雨风险。建议维持当前通风状态，午后适当遮阳降温。',
                time: '10 分钟前', confidence: 92
            },
            {
                name: '土壤专家', role: '土壤分析 Agent', icon: 'fas fa-seedling',
                color: '#409eff', bgColor: '#ecf5ff', tagType: 'warning', status: '关注',
                advice: '土壤湿度 58.3%，低于番茄开花期适宜范围（65-75%）。建议启动滴灌系统，灌溉时长 15 分钟，水量 2L/m²。',
                time: '8 分钟前', confidence: 88
            },
            {
                name: '病虫害专家', role: '植保预警 Agent', icon: 'fas fa-bug',
                color: '#f56c6c', bgColor: '#fef0f0', tagType: 'success', status: '正常',
                advice: '当前虫口密度低于防治阈值，未发现灰霉病、白粉病典型症状。建议保持田间通风，3 天后复查虫情。',
                time: '15 分钟前', confidence: 85
            },
            {
                name: '农事调度', role: '任务协调 Agent', icon: 'fas fa-calendar-check',
                color: '#67c23a', bgColor: '#f0f9eb', tagType: 'success', status: '就绪',
                advice: '今日待执行任务 3 项：上午滴灌补水、午后补光灯开启、傍晚卷帘放下。建议优先处理土壤补水任务。',
                time: '5 分钟前', confidence: 95
            }
        ]);

        // 近期预警
        const recentAlerts = Vue.ref([
            { title: '土壤湿度偏低', desc: '番茄大棚 A 区土壤湿度降至 55%，低于开花期阈值', level: '中', tagType: 'warning', color: '#e6a23c', time: '10:23' },
            { title: 'CO₂ 浓度异常', desc: '草莓温室 B 区 CO₂ 浓度升至 1200ppm，需检查通风系统', level: '高', tagType: 'danger', color: '#f56c6c', time: '09:45' },
            { title: '补光灯运行超时', desc: '黄瓜大棚 C 区补光灯连续运行超过 14 小时', level: '低', tagType: 'info', color: '#909399', time: '08:30' },
            { title: '灌溉阀待维护', desc: '灌溉阀 V-003 运行时长已达维护周期，请安排检修', level: '中', tagType: 'warning', color: '#e6a23c', time: '昨天' },
            { title: '虫情监测提醒', desc: '蚜虫诱捕器计数较昨日上升 15%，建议加强巡查', level: '低', tagType: 'info', color: '#909399', time: '昨天' }
        ]);

        // 加载数据
        const loadData = async () => {
            try {
                const env = await fetch(API_BASE_URL + '/api/environment/latest', {
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                }).then(r => r.json()).catch(() => null);

                if (env && env.code === 200 && env.data) {
                    const d = env.data;
                    const hum = (d.soilHumidity || 0).toFixed(1);
                    const temp = (d.airTemperature || 0).toFixed(1);
                    const light = (d.lightIntensity || 0).toFixed(0);
                    const co2 = (d.co2 || 0).toFixed(0);

                    heroMetrics.value[0].value = hum + '%';
                    heroMetrics.value[1].value = temp + '°C';
                    heroMetrics.value[2].value = light + ' lux';
                    heroMetrics.value[3].value = co2 + ' ppm';

                    overviewCards.value[0].value = hum;
                    overviewCards.value[1].value = temp;
                    overviewCards.value[2].value = light;
                    overviewCards.value[3].value = co2;

                    const now = new Date();
                    lastUpdate.value = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                }
            } catch (e) {
                console.error('Load data failed:', e);
            }
        };

        // 趋势图
        const updateChart = (type) => {
            chartType.value = type;
            if (chartInstance) loadTrendData(type);
        };

        const loadTrendData = async (type) => {
            const configs = {
                temp: { field: 'airTemperature', name: '空气温度(°C)', color: '#f56c6c' },
                humidity: { field: 'soilHumidity', name: '土壤湿度(%)', color: '#409eff' },
                light: { field: 'lightIntensity', name: '光照强度(lux)', color: '#e6a23c' }
            };
            const cfg = configs[type];
            let labels = [], values = [];

            try {
                const res = await fetch(API_BASE_URL + '/api/environment/trend', {
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                });
                const data = await res.json();
                if (data.code === 200 && data.data && data.data.length > 0) {
                    const records = data.data.reverse();
                    labels = records.map(r => { const t = r.collectTime || ''; return t.substring(11, 16) || t.substring(5, 16); });
                    values = records.map(r => r[cfg.field] || 0);
                }
            } catch (e) { console.error(e); }

            if (labels.length === 0) {
                const now = new Date();
                for (let i = 23; i >= 0; i--) {
                    const h = new Date(now - i * 3600000);
                    labels.push(h.getHours() + ':00');
                    values.push(0);
                }
            }

            chartInstance.setOption({
                tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#eee', textStyle: { color: '#333' } },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
                xAxis: { type: 'category', data: labels, boundaryGap: false, axisLine: { lineStyle: { color: '#ddd' } }, axisLabel: { color: '#999' } },
                yAxis: { type: 'value', name: cfg.name, nameTextStyle: { color: '#999' }, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { color: '#999' } },
                series: [{
                    name: cfg.name, type: 'line', data: values, smooth: true, symbol: 'circle', symbolSize: 6,
                    lineStyle: { color: cfg.color, width: 2.5 },
                    itemStyle: { color: cfg.color, borderColor: '#fff', borderWidth: 2 },
                    areaStyle: {
                        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: cfg.color + '25' },
                                { offset: 1, color: cfg.color + '03' }
                            ]
                        }
                    }
                }]
            });
        };

        Vue.onMounted(async () => {
            await loadData();
            Vue.nextTick(() => {
                if (chartRef.value) {
                    chartInstance = echarts.init(chartRef.value);
                    updateChart('temp');
                }
            });
            window.addEventListener('resize', () => { chartInstance?.resize(); });
        });

        return {
            tiltCard, tilt, heroMetrics, lastUpdate,
            overviewCards, agentCards, recentAlerts,
            chartRef, chartType, updateChart,
            isNotViewer
        };
    }
};
