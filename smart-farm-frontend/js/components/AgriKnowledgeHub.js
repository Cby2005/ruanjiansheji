const AgriKnowledgeHub = {
    template: `
        <div class="agri-knowledge-hub">
            <el-row :gutter="16" style="margin-bottom: 16px;">
                <el-col :xs="24" :lg="8">
                    <el-card shadow="never" class="hub-card">
                        <template #header>
                            <div class="hub-card-header">
                                <span>天气决策输入</span>
                                <el-button size="small" type="primary" :loading="weatherLoading" @click="loadWeather">
                                    <i class="fas fa-rotate" style="margin-right: 6px;"></i>刷新
                                </el-button>
                            </div>
                        </template>
                        <el-form :inline="true" size="small" style="margin-bottom: 10px;">
                            <el-form-item label="纬度">
                                <el-input-number v-model="location.latitude" :precision="4" :step="0.1" style="width: 128px;"></el-input-number>
                            </el-form-item>
                            <el-form-item label="经度">
                                <el-input-number v-model="location.longitude" :precision="4" :step="0.1" style="width: 128px;"></el-input-number>
                            </el-form-item>
                        </el-form>
                        <el-alert v-if="weatherError" :title="weatherError" type="warning" :closable="false" style="margin-bottom: 12px;"></el-alert>
                        <el-descriptions :column="2" size="small" border>
                            <el-descriptions-item label="温度">{{ formatValue(weatherDecision.temperature, '℃') }}</el-descriptions-item>
                            <el-descriptions-item label="湿度">{{ formatValue(weatherDecision.humidity, '%') }}</el-descriptions-item>
                            <el-descriptions-item label="降雨">{{ formatValue(weatherDecision.precipitation, 'mm') }}</el-descriptions-item>
                            <el-descriptions-item label="风速">{{ formatValue(weatherDecision.windSpeed, 'm/s') }}</el-descriptions-item>
                            <el-descriptions-item label="土温">{{ formatValue(weatherDecision.soilTemperature, '℃') }}</el-descriptions-item>
                            <el-descriptions-item label="土壤水分">{{ formatValue(weatherDecision.soilMoisture, '') }}</el-descriptions-item>
                        </el-descriptions>
                        <div style="margin-top: 12px;">
                            <el-tag v-for="hint in weatherDecision.riskHints || []" :key="hint" type="warning" style="margin: 0 6px 6px 0;">
                                {{ hint }}
                            </el-tag>
                            <el-tag v-if="!(weatherDecision.riskHints || []).length" type="info">暂无风险提示</el-tag>
                        </div>
                        <div class="agent-input-text">{{ weatherDecision.agentInputText || '启动后端后可加载 Open-Meteo 天气决策输入。' }}</div>
                    </el-card>
                </el-col>

                <el-col :xs="24" :lg="16">
                    <el-card shadow="never" class="hub-card">
                        <template #header>
                            <div class="hub-card-header">
                                <span>未来天气折线图</span>
                                <el-tag size="small" type="success">Open-Meteo</el-tag>
                            </div>
                        </template>
                        <div ref="forecastChartRef" class="hub-chart"></div>
                    </el-card>
                </el-col>
            </el-row>

            <el-row :gutter="16" style="margin-bottom: 16px;">
                <el-col :xs="24" :lg="10">
                    <el-card shadow="never" class="hub-card">
                        <template #header>
                            <div class="hub-card-header">
                                <span>RAG 文章来源列表</span>
                                <el-tag size="small">{{ ragSources.length }} 条</el-tag>
                            </div>
                        </template>
                        <el-table :data="ragSources" size="small" height="360" border>
                            <el-table-column prop="title" label="标题" min-width="220"></el-table-column>
                            <el-table-column prop="type" label="类型" width="110"></el-table-column>
                            <el-table-column label="来源" width="92">
                                <template #default="{ row }">
                                    <el-link :href="row.url" target="_blank" type="primary">打开</el-link>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-card>
                </el-col>

                <el-col :xs="24" :lg="14">
                    <el-card shadow="never" class="hub-card">
                        <template #header>
                            <div class="hub-card-header">
                                <span>知识图谱关系图</span>
                                <el-button size="small" :loading="graphLoading" @click="loadKnowledgeGraph">
                                    <i class="fas fa-project-diagram" style="margin-right: 6px;"></i>加载关系
                                </el-button>
                            </div>
                        </template>
                        <div ref="kgChartRef" class="hub-chart"></div>
                    </el-card>
                </el-col>
            </el-row>

            <el-card shadow="never" class="hub-card pesticide-panel">
                <template #header>
                    <div class="hub-card-header">
                        <span>农药登记信息 + 安全提示</span>
                        <el-tag size="small" type="danger">安全约束</el-tag>
                    </div>
                </template>
                <el-alert
                    title="具体药剂、浓度、施用次数和安全间隔期应以农药标签、登记信息和当地农技部门指导为准。"
                    type="error"
                    :closable="false"
                    show-icon
                    style="margin-bottom: 14px;">
                </el-alert>
                <el-table :data="pesticideRegistrations" size="small" border>
                    <el-table-column prop="registrationNo" label="登记证号" width="130"></el-table-column>
                    <el-table-column prop="pesticideName" label="农药名称" min-width="140"></el-table-column>
                    <el-table-column prop="activeIngredient" label="有效成分" min-width="150"></el-table-column>
                    <el-table-column prop="cropOrSite" label="作物/场所" min-width="130"></el-table-column>
                    <el-table-column prop="controlTarget" label="防治对象" min-width="140"></el-table-column>
                    <el-table-column prop="applicationMethod" label="使用方法" min-width="130"></el-table-column>
                    <el-table-column prop="validUntil" label="有效期至" width="120"></el-table-column>
                </el-table>
                <el-empty v-if="!pesticideRegistrations.length" description="暂无登记明细，请先导入真实 pesticide_registration.csv 数据。"></el-empty>
            </el-card>
        </div>
    `,

    setup() {
        const weatherLoading = Vue.ref(false);
        const graphLoading = Vue.ref(false);
        const weatherError = Vue.ref('');
        const forecastChartRef = Vue.ref(null);
        const kgChartRef = Vue.ref(null);
        let forecastChart = null;
        let kgChart = null;

        const location = Vue.reactive({
            farmId: 1,
            latitude: 39.9042,
            longitude: 116.4074
        });

        const weatherDecision = Vue.ref({});
        const forecast = Vue.ref({ hourly: [] });
        const pesticideRegistrations = Vue.ref([]);

        const ragSources = Vue.ref([
            { title: '2025年粮食作物重大病虫害防控技术方案', type: '防控方案', url: 'https://www.agri.cn/zx/zxfb/202502/t20250228_8715477.htm' },
            { title: '2025年园艺作物重大病虫害防控技术方案', type: '防控方案', url: 'https://www.agri.cn/zx/zxfb/202502/t20250228_8715479.htm' },
            { title: '2025年水稻“一喷多促”技术意见', type: '农事指导', url: 'https://www.agri.cn/sc/nszd/202508/t20250809_8758891.htm' },
            { title: '2025年全国早稻病虫害发生趋势预报', type: '病虫预报', url: 'https://www.agri.cn/sc/zxjc/zwbch/202506/t20250605_8738822.htm' },
            { title: '2024年我国农药登记情况及特点分析', type: '农药登记', url: 'https://www.chinapesticide.org.cn/zwb/detail/30474' },
            { title: '我国禁止和限制使用农药品种清单', type: '安全约束', url: 'https://www.chinapesticide.org.cn/kgls/detail/30477' }
        ]);

        const fallbackGraph = {
            nodes: [
                { id: 'weather', name: '高温高湿', type: 'WeatherFactor' },
                { id: 'disease', name: '病害风险', type: 'Disease' },
                { id: 'crop', name: '水稻', type: 'Crop' },
                { id: 'measure', name: '绿色防控', type: 'Measure' },
                { id: 'pesticide', name: '农药登记', type: 'Pesticide' }
            ],
            links: [
                { source: 'weather', target: 'disease', relationType: 'INCREASES_RISK_OF' },
                { source: 'crop', target: 'disease', relationType: 'HAS_DISEASE' },
                { source: 'disease', target: 'measure', relationType: 'CONTROLLED_BY' },
                { source: 'pesticide', target: 'measure', relationType: 'RELATED_TO' }
            ]
        };

        const formatValue = (value, unit) => {
            if (value === null || value === undefined || value === '') {
                return '--';
            }
            const number = Number(value);
            const text = Number.isFinite(number) ? number.toFixed(1) : value;
            return unit ? text + unit : text;
        };

        const getWeatherApi = () => {
            return window.weatherApi || {
                decisionInput: (params) => api.get('/api/weather/decision-input', { params }),
                forecast: (params) => api.get('/api/weather/forecast', { params })
            };
        };

        const weatherParams = () => ({
            farmId: location.farmId,
            latitude: location.latitude,
            longitude: location.longitude
        });

        const loadWeather = async () => {
            weatherLoading.value = true;
            weatherError.value = '';
            try {
                const [decisionData, forecastData] = await Promise.all([
                    getWeatherApi().decisionInput(weatherParams()),
                    getWeatherApi().forecast(weatherParams())
                ]);
                weatherDecision.value = decisionData || {};
                forecast.value = forecastData || { hourly: [] };
            } catch (error) {
                weatherError.value = '天气接口暂不可用，请确认后端已启动并可访问 /api/weather。';
                forecast.value = { hourly: [] };
            } finally {
                weatherLoading.value = false;
                Vue.nextTick(renderForecastChart);
            }
        };

        const renderForecastChart = () => {
            if (!forecastChartRef.value || !window.echarts) {
                return;
            }
            if (!forecastChart) {
                forecastChart = echarts.init(forecastChartRef.value);
            }
            const hourly = (forecast.value.hourly || []).slice(0, 24);
            const labels = hourly.map(item => String(item.time || '').substring(11, 16) || String(item.time || '').substring(0, 10));
            const temperatures = hourly.map(item => item.temperature ?? null);
            const humidity = hourly.map(item => item.humidity ?? null);
            const precipitation = hourly.map(item => item.precipitation ?? null);
            forecastChart.setOption({
                tooltip: { trigger: 'axis' },
                legend: { top: 0, data: ['温度', '湿度', '降雨'] },
                grid: { top: 42, left: 42, right: 24, bottom: 36 },
                xAxis: { type: 'category', data: labels, boundaryGap: false },
                yAxis: [
                    { type: 'value', name: '温度/湿度' },
                    { type: 'value', name: '降雨', position: 'right' }
                ],
                series: [
                    { name: '温度', type: 'line', smooth: true, data: temperatures, itemStyle: { color: '#e6a23c' } },
                    { name: '湿度', type: 'line', smooth: true, data: humidity, itemStyle: { color: '#409eff' } },
                    { name: '降雨', type: 'bar', yAxisIndex: 1, data: precipitation, itemStyle: { color: '#67c23a' } }
                ]
            });
        };

        const normalizeGraph = (data) => {
            if (!data || !(data.nodes || []).length) {
                return fallbackGraph;
            }
            return {
                nodes: (data.nodes || []).map(node => ({
                    id: String(node.id),
                    name: node.name || node.zhPrefLabel || node.label || String(node.id),
                    type: node.type || node.label || 'Entity'
                })),
                links: (data.links || []).map(link => ({
                    source: String(link.source),
                    target: String(link.target),
                    relationType: link.relationType || link.type || 'RELATED_TO'
                }))
            };
        };

        const loadKnowledgeGraph = async () => {
            graphLoading.value = true;
            try {
                const params = {
                    query: '水稻 病虫害 防控',
                    crop: '水稻',
                    scenario: weatherDecision.value.agentInputText || '高温高湿条件下的病虫害防控'
                };
                const data = window.knowledgeGraphApi ? await window.knowledgeGraphApi.search(params) : fallbackGraph;
                renderKnowledgeGraph(normalizeGraph(data));
            } catch (error) {
                renderKnowledgeGraph(fallbackGraph);
            } finally {
                graphLoading.value = false;
            }
        };

        const renderKnowledgeGraph = (graph) => {
            if (!kgChartRef.value || !window.echarts) {
                return;
            }
            if (!kgChart) {
                kgChart = echarts.init(kgChartRef.value);
            }
            const types = [...new Set(graph.nodes.map(node => node.type))];
            const colors = {
                WeatherFactor: '#409eff',
                Crop: '#67c23a',
                Disease: '#f56c6c',
                Pest: '#e6a23c',
                Measure: '#909399',
                Pesticide: '#8e44ad',
                Entity: '#409eff'
            };
            kgChart.setOption({
                tooltip: {},
                legend: { top: 0, data: types },
                series: [{
                    type: 'graph',
                    layout: 'force',
                    roam: true,
                    draggable: true,
                    top: 38,
                    categories: types.map(type => ({ name: type })),
                    data: graph.nodes.map(node => ({
                        id: String(node.id),
                        name: node.name,
                        category: types.indexOf(node.type),
                        symbolSize: node.type === 'Pesticide' ? 58 : 48,
                        itemStyle: { color: colors[node.type] || '#409eff' },
                        label: { show: true, overflow: 'break', width: 112 }
                    })),
                    links: graph.links.map(link => ({
                        source: String(link.source),
                        target: String(link.target),
                        label: { show: true, formatter: link.relationType, fontSize: 10 },
                        lineStyle: { curveness: 0.16 }
                    })),
                    edgeSymbol: ['none', 'arrow'],
                    edgeSymbolSize: 8,
                    force: { repulsion: 320, edgeLength: 125 }
                }]
            });
        };

        Vue.onMounted(async () => {
            await loadWeather();
            await loadKnowledgeGraph();
            window.addEventListener('resize', resizeCharts);
        });

        Vue.onBeforeUnmount(() => {
            window.removeEventListener('resize', resizeCharts);
            forecastChart?.dispose();
            kgChart?.dispose();
        });

        const resizeCharts = () => {
            forecastChart?.resize();
            kgChart?.resize();
        };

        return {
            weatherLoading,
            graphLoading,
            weatherError,
            location,
            weatherDecision,
            forecastChartRef,
            kgChartRef,
            ragSources,
            pesticideRegistrations,
            formatValue,
            loadWeather,
            loadKnowledgeGraph
        };
    }
};
