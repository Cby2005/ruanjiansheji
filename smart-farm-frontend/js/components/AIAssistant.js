const AIAssistant = {
    template: `
        <div class="space-y-6">
            <!-- 标题栏 -->
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="text-lg font-semibold text-gray-800">
                    <i class="fas fa-robot mr-2 text-blue-500"></i>AI 智能助手
                </h3>
                <p class="text-sm text-gray-500 mt-1">基于 MiMo AI 的智能分析和决策支持</p>
            </div>

            <!-- 功能卡片 -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- 环境分析 -->
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    @click="activeTab = 'environment'">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-leaf text-green-500 text-xl"></i>
                        </div>
                        <h4 class="ml-4 font-semibold text-gray-800">环境分析</h4>
                    </div>
                    <p class="text-sm text-gray-500">分析环境数据，获取专业建议</p>
                </div>

                <!-- 设备诊断 -->
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    @click="activeTab = 'device'">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-cogs text-blue-500 text-xl"></i>
                        </div>
                        <h4 class="ml-4 font-semibold text-gray-800">设备诊断</h4>
                    </div>
                    <p class="text-sm text-gray-500">诊断设备状态，预测维护需求</p>
                </div>

                <!-- 任务规划 -->
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    @click="activeTab = 'task'">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-tasks text-purple-500 text-xl"></i>
                        </div>
                        <h4 class="ml-4 font-semibold text-gray-800">任务规划</h4>
                    </div>
                    <p class="text-sm text-gray-500">智能规划农事任务</p>
                </div>

                <!-- 预警分析 -->
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    @click="activeTab = 'alert'">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                        </div>
                        <h4 class="ml-4 font-semibold text-gray-800">预警分析</h4>
                    </div>
                    <p class="text-sm text-gray-500">分析预警信息，制定应对策略</p>
                </div>

                <!-- 智能问答 -->
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    @click="activeTab = 'qa'">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-question-circle text-yellow-500 text-xl"></i>
                        </div>
                        <h4 class="ml-4 font-semibold text-gray-800">智能问答</h4>
                    </div>
                    <p class="text-sm text-gray-500">咨询农场管理问题</p>
                </div>
            </div>

            <!-- 环境分析面板 -->
            <div v-if="activeTab === 'environment'" class="bg-white rounded-lg shadow-md p-6">
                <h4 class="text-lg font-semibold mb-4">环境数据分析</h4>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">空气温度 (°C)</label>
                        <input v-model.number="envData.airTemperature" type="number" step="0.1"
                            class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">空气湿度 (%)</label>
                        <input v-model.number="envData.airHumidity" type="number" step="0.1"
                            class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">土壤湿度 (%)</label>
                        <input v-model.number="envData.soilHumidity" type="number" step="0.1"
                            class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">光照强度 (lux)</label>
                        <input v-model.number="envData.lightIntensity" type="number"
                            class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">CO2浓度 (ppm)</label>
                        <input v-model.number="envData.co2Level" type="number"
                            class="w-full px-3 py-2 border rounded-lg">
                    </div>
                </div>
                <button @click="analyzeEnvironment" :disabled="loading"
                    class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300">
                    <i class="fas fa-chart-line mr-2"></i>{{ loading ? '分析中...' : '开始分析' }}
                </button>
            </div>

            <!-- 设备诊断面板 -->
            <div v-if="activeTab === 'device'" class="bg-white rounded-lg shadow-md p-6">
                <h4 class="text-lg font-semibold mb-4">设备状态诊断</h4>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">设备名称</label>
                        <input v-model="deviceData.name" type="text"
                            class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">设备类型</label>
                        <input v-model="deviceData.type" type="text"
                            class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">当前状态</label>
                        <select v-model="deviceData.status" class="w-full px-3 py-2 border rounded-lg">
                            <option value="RUNNING">运行中</option>
                            <option value="STANDBY">待机</option>
                            <option value="FAULT">故障</option>
                            <option value="MAINTENANCE">维护中</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">运行时长 (小时)</label>
                        <input v-model.number="deviceData.runningHours" type="number"
                            class="w-full px-3 py-2 border rounded-lg">
                    </div>
                </div>
                <button @click="diagnoseDevice" :disabled="loading"
                    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300">
                    <i class="fas fa-stethoscope mr-2"></i>{{ loading ? '诊断中...' : '开始诊断' }}
                </button>
            </div>

            <!-- 任务规划面板 -->
            <div v-if="activeTab === 'task'" class="bg-white rounded-lg shadow-md p-6">
                <h4 class="text-lg font-semibold mb-4">智能任务规划</h4>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">作物类型</label>
                        <input v-model="taskContext.cropType" type="text"
                            class="w-full px-3 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">生长阶段</label>
                        <select v-model="taskContext.growthStage" class="w-full px-3 py-2 border rounded-lg">
                            <option value="苗期">苗期</option>
                            <option value="生长期">生长期</option>
                            <option value="开花期">开花期</option>
                            <option value="结果期">结果期</option>
                            <option value="收获期">收获期</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">季节</label>
                        <select v-model="taskContext.season" class="w-full px-3 py-2 border rounded-lg">
                            <option value="春季">春季</option>
                            <option value="夏季">夏季</option>
                            <option value="秋季">秋季</option>
                            <option value="冬季">冬季</option>
                        </select>
                    </div>
                </div>
                <button @click="planTasks" :disabled="loading"
                    class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300">
                    <i class="fas fa-calendar-check mr-2"></i>{{ loading ? '规划中...' : '生成任务计划' }}
                </button>
            </div>

            <!-- 预警分析面板 -->
            <div v-if="activeTab === 'alert'" class="bg-white rounded-lg shadow-md p-6">
                <h4 class="text-lg font-semibold mb-4">预警信息分析</h4>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">预警类型</label>
                        <select v-model="alertData.type" class="w-full px-3 py-2 border rounded-lg">
                            <option value="环境异常">环境异常</option>
                            <option value="设备故障">设备故障</option>
                            <option value="虫害预警">虫害预警</option>
                            <option value="灌溉异常">灌溉异常</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">预警级别</label>
                        <select v-model="alertData.level" class="w-full px-3 py-2 border rounded-lg">
                            <option value="低">低</option>
                            <option value="中">中</option>
                            <option value="高">高</option>
                            <option value="紧急">紧急</option>
                        </select>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm text-gray-600 mb-1">触发原因</label>
                        <input v-model="alertData.cause" type="text"
                            class="w-full px-3 py-2 border rounded-lg">
                    </div>
                </div>
                <button @click="analyzeAlerts" :disabled="loading"
                    class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300">
                    <i class="fas fa-search mr-2"></i>{{ loading ? '分析中...' : '分析预警' }}
                </button>
            </div>

            <!-- 智能问答面板 -->
            <div v-if="activeTab === 'qa'" class="bg-white rounded-lg shadow-md p-6">
                <h4 class="text-lg font-semibold mb-4">智能问答</h4>
                <div class="mb-4">
                    <textarea v-model="question" rows="3" placeholder="请输入您的问题..."
                        class="w-full px-3 py-2 border rounded-lg resize-none"></textarea>
                </div>
                <button @click="askQuestion" :disabled="loading || !question.trim()"
                    class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300">
                    <i class="fas fa-paper-plane mr-2"></i>{{ loading ? '思考中...' : '提问' }}
                </button>
            </div>

            <!-- 结果显示 -->
            <div v-if="result" class="bg-white rounded-lg shadow-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h4 class="text-lg font-semibold text-gray-800">
                        <i class="fas fa-lightbulb mr-2 text-yellow-500"></i>AI 分析结果
                    </h4>
                    <button @click="copyResult" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-copy mr-1"></i>复制
                    </button>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700">{{ result }}</div>
            </div>

            <!-- 消息提示 -->
            <div v-if="message" class="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg"
                :class="message.type === 'success' ? 'bg-green-500' : 'bg-red-500'">
                <div class="flex items-center text-white">
                    <i :class="message.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"
                        class="mr-2"></i>
                    <span>{{ message.text }}</span>
                </div>
            </div>
        </div>
    `,

    setup() {
        const API_BASE_URL = 'http://localhost:8080';
        const activeTab = Vue.ref('');
        const loading = Vue.ref(false);
        const result = Vue.ref('');
        const question = Vue.ref('');
        const message = Vue.ref(null);

        const envData = Vue.reactive({
            airTemperature: 25,
            airHumidity: 60,
            soilHumidity: 45,
            lightIntensity: 5000,
            co2Level: 400
        });

        const deviceData = Vue.reactive({
            name: '灌溉阀-001',
            type: '灌溉设备',
            status: 'RUNNING',
            runningHours: 1200
        });

        const taskContext = Vue.reactive({
            cropType: '番茄',
            growthStage: '生长期',
            season: '夏季'
        });

        const alertData = Vue.reactive({
            type: '环境异常',
            level: '中',
            cause: '温度持续偏高'
        });

        const showMessage = (text, type = 'success') => {
            message.value = { text, type };
            setTimeout(() => message.value = null, 3000);
        };

        // 清理AI返回内容中的Markdown符号
        const cleanResult = (text) => {
            if (!text) return '';
            return text.replace(/[*#]/g, '');
        };

        const getAuthHeaders = () => ({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        });

        const analyzeEnvironment = async () => {
            loading.value = true;
            try {
                const response = await fetch(API_BASE_URL + '/api/agent/analyze-environment', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(envData)
                });
                const data = await response.json();
                if (data.code === 200) {
                    result.value = cleanResult(data.data.analysis);
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                showMessage('分析失败: ' + error.message, 'error');
            } finally {
                loading.value = false;
            }
        };

        const diagnoseDevice = async () => {
            loading.value = true;
            try {
                const response = await fetch(API_BASE_URL + '/api/agent/diagnose-device', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(deviceData)
                });
                const data = await response.json();
                if (data.code === 200) {
                    result.value = cleanResult(data.data.diagnosis);
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                showMessage('诊断失败: ' + error.message, 'error');
            } finally {
                loading.value = false;
            }
        };

        const planTasks = async () => {
            loading.value = true;
            try {
                const response = await fetch(API_BASE_URL + '/api/agent/plan-tasks', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(taskContext)
                });
                const data = await response.json();
                if (data.code === 200) {
                    result.value = cleanResult(data.data.plan);
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                showMessage('规划失败: ' + error.message, 'error');
            } finally {
                loading.value = false;
            }
        };

        const analyzeAlerts = async () => {
            loading.value = true;
            try {
                const response = await fetch(API_BASE_URL + '/api/agent/analyze-alerts', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(alertData)
                });
                const data = await response.json();
                if (data.code === 200) {
                    result.value = cleanResult(data.data.alertAnalysis);
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                showMessage('分析失败: ' + error.message, 'error');
            } finally {
                loading.value = false;
            }
        };

        const askQuestion = async () => {
            if (!question.value.trim()) return;
            loading.value = true;
            try {
                const response = await fetch(API_BASE_URL + '/api/agent/ask', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ question: question.value })
                });
                const data = await response.json();
                if (data.code === 200) {
                    result.value = cleanResult(data.data.answer);
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                showMessage('问答失败: ' + error.message, 'error');
            } finally {
                loading.value = false;
            }
        };

        const copyResult = () => {
            navigator.clipboard.writeText(result.value);
            showMessage('已复制到剪贴板');
        };

        return {
            activeTab,
            loading,
            result,
            question,
            message,
            envData,
            deviceData,
            taskContext,
            alertData,
            analyzeEnvironment,
            diagnoseDevice,
            planTasks,
            analyzeAlerts,
            askQuestion,
            copyResult
        };
    }
};
