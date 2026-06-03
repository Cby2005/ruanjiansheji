package com.cby.smartfarm.agent;

import com.cby.smartfarm.agent.dto.AgentDecisionPlan;
import com.cby.smartfarm.agent.dto.AgentDecisionRequest;
import com.cby.smartfarm.agent.dto.AgentFinding;
import com.cby.smartfarm.dto.EnvironmentDataDTO;
import com.cby.smartfarm.entity.EnvironmentRecord;
import com.cby.smartfarm.repository.EnvironmentRecordRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class AgricultureDecisionService {

    private static final String LOW = "LOW";
    private static final String MEDIUM = "MEDIUM";
    private static final String HIGH = "HIGH";

    private final EnvironmentRecordRepository environmentRecordRepository;
    private final List<AgricultureAgent> agents;

    public AgricultureDecisionService(EnvironmentRecordRepository environmentRecordRepository) {
        this.environmentRecordRepository = environmentRecordRepository;
        this.agents = List.of(
                this::analyzeSoil,
                this::analyzeClimate,
                this::analyzePest,
                this::analyzeCropManagement,
                this::analyzeDeviceCoordination
        );
    }

    public AgentDecisionPlan decide(AgentDecisionRequest request) {
        EnvironmentDataDTO environment = Optional.ofNullable(request.getEnvironment())
                .orElseGet(this::latestEnvironment);

        AgentContext context = new AgentContext(
                defaultText(request.getCrop(), "未指定作物"),
                defaultText(request.getGrowthStage(), "未指定阶段"),
                defaultText(request.getScenario(), "常规巡检"),
                environment
        );

        List<AgentFinding> findings = agents.stream()
                .map(agent -> agent.analyze(context))
                .toList();

        AgentDecisionPlan plan = new AgentDecisionPlan();
        plan.setCrop(context.getCrop());
        plan.setGrowthStage(context.getGrowthStage());
        plan.setScenario(context.getScenario());
        plan.setEnvironment(environment);
        plan.setAgentFindings(findings);
        plan.setOverallRiskLevel(overallRisk(findings));
        plan.setSummary(summary(plan.getOverallRiskLevel(), context));
        plan.setImmediateActions(merge(findings, "recommendation"));
        plan.setDeviceActions(merge(findings, "device"));
        plan.setTaskSuggestions(merge(findings, "task"));
        plan.setFollowUpMetrics(List.of("土壤湿度", "空气温湿度", "光照强度", "CO2 浓度", "虫情数量"));
        return plan;
    }

    private AgentFinding analyzeSoil(AgentContext context) {
        EnvironmentDataDTO env = context.getEnvironment();
        AgentFinding finding = base("土壤专家智能体", "分析土壤水分、酸碱度、盐分和养分状态");
        List<String> risks = new ArrayList<>();

        if (lessThan(env.getSoilHumidity(), 45.0)) {
            risks.add("土壤湿度偏低：" + env.getSoilHumidity() + "%");
            finding.getRecommendations().add("分区补水，优先保障根系活跃区域湿度稳定");
            finding.getDeviceActions().add("启动滴灌/微喷设备，低流量多轮次灌溉");
        } else if (greaterThan(env.getSoilHumidity(), 80.0)) {
            risks.add("土壤湿度偏高：" + env.getSoilHumidity() + "%");
            finding.getRecommendations().add("暂停灌溉并加强排水，避免根系缺氧和病害扩散");
            finding.getDeviceActions().add("关闭灌溉阀门，开启排水或通风联动");
        }

        if (lessThan(env.getPhValue(), 5.5) || greaterThan(env.getPhValue(), 7.5)) {
            risks.add("pH 不在适宜区间：" + env.getPhValue());
            finding.getRecommendations().add("安排土壤调理，按作物需求修正酸碱度");
            finding.getTaskSuggestions().add("创建土壤 pH 复测与调理任务");
        }

        if (lessThan(env.getNutrient(), 40.0)) {
            risks.add("养分偏低：" + env.getNutrient() + "mg/kg");
            finding.getRecommendations().add("补充氮磷钾或有机肥，避免进入持续营养胁迫");
            finding.getTaskSuggestions().add("生成追肥建议任务");
        }

        if (greaterThan(env.getEcValue(), 2.5)) {
            risks.add("EC 偏高：" + env.getEcValue() + "mS/cm");
            finding.getRecommendations().add("采用清水淋洗和分次施肥，降低盐分累积");
        }

        return finish(finding, risks, "土壤指标整体稳定，可维持当前水肥策略");
    }

    private AgentFinding analyzeClimate(AgentContext context) {
        EnvironmentDataDTO env = context.getEnvironment();
        AgentFinding finding = base("气候调控智能体", "分析温度、湿度、光照、CO2 和天气扰动");
        List<String> risks = new ArrayList<>();

        if (greaterThan(env.getAirTemperature(), 32.0)) {
            risks.add("空气温度偏高：" + env.getAirTemperature() + "°C");
            finding.getRecommendations().add("执行降温策略，避免蒸腾过强导致萎蔫");
            finding.getDeviceActions().add("开启风机并联动遮阳/卷帘设备");
        } else if (lessThan(env.getAirTemperature(), 12.0)) {
            risks.add("空气温度偏低：" + env.getAirTemperature() + "°C");
            finding.getRecommendations().add("执行保温策略，降低低温冷害风险");
            finding.getDeviceActions().add("启动加温设备，降低通风强度");
        }

        if (greaterThan(env.getAirHumidity(), 85.0)) {
            risks.add("空气湿度偏高：" + env.getAirHumidity() + "%");
            finding.getRecommendations().add("加强通风除湿，降低真菌病害发生概率");
            finding.getDeviceActions().add("开启循环风机，短时排湿");
        } else if (lessThan(env.getAirHumidity(), 45.0)) {
            risks.add("空气湿度偏低：" + env.getAirHumidity() + "%");
            finding.getRecommendations().add("适当雾化增湿，避免叶片失水");
        }

        if (lessThan(env.getLightIntensity(), 15000.0)) {
            risks.add("光照不足：" + env.getLightIntensity() + "lux");
            finding.getRecommendations().add("补光并延长有效光照时长");
            finding.getDeviceActions().add("开启补光灯，按生长阶段控制时长");
        } else if (greaterThan(env.getLightIntensity(), 65000.0)) {
            risks.add("光照过强：" + env.getLightIntensity() + "lux");
            finding.getRecommendations().add("采取遮阴，减少强光灼伤");
            finding.getDeviceActions().add("下放卷帘或启动遮阳系统");
        }

        if (lessThan(env.getCo2(), 350.0)) {
            risks.add("CO2 浓度偏低：" + env.getCo2() + "ppm");
            finding.getRecommendations().add("在光照充足时补充 CO2，提高光合效率");
        }

        if (greaterThan(env.getRainfall(), 20.0)) {
            risks.add("降雨量较大：" + env.getRainfall() + "mm");
            finding.getRecommendations().add("检查排水沟和棚膜积水，预防涝害");
            finding.getTaskSuggestions().add("创建排水巡检任务");
        }

        return finish(finding, risks, "气候条件处于可控范围，保持当前通风和补光节奏");
    }

    private AgentFinding analyzePest(AgentContext context) {
        EnvironmentDataDTO env = context.getEnvironment();
        AgentFinding finding = base("病虫害防控智能体", "分析虫情数量、虫害类型和扩散风险");
        List<String> risks = new ArrayList<>();

        Integer pestCount = env.getPestCount();
        if (pestCount != null && pestCount >= 30) {
            risks.add("虫情数量达到高风险：" + pestCount + "头");
            finding.getRecommendations().add("立即进行虫害点位复核，采用物理诱捕和精准防治");
            finding.getTaskSuggestions().add("生成病虫害应急处理任务");
        } else if (pestCount != null && pestCount >= 10) {
            risks.add("虫情数量达到中风险：" + pestCount + "头");
            finding.getRecommendations().add("加密诱捕监测频次，局部处理高发区域");
            finding.getTaskSuggestions().add("生成虫情复查任务");
        }

        if (hasText(env.getPestType())) {
            finding.getEvidence().add("识别到虫害类型：" + env.getPestType());
            finding.getRecommendations().add("根据虫害类型匹配绿色防控方案，避免盲目用药");
        }

        return finish(finding, risks, "虫情处于低风险，继续保持常规巡查");
    }

    private AgentFinding analyzeCropManagement(AgentContext context) {
        AgentFinding finding = base("农艺专家智能体", "结合场景、作物和生长阶段生成管理方案");
        List<String> risks = new ArrayList<>();
        String scenario = context.getScenario();

        if (containsAny(scenario, "高温", "干旱")) {
            risks.add("场景提示存在高温或干旱压力");
            finding.getRecommendations().add("调整灌溉为少量多次，避开正午高温时段");
            finding.getTaskSuggestions().add("安排清晨/傍晚水分巡检");
        }
        if (containsAny(scenario, "连续阴雨", "阴雨", "低光")) {
            risks.add("场景提示存在连续阴雨或低光照");
            finding.getRecommendations().add("降低灌溉频次，加强通风补光，防止徒长和病害");
            finding.getTaskSuggestions().add("安排病害叶片抽样检查");
        }
        if (containsAny(scenario, "虫害", "病害")) {
            risks.add("场景提示存在病虫害压力");
            finding.getRecommendations().add("优先采用监测-隔离-精准处理流程，保留处理记录");
            finding.getTaskSuggestions().add("安排病虫害点位标记和复查");
        }

        if ("flowering".equalsIgnoreCase(context.getGrowthStage())) {
            finding.getRecommendations().add("花期注意温湿度稳定，避免剧烈通风和过量施氮");
        } else if ("fruiting".equalsIgnoreCase(context.getGrowthStage())) {
            finding.getRecommendations().add("结果期关注钾肥供应和水分稳定，减少裂果风险");
        } else if ("seedling".equalsIgnoreCase(context.getGrowthStage())) {
            finding.getRecommendations().add("苗期优先保持基质湿润、弱光缓苗和温度稳定");
        }

        return finish(finding, risks, "当前未发现特殊农艺场景，按标准管理流程执行");
    }

    private AgentFinding analyzeDeviceCoordination(AgentContext context) {
        EnvironmentDataDTO env = context.getEnvironment();
        AgentFinding finding = base("设备联动智能体", "把专家建议转化为设备控制策略");
        List<String> risks = new ArrayList<>();

        if (lessThan(env.getSoilHumidity(), 45.0)) {
            risks.add("需要补水联动");
            finding.getDeviceActions().add("灌溉阀门：开启 10-15 分钟后复测土壤湿度");
        }
        if (greaterThan(env.getAirTemperature(), 32.0) || greaterThan(env.getAirHumidity(), 85.0)) {
            risks.add("需要通风联动");
            finding.getDeviceActions().add("通风风机：开启，并记录执行时长");
        }
        if (lessThan(env.getLightIntensity(), 15000.0)) {
            risks.add("需要补光联动");
            finding.getDeviceActions().add("补光灯：开启，并依据生长阶段限制补光时长");
        }
        if (greaterThan(env.getLightIntensity(), 65000.0)) {
            risks.add("需要遮阳联动");
            finding.getDeviceActions().add("卷帘/遮阳系统：下放至 50%-70%");
        }

        finding.getRecommendations().add("所有自动动作先以建议形式输出，由管理员确认后再执行");
        return finish(finding, risks, "暂无需要联动的设备动作，维持当前设备状态");
    }

    private EnvironmentDataDTO latestEnvironment() {
        EnvironmentRecord record = environmentRecordRepository.findTopByOrderByCollectTimeDesc()
                .orElseThrow(() -> new IllegalStateException("暂无环境监测数据，请先采集或在请求中传入 environment"));
        EnvironmentDataDTO dto = new EnvironmentDataDTO();
        dto.setSoilTemperature(record.getSoilTemperature());
        dto.setSoilHumidity(record.getSoilHumidity());
        dto.setPhValue(record.getPhValue());
        dto.setEcValue(record.getEcValue());
        dto.setNutrient(record.getNutrient());
        dto.setAirTemperature(record.getAirTemperature());
        dto.setAirHumidity(record.getAirHumidity());
        dto.setLightIntensity(record.getLightIntensity());
        dto.setCo2(record.getCo2());
        dto.setWindSpeed(record.getWindSpeed());
        dto.setRainfall(record.getRainfall());
        dto.setPestCount(record.getPestCount());
        dto.setPestType(record.getPestType());
        return dto;
    }

    private AgentFinding base(String name, String role) {
        AgentFinding finding = new AgentFinding();
        finding.setAgentName(name);
        finding.setRole(role);
        finding.setRiskLevel(LOW);
        return finding;
    }

    private AgentFinding finish(AgentFinding finding, List<String> risks, String lowRiskConclusion) {
        finding.getEvidence().addAll(risks);
        if (risks.isEmpty()) {
            finding.setRiskLevel(LOW);
            finding.setConclusion(lowRiskConclusion);
        } else if (risks.size() >= 2 || finding.getDeviceActions().size() >= 2) {
            finding.setRiskLevel(HIGH);
            finding.setConclusion("发现多项异常，需要尽快干预");
        } else {
            finding.setRiskLevel(MEDIUM);
            finding.setConclusion("发现单项异常，建议跟踪并处理");
        }
        return finding;
    }

    private String overallRisk(List<AgentFinding> findings) {
        if (findings.stream().anyMatch(finding -> HIGH.equals(finding.getRiskLevel()))) {
            return HIGH;
        }
        if (findings.stream().anyMatch(finding -> MEDIUM.equals(finding.getRiskLevel()))) {
            return MEDIUM;
        }
        return LOW;
    }

    private String summary(String risk, AgentContext context) {
        if (HIGH.equals(risk)) {
            return context.getCrop() + "在" + context.getGrowthStage() + "阶段存在较高环境风险，建议立即执行联动控制和农事复查";
        }
        if (MEDIUM.equals(risk)) {
            return context.getCrop() + "在" + context.getGrowthStage() + "阶段存在局部风险，建议按方案处理并持续观察";
        }
        return context.getCrop() + "在" + context.getGrowthStage() + "阶段整体稳定，可维持当前管理策略";
    }

    private List<String> merge(List<AgentFinding> findings, String type) {
        Set<String> merged = new LinkedHashSet<>();
        for (AgentFinding finding : findings) {
            if ("device".equals(type)) {
                merged.addAll(finding.getDeviceActions());
            } else if ("task".equals(type)) {
                merged.addAll(finding.getTaskSuggestions());
            } else {
                merged.addAll(finding.getRecommendations());
            }
        }
        return new ArrayList<>(merged);
    }

    private boolean lessThan(Double value, double threshold) {
        return value != null && value < threshold;
    }

    private boolean greaterThan(Double value, double threshold) {
        return value != null && value > threshold;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private boolean containsAny(String value, String... keywords) {
        if (!hasText(value)) {
            return false;
        }
        for (String keyword : keywords) {
            if (value.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String defaultText(String value, String fallback) {
        return hasText(value) ? value.trim() : fallback;
    }
}
