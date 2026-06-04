const AIAssistant = {
    template: `
        <div>
            <el-row :gutter="20">
                <!-- 左侧：Agent决策时间线 -->
                <el-col :span="16">
                    <el-card shadow="hover" style="margin-bottom: 20px;">
                        <template #header>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-weight: bold;"><i class="fas fa-robot" style="margin-right: 8px; color: #409eff;"></i>Agent 决策过程</span>
                                <el-button type="primary" size="small" @click="runAllAgents">
                                    <i class="fas fa-play" style="margin-right: 4px;"></i>执行全量分析
                                </el-button>
                            </div>
                        </template>
                        <el-timeline>
                            <el-timeline-item
                                v-for="(item, index) in timelineData"
                                :key="index"
                                :timestamp="item.time"
                                placement="top"
                                :type="item.type"
                                :hollow="item.hollow">
                                <el-card shadow="never" style="margin-top: 5px;">
                                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                                        <el-tag :type="item.tagType" size="small" style="margin-right: 8px;">{{ item.agent }}</el-tag>
                                        <span style="font-weight: bold; font-size: 14px;">{{ item.title }}</span>
                                    </div>
                                    <p style="color: #606266; font-size: 13px; margin: 0;">{{ item.content }}</p>
                                    <div v-if="item.suggestion" style="margin-top: 8px; padding: 8px 12px; background: #f0f9eb; border-radius: 4px; border-left: 3px solid #67c23a;">
                                        <span style="font-size: 12px; color: #67c23a; font-weight: bold;">建议：</span>
                                        <span style="font-size: 12px; color: #606266;">{{ item.suggestion }}</span>
                                    </div>
                                </el-card>
                            </el-timeline-item>
                        </el-timeline>
                        <el-empty v-if="timelineData.length === 0" description="暂无决策记录，点击上方按钮开始分析"></el-empty>
                    </el-card>
                </el-col>

                <!-- 右侧：智能问答 + 快速分析 -->
                <el-col :span="8">
                    <!-- 智能问答 -->
                    <el-card shadow="hover" style="margin-bottom: 20px;">
                        <template #header>
                            <span style="font-weight: bold;"><i class="fas fa-comments" style="margin-right: 8px; color: #67c23a;"></i>智能问答</span>
                        </template>
                        <div style="height: 300px; overflow-y: auto; border: 1px solid #ebeef5; border-radius: 4px; padding: 10px; margin-bottom: 10px;" ref="chatRef">
                            <div v-for="(msg, i) in chatMessages" :key="i" :style="{ textAlign: msg.role === 'user' ? 'right' : 'left', marginBottom: '10px' }">
                                <div :style="{
                                    display: 'inline-block',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    maxWidth: '85%',
                                    fontSize: '13px',
                                    background: msg.role === 'user' ? '#409eff' : '#f4f4f5',
                                    color: msg.role === 'user' ? '#fff' : '#303133'
                                }">{{ msg.text }}</div>
                            </div>
                        </div>
                        <el-input v-model="question" placeholder="输入问题..." @keyup.enter="askQuestion">
                            <template #append>
                                <el-button @click="askQuestion"><i class="fas fa-paper-plane"></i></el-button>
                            </template>
                        </el-input>
                    </el-card>

                    <!-- 快速分析 -->
                    <el-card shadow="hover">
                        <template #header>
                            <span style="font-weight: bold;"><i class="fas fa-bolt" style="margin-right: 8px; color: #e6a23c;"></i>快速分析</span>
                        </template>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <el-button type="primary" plain @click="analyzeEnvironment" :loading="loadingEnv">
                                <i class="fas fa-leaf" style="margin-right: 6px;"></i>环境分析
                            </el-button>
                            <el-button type="warning" plain @click="analyzeAlert" :loading="loadingAlert">
                                <i class="fas fa-exclamation-triangle" style="margin-right: 6px;"></i>预警分析
                            </el-button>
                            <el-button type="success" plain @click="analyzeIrrigation" :loading="loadingIrrigation">
                                <i class="fas fa-tint" style="margin-right: 6px;"></i>灌溉建议
                            </el-button>
                        </div>
                        <div v-if="analysisResult" style="margin-top: 15px; padding: 12px; background: #f0f9eb; border-radius: 4px; border-left: 3px solid #67c23a;">
                            <p style="margin: 0; font-size: 13px; color: #303133; line-height: 1.6;">{{ analysisResult }}</p>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    `,

    setup() {
        const API_BASE_URL = 'http://localhost:8080';
        const question = Vue.ref('');
        const chatMessages = Vue.ref([]);
        const analysisResult = Vue.ref('');
        const chatRef = Vue.ref(null);
        const loadingEnv = Vue.ref(false);
        const loadingAlert = Vue.ref(false);
        const loadingIrrigation = Vue.ref(false);

        const timelineData = Vue.ref([]);

        const getHeaders = () => ({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        });

        const cleanResult = (text) => {
            return (text || '').replace(/[*#\-]/g, '').replace(/\n+/g, ' ').trim();
        };

        const runAllAgents = async () => {
            try {
                const res = await fetch(API_BASE_URL + '/api/agent/analyze-environment', {
                    method: 'POST',
                    headers: getHeaders()
                });
                const data = await res.json();
                if (data.code === 200) {
                    const result = data.data;
                    const now = new Date().toLocaleString('zh-CN');
                    timelineData.value = [
                        { time: now, agent: '土壤专家', title: '土壤状态评估', content: '当前土壤湿度处于正常范围', suggestion: '建议适当灌溉保持湿度', type: 'primary', tagType: '', hollow: false },
                        { time: now, agent: '气象专家', title: '气象趋势分析', content: '温度变化趋势正常', suggestion: '注意防暑降温', type: 'success', tagType: 'success', hollow: false },
                        { time: now, agent: '虫情专家', title: '虫情风险评估', content: '当前虫情风险较低', suggestion: '定期巡查', type: 'warning', tagType: 'warning', hollow: false },
                        { time: now, agent: '安全审核', title: '综合安全评估', content: cleanResult(result), suggestion: '', type: 'info', tagType: 'info', hollow: false }
                    ];
                    ElementPlus.ElMessage.success('Agent 分析完成');
                }
            } catch (e) {
                ElementPlus.ElMessage.error('分析失败');
            }
        };

        const analyzeEnvironment = async () => {
            loadingEnv.value = true;
            try {
                const res = await fetch(API_BASE_URL + '/api/agent/analyze-environment', {
                    method: 'POST', headers: getHeaders()
                });
                const data = await res.json();
                analysisResult.value = data.code === 200 ? cleanResult(data.data) : '分析失败';
            } catch (e) {
                analysisResult.value = '请求失败';
            }
            loadingEnv.value = false;
        };

        const analyzeAlert = async () => {
            loadingAlert.value = true;
            try {
                const res = await fetch(API_BASE_URL + '/api/agent/analyze-alerts', {
                    method: 'POST', headers: getHeaders()
                });
                const data = await res.json();
                analysisResult.value = data.code === 200 ? cleanResult(data.data) : '分析失败';
            } catch (e) {
                analysisResult.value = '请求失败';
            }
            loadingAlert.value = false;
        };

        const analyzeIrrigation = async () => {
            loadingIrrigation.value = true;
            try {
                const res = await fetch(API_BASE_URL + '/api/agent/ask', {
                    method: 'POST', headers: getHeaders(),
                    body: JSON.stringify({ question: '请给出灌溉建议' })
                });
                const data = await res.json();
                analysisResult.value = data.code === 200 ? cleanResult(data.data.answer || data.data) : '分析失败';
            } catch (e) {
                analysisResult.value = '请求失败';
            }
            loadingIrrigation.value = false;
        };

        const askQuestion = async () => {
            if (!question.value.trim()) return;
            const q = question.value;
            chatMessages.value.push({ role: 'user', text: q });
            question.value = '';
            Vue.nextTick(() => { if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight; });

            try {
                const res = await fetch(API_BASE_URL + '/api/agent/ask', {
                    method: 'POST', headers: getHeaders(),
                    body: JSON.stringify({ question: q })
                });
                const data = await res.json();
                const answer = data.code === 200 ? cleanResult(data.data.answer || data.data) : '抱歉，暂时无法回答';
                chatMessages.value.push({ role: 'assistant', text: answer });
            } catch (e) {
                chatMessages.value.push({ role: 'assistant', text: '请求失败，请稍后重试' });
            }
            Vue.nextTick(() => { if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight; });
        };

        return {
            question, chatMessages, analysisResult, chatRef, timelineData,
            loadingEnv, loadingAlert, loadingIrrigation,
            runAllAgents, analyzeEnvironment, analyzeAlert, analyzeIrrigation, askQuestion
        };
    }
};
