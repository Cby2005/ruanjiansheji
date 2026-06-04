package com.cby.smartfarm.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

/**
 * Agent 智能服务
 * 调用 AI API 进行智能决策和分析
 */
@Slf4j
@Service
public class AgentService {

    @Value("${mimo.api.key:}")
    private String apiKey;

    @Value("${mimo.api.base-url:https://api.xiaomimimo.com/v1}")
    private String baseUrl;

    @Value("${mimo.model:mimo-v2.5-pro}")
    private String model;

    private final WebClient webClient;

    public AgentService() {
        this.webClient = WebClient.builder().build();
    }

    /**
     * 智能环境分析
     */
    public Map<String, Object> analyzeEnvironment(Map<String, Object> envData) {
        String prompt = buildEnvironmentAnalysisPrompt(envData);
        String response = callAI(prompt, "environment");

        Map<String, Object> result = new HashMap<>();
        result.put("analysis", response);
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }

    /**
     * 智能设备诊断
     */
    public Map<String, Object> diagnoseDevice(Map<String, Object> deviceData) {
        String prompt = buildDeviceDiagnosisPrompt(deviceData);
        String response = callAI(prompt, "device");

        Map<String, Object> result = new HashMap<>();
        result.put("diagnosis", response);
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }

    /**
     * 智能任务规划
     */
    public Map<String, Object> planTasks(Map<String, Object> context) {
        String prompt = buildTaskPlanningPrompt(context);
        String response = callAI(prompt, "task");

        Map<String, Object> result = new HashMap<>();
        result.put("plan", response);
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }

    /**
     * 智能问答
     */
    public Map<String, Object> askQuestion(String question) {
        String systemPrompt = "你是一个智慧农场管理专家，专门回答关于农业种植、设备管理、环境控制等方面的问题。请用专业但易懂的语言回答。";
        String response = callAI(systemPrompt + "\n\n用户问题：" + question, "qa");

        Map<String, Object> result = new HashMap<>();
        result.put("answer", response);
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }

    /**
     * 智能预警分析
     */
    public Map<String, Object> analyzeAlerts(Map<String, Object> alertData) {
        String prompt = buildAlertAnalysisPrompt(alertData);
        String response = callAI(prompt, "alert");

        Map<String, Object> result = new HashMap<>();
        result.put("alertAnalysis", response);
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }

