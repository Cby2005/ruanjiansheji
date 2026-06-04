const KnowledgeGraph = {
    template: `
        <div class="knowledge-graph-page">
            <el-row :gutter="16">
                <el-col :span="6">
                    <el-card shadow="never" style="margin-bottom: 16px;">
                        <template #header>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span style="font-weight: 700;">知识图谱 RAG</span>
                                <el-tag size="small" type="success">规则检索</el-tag>
                            </div>
                        </template>
                        <el-form label-position="top" size="small">
                            <el-form-item label="检索关键词">
                                <el-input v-model="form.query" placeholder="高温、蚜虫、番茄、滴灌"></el-input>
                            </el-form-item>
                            <el-form-item label="作物">
                                <el-input v-model="form.crop" placeholder="tomato / cucumber"></el-input>
                            </el-form-item>
                            <el-form-item label="情景">
                                <el-input v-model="form.scenario" type="textarea" :rows="3" placeholder="例如：连续阴雨后出现虫害压力"></el-input>
                            </el-form-item>
                            <el-button type="primary" style="width: 100%;" :loading="loading" @click="search">
                                <i class="fas fa-magnifying-glass" style="margin-right: 6px;"></i>检索图谱
                            </el-button>
                            <el-button style="width: 100%; margin: 10px 0 0 0;" :loading="rebuilding" @click="rebuild">
                                <i class="fas fa-rotate" style="margin-right: 6px;"></i>重建图谱
                            </el-button>
                        </el-form>
                    </el-card>

                    <el-card shadow="never">
                        <template #header><span style="font-weight: 700;">图谱统计</span></template>
                        <el-descriptions :column="1" size="small" border>
                            <el-descriptions-item label="实体">{{ overview.entityCount || 0 }}</el-descriptions-item>
                            <el-descriptions-item label="关系">{{ overview.relationCount || 0 }}</el-descriptions-item>
                            <el-descriptions-item label="文档">{{ overview.documentCount || 0 }}</el-descriptions-item>
                            <el-descriptions-item label="片段">{{ overview.chunkCount || 0 }}</el-descriptions-item>
                        </el-descriptions>
                        <div style="margin-top: 12px;">
                            <el-tag v-for="(count, type) in overview.entityTypes" :key="type" size="small" style="margin: 0 6px 6px 0;">
                                {{ type }} {{ count }}
                            </el-tag>
                        </div>
                    </el-card>
                </el-col>

                <el-col :span="18">
                    <el-row :gutter="16" style="margin-bottom: 16px;">
                        <el-col :span="8">
                            <el-card shadow="never">
                                <div class="kg-metric-label">命中实体</div>
                                <div class="kg-metric-value">{{ result.nodes?.length || 0 }}</div>
                            </el-card>
                        </el-col>
                        <el-col :span="8">
                            <el-card shadow="never">
                                <div class="kg-metric-label">扩展关系</div>
                                <div class="kg-metric-value">{{ result.links?.length || 0 }}</div>
                            </el-card>
                        </el-col>
                        <el-col :span="8">
                            <el-card shadow="never">
                                <div class="kg-metric-label">RAG 片段</div>
                                <div class="kg-metric-value">{{ result.chunks?.length || 0 }}</div>
                            </el-card>
                        </el-col>
                    </el-row>

                    <el-tabs v-model="activeTab" type="border-card">
                        <el-tab-pane label="图谱视图" name="graph">
                            <div ref="chartRef" style="height: 520px; width: 100%;"></div>
                        </el-tab-pane>

                        <el-tab-pane label="RAG 决策依据" name="context">
                            <el-empty v-if="!result.ragContext?.length" description="暂无检索依据"></el-empty>
                            <el-timeline v-else>
                                <el-timeline-item v-for="(item, index) in result.ragContext" :key="index" :timestamp="'依据 ' + (index + 1)">
                                    {{ item }}
                                </el-timeline-item>
                            </el-timeline>
                        </el-tab-pane>

                        <el-tab-pane label="实体与关系" name="table">
                            <el-table :data="result.nodes || []" border size="small" height="260" style="margin-bottom: 12px;">
                                <el-table-column prop="name" label="实体" width="160"></el-table-column>
                                <el-table-column prop="type" label="类型" width="140"></el-table-column>
                                <el-table-column prop="description" label="说明"></el-table-column>
                            </el-table>
                            <el-table :data="result.links || []" border size="small" height="220">
                                <el-table-column prop="source" label="源 ID" width="90"></el-table-column>
                                <el-table-column prop="relationType" label="关系" width="150"></el-table-column>
                                <el-table-column prop="target" label="目标 ID" width="90"></el-table-column>
                                <el-table-column prop="description" label="说明"></el-table-column>
                            </el-table>
                        </el-tab-pane>

                        <el-tab-pane label="文档片段" name="chunks">
                            <el-empty v-if="!result.chunks?.length" description="暂无文档片段"></el-empty>
                            <el-card v-for="chunk in result.chunks" :key="chunk.id" shadow="never" style="margin-bottom: 10px;">
                                <div style="color: #303133; line-height: 1.7;">{{ chunk.content }}</div>
                                <div style="margin-top: 8px;">
                                    <el-tag size="small" type="info">{{ chunk.keywords }}</el-tag>
                                </div>
                            </el-card>
                        </el-tab-pane>
                    </el-tabs>
                </el-col>
            </el-row>
        </div>
    `,

    setup() {
        const loading = Vue.ref(false);
        const rebuilding = Vue.ref(false);
        const activeTab = Vue.ref('graph');
        const chartRef = Vue.ref(null);
        let chart = null;

        const form = Vue.reactive({
            query: '高温 虫害 滴灌',
            crop: 'tomato',
            scenario: '连续阴雨后出现虫害压力'
        });
        const overview = Vue.ref({});
        const result = Vue.ref({ nodes: [], links: [], chunks: [], ragContext: [] });

        const categoryColor = {
            Crop: '#67c23a',
            EnvironmentFactor: '#409eff',
            PestDisease: '#f56c6c',
            Device: '#909399',
            Strategy: '#e6a23c',
            Risk: '#f56c6c',
            Fertilizer: '#9b59b6'
        };

        const getKnowledgeGraphApi = () => {
            if (window.knowledgeGraphApi) {
                return window.knowledgeGraphApi;
            }
            const unwrap = (response) => {
                const data = response.data;
                if (data && data.code === 200) {
                    return data.data;
                }
                throw new Error(data?.message || '知识图谱接口请求失败');
            };
            return {
                overview: () => axios.get('http://localhost:8080/api/knowledge-graph/overview').then(unwrap),
                search: (params) => axios.get('http://localhost:8080/api/knowledge-graph/search', { params }).then(unwrap),
                rebuild: () => axios.post('http://localhost:8080/api/knowledge-graph/rebuild').then(unwrap)
            };
        };

        const loadOverview = async () => {
            overview.value = await getKnowledgeGraphApi().overview();
        };

        const search = async () => {
            loading.value = true;
            try {
                result.value = await getKnowledgeGraphApi().search({
                    query: form.query,
                    crop: form.crop,
                    scenario: form.scenario
                });
                Vue.nextTick(renderGraph);
            } catch (error) {
                ElementPlus.ElMessage.error(error.message || '知识图谱检索失败');
            } finally {
                loading.value = false;
            }
        };

        const rebuild = async () => {
            rebuilding.value = true;
            try {
                overview.value = await getKnowledgeGraphApi().rebuild();
                ElementPlus.ElMessage.success('知识图谱已重建');
                await search();
            } catch (error) {
                ElementPlus.ElMessage.error(error.message || '重建失败');
            } finally {
                rebuilding.value = false;
            }
        };

        const renderGraph = () => {
            if (!chartRef.value || !window.echarts) {
                return;
            }
            if (!chart) {
                chart = echarts.init(chartRef.value);
                window.addEventListener('resize', () => chart && chart.resize());
            }
            const types = [...new Set((result.value.nodes || []).map(node => node.type))];
            const categories = types.map(type => ({ name: type }));
            const nodes = (result.value.nodes || []).map(node => ({
                id: String(node.id),
                name: node.name,
                category: types.indexOf(node.type),
                value: node.type,
                symbolSize: node.type === 'Strategy' ? 58 : 46,
                itemStyle: { color: categoryColor[node.type] || '#409eff' },
                label: { show: true, overflow: 'break', width: 110 },
                tooltip: { formatter: `${node.name}<br/>${node.type}<br/>${node.description || ''}` }
            }));
            const links = (result.value.links || []).map(link => ({
                source: String(link.source),
                target: String(link.target),
                label: { show: true, formatter: link.relationType, fontSize: 10 },
                tooltip: { formatter: `${link.relationType}<br/>${link.description || ''}` }
            }));
            chart.setOption({
                tooltip: {},
                legend: [{ top: 0, data: types }],
                series: [{
                    type: 'graph',
                    layout: 'force',
                    roam: true,
                    draggable: true,
                    top: 36,
                    categories,
                    data: nodes,
                    links,
                    edgeSymbol: ['none', 'arrow'],
                    edgeSymbolSize: 8,
                    lineStyle: { color: '#8c8c8c', curveness: 0.18 },
                    force: { repulsion: 360, edgeLength: 130 },
                    emphasis: { focus: 'adjacency' }
                }]
            });
        };

        Vue.onMounted(async () => {
            await loadOverview();
            await search();
        });

        Vue.onBeforeUnmount(() => {
            if (chart) {
                chart.dispose();
                chart = null;
            }
        });

        return {
            form,
            overview,
            result,
            loading,
            rebuilding,
            activeTab,
            chartRef,
            search,
            rebuild
        };
    }
};
