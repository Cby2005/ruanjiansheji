const KnowledgeGraph = {
    template: `
        <div class="knowledge-graph-page">
            <!-- 顶部：检索入口 + 图谱统计 -->
            <el-row :gutter="16" style="margin-bottom: 20px;">
                <el-col :span="8">
                    <el-card shadow="never">
                        <template #header><span style="font-weight: 700;">知识检索</span></template>
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
                </el-col>
                <el-col :span="16">
                    <el-row :gutter="16" style="margin-bottom: 16px;">
                        <el-col :span="6">
                            <el-card shadow="never" class="summary-card">
                                <div class="kg-metric-label">实体</div>
                                <div class="kg-metric-value">{{ overview.entityCount || 0 }}</div>
                            </el-card>
                        </el-col>
                        <el-col :span="6">
                            <el-card shadow="never" class="summary-card">
                                <div class="kg-metric-label">关系</div>
                                <div class="kg-metric-value">{{ overview.relationCount || 0 }}</div>
                            </el-card>
                        </el-col>
                        <el-col :span="6">
                            <el-card shadow="never" class="summary-card">
                                <div class="kg-metric-label">文档</div>
                                <div class="kg-metric-value">{{ overview.documentCount || 0 }}</div>
                            </el-card>
                        </el-col>
                        <el-col :span="6">
                            <el-card shadow="never" class="summary-card">
                                <div class="kg-metric-label">片段</div>
                                <div class="kg-metric-value">{{ overview.chunkCount || 0 }}</div>
                            </el-card>
                        </el-col>
                    </el-row>
                    <el-card shadow="never">
                        <template #header><span style="font-weight: 700;">检索结果概览</span></template>
                        <el-row :gutter="16">
                            <el-col :span="8">
                                <div style="text-align: center; padding: 12px 0;">
                                    <div style="font-size: 24px; font-weight: 700; color: #409eff;">{{ result.nodes?.length || 0 }}</div>
                                    <div style="font-size: 13px; color: #909399; margin-top: 4px;">命中实体</div>
                                </div>
                            </el-col>
                            <el-col :span="8">
                                <div style="text-align: center; padding: 12px 0;">
                                    <div style="font-size: 24px; font-weight: 700; color: #67c23a;">{{ result.links?.length || 0 }}</div>
                                    <div style="font-size: 13px; color: #909399; margin-top: 4px;">扩展关系</div>
                                </div>
                            </el-col>
                            <el-col :span="8">
                                <div style="text-align: center; padding: 12px 0;">
                                    <div style="font-size: 24px; font-weight: 700; color: #e6a23c;">{{ result.chunks?.length || 0 }}</div>
                                    <div style="font-size: 13px; color: #909399; margin-top: 4px;">RAG 片段</div>
                                </div>
                            </el-col>
                        </el-row>
                    </el-card>
                </el-col>
            </el-row>

            <!-- 操作按钮区 -->
            <el-card shadow="never" style="margin-bottom: 20px;">
                <template #header>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-weight: 700;">知识详情查看</span>
                        <div>
                            <el-tag v-for="(count, type) in overview.entityTypes" :key="type" size="small" style="margin-left: 6px;">
                                {{ type }} {{ count }}
                            </el-tag>
                        </div>
                    </div>
                </template>
                <el-row :gutter="12">
                    <el-col :span="6" v-for="btn in viewButtons" :key="btn.name">
                        <el-button style="width: 100%; margin-bottom: 8px;" @click="openDialog(btn.name)">
                            <i :class="btn.icon" style="margin-right: 4px;"></i>{{ btn.label }}
                        </el-button>
                    </el-col>
                </el-row>
            </el-card>

            <!-- 图谱视图弹窗 -->
            <el-dialog v-model="showGraph" title="图谱视图" width="80%" @opened="renderGraph">
                <div ref="chartRef" style="height: 520px; width: 100%;"></div>
            </el-dialog>

            <!-- RAG 决策依据弹窗 -->
            <el-dialog v-model="showContext" title="RAG 决策依据" width="60%">
                <el-empty v-if="!result.ragContext?.length" description="暂无检索依据"></el-empty>
                <el-timeline v-else>
                    <el-timeline-item v-for="(item, index) in result.ragContext" :key="index" :timestamp="'依据 ' + (index + 1)">
                        {{ item }}
                    </el-timeline-item>
                </el-timeline>
            </el-dialog>

            <!-- 实体与关系弹窗 -->
            <el-dialog v-model="showTable" title="实体与关系" width="75%">
                <div style="font-weight: 600; margin-bottom: 8px;">实体列表</div>
                <el-table :data="result.nodes || []" border size="small" height="260" style="margin-bottom: 16px;">
                    <el-table-column prop="name" label="实体" width="160"></el-table-column>
                    <el-table-column prop="type" label="类型" width="140"></el-table-column>
                    <el-table-column prop="description" label="说明"></el-table-column>
                </el-table>
                <div style="font-weight: 600; margin-bottom: 8px;">关系列表</div>
                <el-table :data="result.links || []" border size="small" height="220">
                    <el-table-column prop="source" label="源 ID" width="90"></el-table-column>
                    <el-table-column prop="relationType" label="关系" width="150"></el-table-column>
                    <el-table-column prop="target" label="目标 ID" width="90"></el-table-column>
                    <el-table-column prop="description" label="说明"></el-table-column>
                </el-table>
            </el-dialog>

            <!-- 文档片段弹窗 -->
            <el-dialog v-model="showChunks" title="文档片段" width="65%">
                <el-empty v-if="!result.chunks?.length" description="暂无文档片段"></el-empty>
                <el-card v-for="chunk in result.chunks" :key="chunk.id" shadow="never" style="margin-bottom: 10px;">
                    <div style="color: #303133; line-height: 1.7;">{{ chunk.content }}</div>
                    <div style="margin-top: 8px;">
                        <el-tag size="small" type="info">{{ chunk.keywords }}</el-tag>
                    </div>
                </el-card>
            </el-dialog>
        </div>
    `,

    setup() {
        const loading = Vue.ref(false);
        const rebuilding = Vue.ref(false);
        const chartRef = Vue.ref(null);
        let chart = null;

        const form = Vue.reactive({
            query: '高温 虫害 滴灌',
            crop: 'tomato',
            scenario: '连续阴雨后出现虫害压力'
        });
        const overview = Vue.ref({});
        const result = Vue.ref({ nodes: [], links: [], chunks: [], ragContext: [] });

        const showGraph = Vue.ref(false);
        const showContext = Vue.ref(false);
        const showTable = Vue.ref(false);
        const showChunks = Vue.ref(false);

        const viewButtons = [
            { name: 'graph', label: '图谱视图', icon: 'fas fa-diagram-project' },
            { name: 'context', label: 'RAG 决策依据', icon: 'fas fa-book' },
            { name: 'table', label: '实体与关系', icon: 'fas fa-table' },
            { name: 'chunks', label: '文档片段', icon: 'fas fa-file-alt' }
        ];

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

        const openDialog = (name) => {
            if (name === 'graph') showGraph.value = true;
            else if (name === 'context') showContext.value = true;
            else if (name === 'table') showTable.value = true;
            else if (name === 'chunks') showChunks.value = true;
        };

        const renderGraph = () => {
            if (!chartRef.value || !window.echarts) {
                return;
            }
            if (!chart) {
                chart = echarts.init(chartRef.value);
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
                tooltip: { formatter: node.name + '<br/>' + node.type + '<br/>' + (node.description || '') }
            }));
            const links = (result.value.links || []).map(link => ({
                source: String(link.source),
                target: String(link.target),
                label: { show: true, formatter: link.relationType, fontSize: 10 },
                tooltip: { formatter: link.relationType + '<br/>' + (link.description || '') }
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
            }, true);
            chart.resize();
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
            form, overview, result, loading, rebuilding, chartRef, search, rebuild, openDialog, renderGraph,
            viewButtons,
            showGraph, showContext, showTable, showChunks
        };
    }
};
