const AIAssistant = {
    template: `
        <div class="agent-workbench">
            <el-row :gutter="16">
                <el-col :span="6">
                    <el-card shadow="never" style="margin-bottom: 16px;">
                        <template #header>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span style="font-weight: 700;">多 Agent 决策</span>
                                <el-tag size="small" type="success">规则型</el-tag>
                            </div>
                        </template>
                        <el-form label-position="top" size="small">
                            <el-form-item label="作物">
                                <el-select v-model="form.crop" style="width: 100%;">
                                    <el-option label="番茄 tomato" value="tomato"></el-option>
                                    <el-option label="黄瓜 cucumber" value="cucumber"></el-option>
                                    <el-option label="草莓 strawberry" value="strawberry"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="生长阶段">
                                <el-select v-model="form.growthStage" style="width: 100%;">
                                    <el-option label="苗期 seedling" value="seedling"></el-option>
                                    <el-option label="开花期 flowering" value="flowering"></el-option>
                                    <el-option label="结果期 fruiting" value="fruiting"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="当前情景">
                                <el-input v-model="form.scenario" type="textarea" :rows="3"></el-input>
                            </el-form-item>
                            <el-button type="primary" style="width: 100%;" :loading="running" @click="runWorkflow">
                                <i class="fas fa-play" style="margin-right: 6px;"></i>执行完整决策流程
                            </el-button>
                        </el-form>
                    </el-card>

                    <el-card shadow="never">
                        <template #header><span style="font-weight: 700;">流程链路</span></template>
                        <el-steps direction="vertical" :active="activeStep" finish-status="success" style="height: 420px;">
                            <el-step v-for="item in pipeline" :key="item" :title="item"></el-step>
                        </el-steps>
                    </el-card>
                </el-col>

                <el-col :span="18">
                    <el-row :gutter="16" style="margin-bottom: 16px;">
                        <el-col :span="6">
                            <el-card shadow="never">
                                <div class="metric-label">综合风险</div>
                                <div class="metric-value" :style="{ color: riskColor }">{{ riskText }}</div>
                            </el-card>
                        </el-col>
                        <el-col :span="6">
                            <el-card shadow="never">
                                <div class="metric-label">工作流 ID</div>
                                <div class="metric-value small">{{ result?.workflowId || '-' }}</div>
                            </el-card>
                        </el-col>
                        <el-col :span="6">
                            <el-card shadow="never">
                                <div class="metric-label">生成命令</div>
                                <div class="metric-value">{{ result?.commands?.length || 0 }}</div>
                            </el-card>
                        </el-col>
                        <el-col :span="6">
                            <el-card shadow="never">
                                <div class="metric-label">本次预警</div>
                                <div class="metric-value">{{ result?.alerts?.length || 0 }}</div>
                            </el-card>
                        </el-col>
                    </el-row>

                    <el-tabs v-model="activeTab" type="border-card">
                        <el-tab-pane label="专家分析" name="agents">
                            <el-empty v-if="!result" description="尚未执行决策流程"></el-empty>
                            <el-row v-else :gutter="12">
                                <el-col v-for="agent in result.decisionPlan.agentFindings" :key="agent.agentName" :span="12" style="margin-bottom: 12px;">
                                    <el-card shadow="never">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                            <strong>{{ agent.agentName }}</strong>
                                            <el-tag :type="tagType(agent.riskLevel)" size="small">{{ agent.riskLevel }}</el-tag>
                                        </div>
                                        <div style="color: #606266; font-size: 13px; margin-bottom: 8px;">{{ agent.role }}</div>
                                        <el-alert :title="agent.conclusion" :type="tagType(agent.riskLevel)" :closable="false" show-icon style="margin-bottom: 10px;"></el-alert>
                                        <div class="list-title">依据</div>
                                        <ul class="compact-list">
                                            <li v-for="item in agent.evidence" :key="item">{{ item }}</li>
                                        </ul>
                                        <div class="list-title">建议</div>
                                        <ul class="compact-list">
                                            <li v-for="item in agent.recommendations" :key="item">{{ item }}</li>
                                        </ul>
                                    </el-card>
                                </el-col>
                            </el-row>
                        </el-tab-pane>

                        <el-tab-pane label="安全审核" name="safety">
                            <el-empty v-if="!result" description="尚未执行决策流程"></el-empty>
                            <template v-else>
                                <el-alert
                                    :title="result.safetyReview.conclusion"
                                    :type="result.safetyReview.rejectedCommands.length ? 'warning' : 'success'"
                                    :closable="false"
                                    show-icon
                                    style="margin-bottom: 12px;">
                                </el-alert>
                                <el-table :data="result.commands" border size="small">
                                    <el-table-column prop="deviceCode" label="设备编号" width="120"></el-table-column>
                                    <el-table-column prop="deviceName" label="设备"></el-table-column>
                                    <el-table-column prop="action" label="动作" width="100"></el-table-column>
                                    <el-table-column prop="reason" label="原因"></el-table-column>
                                    <el-table-column label="审核" width="100">
                                        <template #default="{ row }">
                                            <el-tag :type="row.approved ? 'success' : 'danger'">{{ row.approved ? '通过' : '拦截' }}</el-tag>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </template>
                        </el-tab-pane>

                        <el-tab-pane label="虚拟执行" name="execution">
                            <el-empty v-if="!result" description="尚未执行决策流程"></el-empty>
                            <el-table v-else :data="result.executionResults" border size="small">
                                <el-table-column prop="deviceCode" label="设备编号" width="120"></el-table-column>
                                <el-table-column prop="action" label="动作" width="100"></el-table-column>
                                <el-table-column prop="result" label="执行结果"></el-table-column>
                                <el-table-column label="状态" width="100">
                                    <template #default="{ row }">
                                        <el-tag :type="row.success ? 'success' : 'info'">{{ row.success ? '已执行' : '未执行' }}</el-tag>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>

                        <el-tab-pane label="采集与预警" name="environment">
                            <el-empty v-if="!result" description="尚未执行决策流程"></el-empty>
                            <template v-else>
                                <el-descriptions title="模拟传感器数据" :column="4" border size="small" style="margin-bottom: 16px;">
                                    <el-descriptions-item label="土壤温度">{{ env.soilTemperature }}</el-descriptions-item>
                                    <el-descriptions-item label="土壤湿度">{{ env.soilHumidity }}</el-descriptions-item>
                                    <el-descriptions-item label="pH">{{ env.phValue }}</el-descriptions-item>
                                    <el-descriptions-item label="EC">{{ env.ecValue }}</el-descriptions-item>
                                    <el-descriptions-item label="养分">{{ env.nutrient }}</el-descriptions-item>
                                    <el-descriptions-item label="空气温度">{{ env.airTemperature }}</el-descriptions-item>
                                    <el-descriptions-item label="空气湿度">{{ env.airHumidity }}</el-descriptions-item>
                                    <el-descriptions-item label="光照">{{ env.lightIntensity }}</el-descriptions-item>
                                    <el-descriptions-item label="CO2">{{ env.co2 }}</el-descriptions-item>
                                    <el-descriptions-item label="风速">{{ env.windSpeed }}</el-descriptions-item>
                                    <el-descriptions-item label="降雨">{{ env.rainfall }}</el-descriptions-item>
                                    <el-descriptions-item label="虫情">{{ env.pestCount }} / {{ env.pestType }}</el-descriptions-item>
                                </el-descriptions>
                                <el-table :data="result.alerts" border size="small">
                                    <el-table-column prop="alertType" label="预警类型"></el-table-column>
                                    <el-table-column prop="alertLevel" label="级别" width="100"></el-table-column>
                                    <el-table-column prop="message" label="信息"></el-table-column>
                                </el-table>
                            </template>
                        </el-tab-pane>

                        <el-tab-pane label="决策日志" name="logs">
                            <el-button size="small" @click="loadLogs" style="margin-bottom: 10px;">刷新日志</el-button>
                            <el-table :data="logs" border size="small" height="420">
                                <el-table-column prop="workflowId" label="流程ID" width="140"></el-table-column>
                                <el-table-column prop="agentName" label="Agent" width="160"></el-table-column>
                                <el-table-column prop="stage" label="阶段" width="150"></el-table-column>
                                <el-table-column prop="riskLevel" label="风险" width="90"></el-table-column>
                                <el-table-column prop="outputSummary" label="输出摘要"></el-table-column>
                                <el-table-column prop="createTime" label="时间" width="180"></el-table-column>
                            </el-table>
                        </el-tab-pane>
                    </el-tabs>
                </el-col>
            </el-row>
        </div>
    `,

    setup() {
        const API_BASE_URL = 'http://localhost:8080';
        const running = Vue.ref(false);
        const result = Vue.ref(null);
        const logs = Vue.ref([]);
        const activeTab = Vue.ref('agents');
        const activeStep = Vue.ref(0);
        const pipeline = Vue.ref([
            '模拟传感器数据',
            '环境数据采集中心',
            '专家 Agent 分析',
            '总控调度汇总',
            '安全审核',
            '生成控制命令',
            '虚拟设备执行',
            '记录日志与预警'
        ]);
        const form = Vue.reactive({
            crop: 'tomato',
            growthStage: 'flowering',
            scenario: '连续阴雨后出现虫害压力'
        });

        const headers = () => ({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
        });

        const runWorkflow = async () => {
            running.value = true;
            activeStep.value = 1;
            try {
                const res = await fetch(API_BASE_URL + '/api/agents/workflow/run', {
                    method: 'POST',
                    headers: headers(),
                    body: JSON.stringify(form)
                });
                const data = await res.json();
                if (data.code !== 200) {
                    throw new Error(data.message || '执行失败');
                }
                result.value = data.data;
                pipeline.value = data.data.pipeline || pipeline.value;
                activeStep.value = pipeline.value.length;
                activeTab.value = 'agents';
                logs.value = data.data.decisionLogs || [];
                ElementPlus.ElMessage.success('多 Agent 决策流程执行完成');
            } catch (error) {
                ElementPlus.ElMessage.error(error.message || '执行失败');
                activeStep.value = 0;
            } finally {
                running.value = false;
            }
        };

        const loadLogs = async () => {
            const res = await fetch(API_BASE_URL + '/api/agents/logs/latest', { headers: headers() });
            const data = await res.json();
            if (data.code === 200) {
                logs.value = data.data;
            }
        };

        const tagType = (risk) => {
            if (risk === 'HIGH') return 'danger';
            if (risk === 'MEDIUM') return 'warning';
            return 'success';
        };

        const riskText = Vue.computed(() => result.value?.decisionPlan?.overallRiskLevel || '-');
        const riskColor = Vue.computed(() => {
            const risk = riskText.value;
            if (risk === 'HIGH') return '#f56c6c';
            if (risk === 'MEDIUM') return '#e6a23c';
            if (risk === 'LOW') return '#67c23a';
            return '#909399';
        });
        const env = Vue.computed(() => result.value?.environmentRecord || {});

        Vue.onMounted(loadLogs);

        return {
            form,
            running,
            result,
            logs,
            activeTab,
            activeStep,
            pipeline,
            env,
            riskText,
            riskColor,
            tagType,
            runWorkflow,
            loadLogs
        };
    }
};