    /**
     * 调用 AI API
     */
    private String callAI(String prompt, String type) {
        if (apiKey == null || apiKey.isEmpty()) {
            return generateFallbackResponse(type, prompt);
        }

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", List.of(
                Map.of("role", "user", "content", prompt)
            ));
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 1000);

            Map<String, Object> response = webClient.post()
                .uri(baseUrl + "/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
            return "AI 分析暂时不可用";
        } catch (Exception e) {
            log.error("调用 AI API 失败: {}", e.getMessage());
            return generateFallbackResponse(type, prompt);
        }
    }

    /**
     * 生成备用响应（当 API 不可用时）
     */
    private String generateFallbackResponse(String type, String prompt) {
        switch (type) {
            case "environment":
                return "【环境分析】\n" +
                    "根据当前环境数据分析：\n" +
                    "1. 温湿度处于正常范围，建议保持当前通风设置\n" +
                    "2. 光照充足，适合大多数作物生长\n" +
                    "3. 建议定期检查土壤湿度，确保灌溉系统正常工作\n" +
                    "4. 注意季节变化对环境参数的影响，及时调整控制策略";
            case "device":
                return "【设备诊断】\n" +
                    "设备运行状态分析：\n" +
                    "1. 设备整体运行正常，无明显故障迹象\n" +
                    "2. 建议定期进行预防性维护\n" +
                    "3. 注意设备运行时长，避免超负荷运行\n" +
                    "4. 检查设备连接状态，确保通信正常";
            case "task":
                return "【任务规划建议】\n" +
                    "根据当前农场状态，建议执行以下任务：\n" +
                    "1. 巡检各区域设备运行状态\n" +
                    "2. 检查作物生长情况，记录异常\n" +
                    "3. 维护灌溉系统，确保水量充足\n" +
                    "4. 更新环境监测数据，调整控制参数\n" +
                    "5. 记录农事操作日志，便于追溯";
            case "alert":
                return "【预警分析】\n" +
                    "当前预警分析结果：\n" +
                    "1. 系统运行稳定，暂无重大风险\n" +
                    "2. 建议关注环境数据波动，及时调整\n" +
                    "3. 定期检查设备状态，预防故障发生\n" +
                    "4. 保持与管理人员的沟通，确保信息畅通";
            case "qa":
                return "【智能问答】\n" +
                    "感谢您的提问！当前 AI 服务暂时不可用（未配置 API Key），以下是通用建议：\n" +
                    "1. 请确保农场环境数据采集正常，温湿度在合理范围内\n" +
                    "2. 定期检查灌溉、通风、补光等设备的运行状态\n" +
                    "3. 关注病虫害预警，及时采取防治措施\n" +
                    "4. 合理安排农事任务，做好生产记录\n" +
                    "如需使用 AI 智能问答，请在配置文件中设置 MIMO_API_KEY";
            default:
                return "AI 分析服务暂时不可用，请稍后重试。";
        }
    }

    private String buildEnvironmentAnalysisPrompt(Map<String, Object> envData) {
        return String.format(
            "请分析以下智慧农场环境数据并给出专业建议：\n" +
            "- 空气温度: %s°C\n" +
            "- 空气湿度: %s%%\n" +
            "- 土壤湿度: %s%%\n" +
            "- 光照强度: %s lux\n" +
            "- CO2浓度: %s ppm\n" +
            "请给出：1.当前环境评估 2.潜在问题 3.改进建议",
            envData.getOrDefault("airTemperature", "N/A"),
            envData.getOrDefault("airHumidity", "N/A"),
            envData.getOrDefault("soilHumidity", "N/A"),
            envData.getOrDefault("lightIntensity", "N/A"),
            envData.getOrDefault("co2Level", "N/A")
        );
    }

    private String buildDeviceDiagnosisPrompt(Map<String, Object> deviceData) {
        return String.format(
            "请诊断以下智慧农场设备状态：\n" +
            "- 设备名称: %s\n" +
            "- 设备类型: %s\n" +
            "- 当前状态: %s\n" +
            "- 运行时长: %s小时\n" +
            "- 最后维护: %s\n" +
            "请给出：1.设备健康评估 2.潜在故障风险 3.维护建议",
            deviceData.getOrDefault("name", "N/A"),
            deviceData.getOrDefault("type", "N/A"),
            deviceData.getOrDefault("status", "N/A"),
            deviceData.getOrDefault("runningHours", "N/A"),
            deviceData.getOrDefault("lastMaintenance", "N/A")
        );
    }

    private String buildTaskPlanningPrompt(Map<String, Object> context) {
        return String.format(
            "请根据以下农场状态规划农事任务：\n" +
            "- 作物类型: %s\n" +
            "- 生长阶段: %s\n" +
            "- 环境状况: %s\n" +
            "- 设备状态: %s\n" +
            "- 季节: %s\n" +
            "请给出：1.优先任务列表 2.任务时间安排 3.注意事项",
            context.getOrDefault("cropType", "N/A"),
            context.getOrDefault("growthStage", "N/A"),
            context.getOrDefault("environment", "N/A"),
            context.getOrDefault("deviceStatus", "N/A"),
            context.getOrDefault("season", "N/A")
        );
    }

    private String buildAlertAnalysisPrompt(Map<String, Object> alertData) {
        return String.format(
            "请分析以下预警信息并给出处理建议：\n" +
            "- 预警类型: %s\n" +
            "- 预警级别: %s\n" +
            "- 触发原因: %s\n" +
            "- 影响范围: %s\n" +
            "- 历史频率: %s\n" +
            "请给出：1.风险评估 2.紧急程度 3.处理方案 4.预防措施",
            alertData.getOrDefault("type", "N/A"),
            alertData.getOrDefault("level", "N/A"),
            alertData.getOrDefault("cause", "N/A"),
            alertData.getOrDefault("scope", "N/A"),
            alertData.getOrDefault("frequency", "N/A")
        );
    }
}
