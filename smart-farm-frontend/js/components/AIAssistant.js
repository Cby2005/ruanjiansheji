const AIAssistant = {
    template: `
        <div class="agent-workbench">
            <!-- 顶部概览 -->
            <div class="agent-hero">
                <div class="agent-hero-left">
                    <h2 class="agent-hero-title">智能决策中心</h2>
                    <p class="agent-hero-desc">
                        结合多 Agent 协同分析、RAG 文档检索与知识图谱三元组，为当前农事场景生成综合决策建议。
                    </p>
                    <el-button type="primary" size="large" @click="showInput = true">
                        <i class="fas fa-sliders" style="margin-right: 8px;"></i>输入决策参数
                    </el-button>
                </div>
                <div class="agent-hero-right">
                    <div class="agent-stat-row">
                        <div class="agent-stat-card">
                            <div class="agent-stat-label">风险等级</div>
                            <div class="agent-stat-value" :style="{ color: riskColor }">{{ decision?.riskLevel || '--' }}</div>
                        </div>
                        <div class="agent-stat-card">
                            <div class="agent-stat-label">RAG 证据</div>
                            <div class="agent-stat-value">{{ decision?.ragEvidence?.length || 0 }} 条</div>
                        </div>
                        <div class="agent-stat-card">
                            <div class="agent-stat-label">KG 三元组</div>
                            <div class="agent-stat-value">{{ decision?.kgEvidence?.length || 0 }} 条</div>
                        </div>
                        <div class="agent-stat-card">
                            <div class="agent-stat-label">Agent 步骤</div>
                            <div class="agent-stat-value">{{ decision?.agentSteps?.length || 0 }} 步</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 主体内容：左分析 + 右建议 -->
            <el-row :gutter="16" style="margin-bottom: 20px;">
                <el-col :xs="24" :lg="14">
                    <div class="agent-panel">
                        <div class="agent-panel-header">
                            <span class="agent-panel-title">Agent 分析过程</span>
                        </div>
                        <el-empty v-if="!decision" description="请先输入参数并生成决策">
                            <el-button type="primary" @click="showInput = true">输入参数</el-button>
                        </el-empty>
                        <div v-else class="agent-steps">
                            <div class="agent-step" v-for="(step, idx) in decision.agentSteps" :key="idx">
                                <div class="agent-step-num">{{ idx + 1 }}</div>
                                <div class="agent-step-body">
                                    <div class="agent-step-name">{{ step.agentName }}</div>
                                    <div class="agent-step-result">{{ step.result }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-col>
                <el-col :xs="24" :lg="10">
                    <div class="agent-panel" style="margin-bottom: 16px;">
                        <div class="agent-panel-header">
                            <span class="agent-panel-title">综合建议</span>
                        </div>
                        <el-empty v-if="!decision" description="生成决策后查看建议"></el-empty>
                        <template v-else>
                            <div class="agent-summary" :class="summaryClass">
                                <i :class="summaryIcon" style="margin-right: 8px;"></i>{{ decision.summary }}
                            </div>
                            <div class="agent-tags">
                                <span class="agent-tag" v-for="item in decision.suggestions || []" :key="item">
                                    <i class="fas fa-check-circle" style="margin-right: 4px; opacity: 0.6;"></i>{{ item }}
                                </span>
                            </div>
                        </template>
                    </div>
                    <div class="agent-panel" v-if="decision">
                        <div class="agent-panel-header">
                            <span class="agent-panel-title">安全提示</span>
                        </div>
                        <div class="agent-notice warn" v-if="decision.ragWarning">
                            <i class="fas fa-exclamation-triangle"></i>{{ decision.ragWarning }}
                        </div>
                        <div class="agent-notice danger">
                            <i class="fas fa-shield-halved"></i>{{ decision.pesticideSafetyNotice }}
                        </div>
                    </div>
                </el-col>
            </el-row>

            <!-- 底部操作按钮 -->
            <div class="agent-panel">
                <div class="agent-panel-header">
                    <span class="agent-panel-title">数据详情</span>
                </div>
                <div class="agent-btn-row">
                    <el-button @click="showRag = true">
                        <i class="fas fa-file-lines" style="margin-right: 6px;"></i>RAG 文档依据
                        <el-badge :value="decision?.ragEvidence?.length || 0" :max="99" style="margin-left: 8px;" />
                    </el-button>
                    <el-button @click="showKg = true">
                        <i class="fas fa-diagram-project" style="margin-right: 6px;"></i>KG 三元组依据
                        <el-badge :value="decision?.kgEvidence?.length || 0" :max="99" style="margin-left: 8px;" />
                    </el-button>
                    <el-button @click="showGraph = true">
                        <i class="fas fa-circle-nodes" style="margin-right: 6px;"></i>知识图谱可视化
                    </el-button>
                </div>
            </div>

            <!-- ===== 弹窗：决策参数输入 ===== -->
            <el-dialog v-model="showInput" title="决策参数" width="560px" :close-on-click-modal="false">
                <el-form label-position="top" size="default">
                    <el-row :gutter="16">
                        <el-col :span="12">
                            <el-form-item label="作物">
                                <el-input v-model="form.crop" placeholder="如：小麦、番茄"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="地区">
                                <el-input v-model="form.region" placeholder="如：河南郑州"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="16">
                        <el-col :span="8">
                            <el-form-item label="土壤湿度(%)">
                                <el-input-number v-model="form.soilMoisture" :min="0" :max="100" controls-position="right" style="width: 100%;"></el-input-number>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="温度(℃)">
                                <el-input-number v-model="form.temperature" :min="-20" :max="60" controls-position="right" style="width: 100%;"></el-input-number>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="空气湿度(%)">
                                <el-input-number v-model="form.humidity" :min="0" :max="100" controls-position="right" style="width: 100%;"></el-input-number>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="16">
                        <el-col :span="12">
                            <el-form-item label="降雨(mm)">
                                <el-input-number v-model="form.precipitation" :min="0" :max="300" :step="0.1" controls-position="right" style="width: 100%;"></el-input-number>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="风速(m/s)">
                                <el-input-number v-model="form.windSpeed" :min="0" :max="50" :step="0.1" controls-position="right" style="width: 100%;"></el-input-number>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item label="用户问题">
                        <el-input v-model="form.question" type="textarea" :rows="3" placeholder="描述您关心的农事问题"></el-input>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <el-button @click="showInput = false">取消</el-button>
                    <el-button type="primary" :loading="running" @click="runDecision">
                        <i class="fas fa-play" style="margin-right: 6px;"></i>生成决策
                    </el-button>
                </template>
            </el-dialog>

            <!-- ===== 弹窗：RAG 文档依据 ===== -->
            <el-dialog v-model="showRag" title="RAG 文档依据" width="85%">
                <el-empty v-if="!(decision?.ragEvidence?.length)" description="暂无 RAG 检索结果"></el-empty>
                <el-table v-else :data="decision.ragEvidence" border size="small" max-height="480">
                    <el-table-column prop="title" label="标题" min-width="180"></el-table-column>
                    <el-table-column prop="source" label="来源" width="120"></el-table-column>
                    <el-table-column label="分数" width="90">
                        <template #default="{ row }">{{ formatScore(row.score) }}</template>
                    </el-table-column>
                    <el-table-column prop="chunkText" label="文档片段" min-width="280">
                        <template #default="{ row }">{{ cut(row.chunkText, 160) }}</template>
                    </el-table-column>
                    <el-table-column label="原文" width="80">
                        <template #default="{ row }">
                            <el-link v-if="row.sourceUrl" :href="row.sourceUrl" target="_blank" type="primary">打开</el-link>
                        </template>
                    </el-table-column>
                </el-table>
            </el-dialog>

            <!-- ===== 弹窗：KG 三元组 ===== -->
            <el-dialog v-model="showKg" title="知识图谱三元组依据" width="65%">
                <el-empty v-if="!(decision?.kgEvidence?.length)" description="暂无知识图谱证据"></el-empty>
                <el-table v-else :data="decision.kgEvidence" border size="small" max-height="480">
                    <el-table-column prop="source" label="Source"></el-table-column>
                    <el-table-column prop="relation" label="Relation" width="160"></el-table-column>
                    <el-table-column prop="target" label="Target"></el-table-column>
                </el-table>
            </el-dialog>

            <!-- ===== 弹窗：知识图谱可视化 ===== -->
            <el-dialog v-model="showGraph" title="知识图谱" width="80%" @opened="renderGraph">
                <div ref="graphRef" style="height: 500px; width: 100%;"></div>
            </el-dialog>
        </div>
    `,

    setup() {
        const API_BASE_URL = 'http://localhost:8080';
        const running = Vue.ref(false);
        const decision = Vue.ref(null);
        const showInput = Vue.ref(false);
        const showRag = Vue.ref(false);
        const showKg = Vue.ref(false);
        const showGraph = Vue.ref(false);
        const graphRef = Vue.ref(null);
        let graphChart = null;

        const form = Vue.reactive({
            farmId: 1,
            crop: '小麦',
            region: '河南郑州',
            soilMoisture: 18,
            temperature: 31,
            humidity: 82,
            precipitation: 0,
            windSpeed: 2.1,
            question: '当前是否需要灌溉？是否有病虫害风险？'
        });

        const headers = () => ({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
        });

        const runDecision = async () => {
            running.value = true;
            try {
                const res = await fetch(API_BASE_URL + '/api/agent/decision', {
                    method: 'POST',
                    headers: headers(),
                    body: JSON.stringify(form)
                });
                const data = await res.json();
                if (data.code !== 200) throw new Error(data.message || '决策失败');
                decision.value = data.data;
                showInput.value = false;
                ElementPlus.ElMessage.success('决策已生成');
            } catch (e) {
                ElementPlus.ElMessage.error(e.message || '决策失败');
            } finally {
                running.value = false;
            }
        };

        const riskColor = Vue.computed(() => {
            const lv = decision.value?.riskLevel || '';
            if (lv.includes('高')) return '#f56c6c';
            if (lv.includes('中')) return '#e6a23c';
            if (lv.includes('低')) return '#67c23a';
            return '#909399';
        });

        const summaryClass = Vue.computed(() => {
            const lv = decision.value?.riskLevel || '';
            if (lv.includes('高')) return 'summary-danger';
            if (lv.includes('中')) return 'summary-warn';
            return 'summary-ok';
        });

        const summaryIcon = Vue.computed(() => {
            const lv = decision.value?.riskLevel || '';
            if (lv.includes('高')) return 'fas fa-circle-exclamation';
            if (lv.includes('中')) return 'fas fa-triangle-exclamation';
            return 'fas fa-circle-check';
        });

        const formatScore = (s) => { const n = Number(s); return Number.isFinite(n) ? n.toFixed(3) : '--'; };
        const cut = (t, m) => !t ? '' : t.length > m ? t.slice(0, m) + '...' : t;

        // 知识图谱可视化
        const renderGraph = () => {
            if (!graphRef.value || !window.echarts) return;
            if (!graphChart) graphChart = echarts.init(graphRef.value);

            const kg = decision.value?.kgEvidence || [];
            if (!kg.length) {
                graphChart.setOption({ graphic: { type: 'text', left: 'center', top: 'center', style: { text: '暂无知识图谱数据', fontSize: 16, fill: '#999' } } });
                return;
            }

            const nodeMap = {};
            const nodes = [];
            const links = [];
            const colors = { default: '#409eff' };

            kg.forEach((t, i) => {
                if (!nodeMap[t.source]) {
                    nodeMap[t.source] = nodes.length;
                    nodes.push({ name: t.source, symbolSize: 40, itemStyle: { color: colors.default } });
                }
                if (!nodeMap[t.target]) {
                    nodeMap[t.target] = nodes.length;
                    nodes.push({ name: t.target, symbolSize: 36, itemStyle: { color: '#67c23a' } });
                }
                links.push({ source: String(nodeMap[t.source]), target: String(nodeMap[t.target]), label: { show: true, formatter: t.relation, fontSize: 10 } });
            });

            graphChart.setOption({
                tooltip: {},
                series: [{
                    type: 'graph', layout: 'force', roam: true, draggable: true,
                    data: nodes, links,
                    edgeSymbol: ['none', 'arrow'], edgeSymbolSize: 8,
                    lineStyle: { color: '#aaa', curveness: 0.15 },
                    force: { repulsion: 280, edgeLength: 120 },
                    label: { show: true, fontSize: 12 },
                    emphasis: { focus: 'adjacency' }
                }]
            }, true);
            graphChart.resize();
        };

        Vue.onBeforeUnmount(() => { if (graphChart) { graphChart.dispose(); graphChart = null; } });

        return {
            form, running, decision, showInput, showRag, showKg, showGraph,
            graphRef, runDecision, riskColor, summaryClass, summaryIcon,
            formatScore, cut, renderGraph
        };
    }
};
