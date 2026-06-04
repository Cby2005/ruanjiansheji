package com.cby.smartfarm.service;

import com.cby.smartfarm.agent.dto.AgentDecisionRequest;
import com.cby.smartfarm.dto.EnvironmentDataDTO;
import com.cby.smartfarm.dto.KnowledgeGraphResult;
import com.cby.smartfarm.entity.CropRecommendation;
import com.cby.smartfarm.entity.Device;
import com.cby.smartfarm.entity.EnvironmentThreshold;
import com.cby.smartfarm.entity.FertilizerAdvice;
import com.cby.smartfarm.entity.KnowledgeChunk;
import com.cby.smartfarm.entity.KnowledgeDocument;
import com.cby.smartfarm.entity.KnowledgeEntity;
import com.cby.smartfarm.entity.KnowledgeRelation;
import com.cby.smartfarm.entity.PestType;
import com.cby.smartfarm.repository.CropRecommendationRepository;
import com.cby.smartfarm.repository.DeviceRepository;
import com.cby.smartfarm.repository.EnvironmentThresholdRepository;
import com.cby.smartfarm.repository.FertilizerAdviceRepository;
import com.cby.smartfarm.repository.KnowledgeChunkRepository;
import com.cby.smartfarm.repository.KnowledgeDocumentRepository;
import com.cby.smartfarm.repository.KnowledgeEntityRepository;
import com.cby.smartfarm.repository.KnowledgeRelationRepository;
import com.cby.smartfarm.repository.PestTypeRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KnowledgeGraphService {

    private final KnowledgeEntityRepository entityRepository;
    private final KnowledgeRelationRepository relationRepository;
    private final KnowledgeDocumentRepository documentRepository;
    private final KnowledgeChunkRepository chunkRepository;
    private final CropRecommendationRepository cropRecommendationRepository;
    private final FertilizerAdviceRepository fertilizerAdviceRepository;
    private final PestTypeRepository pestTypeRepository;
    private final DeviceRepository deviceRepository;
    private final EnvironmentThresholdRepository thresholdRepository;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public void rebuild() {
        ensureTextColumns();
        relationRepository.deleteAll();
        chunkRepository.deleteAll();
        documentRepository.deleteAll();
        entityRepository.deleteAll();
        seedGraph();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> overview() {
        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("entityCount", entityRepository.count());
        overview.put("relationCount", relationRepository.count());
        overview.put("documentCount", documentRepository.count());
        overview.put("chunkCount", chunkRepository.count());
        overview.put("entityTypes", entityRepository.findAll().stream()
                .collect(Collectors.groupingBy(KnowledgeEntity::getType, LinkedHashMap::new, Collectors.counting())));
        return overview;
    }

    @Transactional
    public KnowledgeGraphResult search(String query, String crop, String scenario) {
        ensureInitialized();
        String normalizedQuery = joinKeywords(query, crop, scenario);
        List<String> keywords = keywords(normalizedQuery);

        Map<Long, KnowledgeEntity> nodeMap = new LinkedHashMap<>();
        for (String keyword : keywords) {
            entityRepository.search(keyword)
                    .forEach(entity -> nodeMap.put(entity.getId(), entity));
        }
        if (nodeMap.isEmpty()) {
            entityRepository.findAll(PageRequest.of(0, 12)).forEach(entity -> nodeMap.put(entity.getId(), entity));
        }

        List<Long> seedIds = new ArrayList<>(nodeMap.keySet());
        List<KnowledgeRelation> relations = seedIds.isEmpty()
                ? List.of()
                : relationRepository.findBySourceIdInOrTargetIdIn(seedIds, seedIds);
        for (KnowledgeRelation relation : relations) {
            entityRepository.findById(relation.getSourceId()).ifPresent(entity -> nodeMap.put(entity.getId(), entity));
            entityRepository.findById(relation.getTargetId()).ifPresent(entity -> nodeMap.put(entity.getId(), entity));
        }

        Map<Long, KnowledgeChunk> chunkMap = new LinkedHashMap<>();
        for (String keyword : keywords) {
            String entityToken = seedIds.isEmpty() ? "" : String.valueOf(seedIds.get(0));
            chunkRepository.search(keyword, entityToken)
                    .forEach(chunk -> chunkMap.put(chunk.getId(), chunk));
        }

        KnowledgeGraphResult result = new KnowledgeGraphResult();
        result.setQuery(normalizedQuery);
        result.setNodes(nodeMap.values().stream()
                .sorted(Comparator.comparing(KnowledgeEntity::getType).thenComparing(KnowledgeEntity::getName))
                .map(this::toNode)
                .toList());
        result.setLinks(relations.stream()
                .filter(relation -> nodeMap.containsKey(relation.getSourceId()) && nodeMap.containsKey(relation.getTargetId()))
                .map(this::toLink)
                .toList());
        result.setChunks(chunkMap.values().stream().map(this::toChunk).toList());
        result.setRagContext(buildRagContext(result));
        return result;
    }

    @Transactional
    public KnowledgeGraphResult retrieveForDecision(AgentDecisionRequest request) {
        String query = buildDecisionQuery(request);
        return search(query, request == null ? null : request.getCrop(), request == null ? null : request.getScenario());
    }

    @Transactional
    public void ensureInitialized() {
        ensureTextColumns();
        if (entityRepository.count() == 0) {
            seedGraph();
        }
    }

    private void ensureTextColumns() {
        jdbcTemplate.execute("ALTER TABLE kg_document MODIFY content LONGTEXT");
        jdbcTemplate.execute("ALTER TABLE kg_chunk MODIFY content LONGTEXT");
    }

    private void seedGraph() {
        Map<String, KnowledgeEntity> cache = new LinkedHashMap<>();

        KnowledgeEntity temperature = entity(cache, "温度", "EnvironmentFactor", "空气温度和土壤温度，影响蒸腾、坐果和病害发生", "temperature,airTemperature,soilTemperature", "{}");
        KnowledgeEntity humidity = entity(cache, "空气湿度", "EnvironmentFactor", "空气相对湿度，过高容易诱发真菌病害", "humidity,airHumidity", "{}");
        KnowledgeEntity soilMoisture = entity(cache, "土壤湿度", "EnvironmentFactor", "根区水分状态，决定是否需要灌溉", "soilHumidity,soil moisture", "{}");
        KnowledgeEntity light = entity(cache, "光照", "EnvironmentFactor", "光照强度，影响光合作用和灼伤风险", "light,lux", "{}");
        KnowledgeEntity ph = entity(cache, "pH", "EnvironmentFactor", "土壤酸碱度，影响养分吸收", "ph,acid,alkaline", "{}");
        KnowledgeEntity co2 = entity(cache, "CO2", "EnvironmentFactor", "二氧化碳浓度，影响光合效率", "carbon dioxide", "{}");
        KnowledgeEntity pestPressure = entity(cache, "虫害压力", "Risk", "虫情数量或病虫害场景带来的生产风险", "pest,disease", "{}");

        KnowledgeEntity ventilation = entity(cache, "通风降温", "Strategy", "开启风机并联动卷帘，降低温湿度和病害风险", "fan,ventilation", "{}");
        KnowledgeEntity irrigation = entity(cache, "滴灌补水", "Strategy", "低流量、多轮次补水，优先保障根区湿度", "irrigation,water", "{}");
        KnowledgeEntity shading = entity(cache, "遮阳降光", "Strategy", "光照过强时下放卷帘或遮阳帘，减少灼伤", "shading,roller", "{}");
        KnowledgeEntity lighting = entity(cache, "补光", "Strategy", "低光照时按生长阶段补光，延长有效光照时长", "lighting", "{}");
        KnowledgeEntity fertilization = entity(cache, "变量施肥", "Strategy", "根据 N/P/K、pH 和土壤水分生成施肥建议", "fertilizer,N,P,K", "{}");

        relation(temperature, ventilation, "RECOMMENDS", "温度偏高时优先通风降温");
        relation(humidity, ventilation, "RECOMMENDS", "空气湿度偏高时通风排湿");
        relation(soilMoisture, irrigation, "RECOMMENDS", "土壤湿度偏低时采用滴灌补水");
        relation(light, shading, "RECOMMENDS", "光照过强时遮阳降光");
        relation(light, lighting, "RECOMMENDS", "光照不足时补光");
        relation(ph, fertilization, "AFFECTS", "pH 会影响肥效和养分吸收");
        relation(co2, ventilation, "CONSTRAINS", "CO2 偏低时需结合光照判断是否补充或通风");
        relation(pestPressure, ventilation, "RECOMMENDS", "高湿和病虫害压力下需通风、巡检和精准防控");

        for (EnvironmentThreshold threshold : thresholdRepository.findAll()) {
            KnowledgeEntity metric = entity(cache, threshold.getMetricName(), "EnvironmentFactor",
                    threshold.getSuggestion(), threshold.getMetricCode(), "{}");
            KnowledgeEntity risk = entity(cache, threshold.getMetricName() + "异常", "Risk",
                    "阈值范围：" + threshold.getMinValue() + " - " + threshold.getMaxValue(), threshold.getMetricCode(), "{}");
            relation(metric, risk, "HAS_THRESHOLD", threshold.getSuggestion());
            relation(risk, chooseStrategy(metric.getName(), ventilation, irrigation, shading, lighting, fertilization), "RECOMMENDS", threshold.getSuggestion());
        }

        cropRecommendationRepository.findAll().stream()
                .filter(record -> record.getLabel() != null && !record.getLabel().isBlank())
                .collect(Collectors.groupingBy(CropRecommendation::getLabel))
                .forEach((label, records) -> {
                    CropRecommendation sample = records.get(0);
                    KnowledgeEntity crop = entity(cache, label, "Crop", "作物推荐数据集中的作物，样本数 " + records.size(), label, "{}");
                    relation(crop, temperature, "NEEDS_FACTOR", "适宜温度样本约 " + sample.getTemperature() + "°C");
                    relation(crop, humidity, "NEEDS_FACTOR", "适宜湿度样本约 " + sample.getHumidity() + "%");
                    relation(crop, ph, "NEEDS_FACTOR", "适宜 pH 样本约 " + sample.getPh());
                });

        for (FertilizerAdvice advice : fertilizerAdviceRepository.findAll()) {
            if (advice.getCrop() == null || advice.getCrop().isBlank()) {
                continue;
            }
            KnowledgeEntity crop = entity(cache, advice.getCrop(), "Crop", "施肥建议数据集中的作物", advice.getCrop(), "{}");
            KnowledgeEntity fertilizer = entity(cache, advice.getFertilizerName(), "Fertilizer",
                    advice.getAdvice(), advice.getFertilizerName(), "{}");
            relation(crop, fertilizer, "USES_FERTILIZER", advice.getFertilizerAmount() + "；" + advice.getAdvice());
            relation(fertilizer, fertilization, "PART_OF_STRATEGY", "施肥策略组成部分");
        }

        for (PestType pest : pestTypeRepository.findAll()) {
            KnowledgeEntity pestNode = entity(cache, pest.getPestName(), "PestDisease", pest.getDamageSymptom(), pest.getPestCode(), "{}");
            KnowledgeEntity cropNode = entity(cache, pest.getDamageCrop(), "Crop", "病虫害危害作物", pest.getDamageCrop(), "{}");
            relation(pestNode, cropNode, "DAMAGES", pest.getDamagePart() + "；" + pest.getDamageSymptom());
            relation(pestNode, pestPressure, "RAISES_RISK", pest.getPreventionMethod());
        }

        for (Device device : deviceRepository.findAll()) {
            KnowledgeEntity deviceNode = entity(cache, device.getDeviceName(), "Device",
                    device.getDeviceType() + " / " + device.getArea(), device.getDeviceCode(), "{}");
            KnowledgeEntity strategy = switch (device.getDeviceType()) {
                case "IRRIGATION" -> irrigation;
                case "LIGHT" -> lighting;
                case "FAN" -> ventilation;
                case "ROLLER" -> shading;
                default -> ventilation;
            };
            relation(strategy, deviceNode, "EXECUTED_BY", "虚拟设备执行控制命令：" + device.getDeviceCode());
        }

        createDocument("多 Agent 农业决策规则", "project-rules", "decision",
                "系统采用环境监测 -> 知识图谱检索 -> 多专家 Agent 分析 -> 总控汇总 -> 安全审核 -> 虚拟设备执行的流程。"
                        + "土壤偏干优先滴灌补水；空气温度或湿度偏高优先通风；光照不足补光，光照过强遮阳；"
                        + "出现病虫害压力时需要结合湿度、虫情数量和防治知识生成巡检任务。");
        createDocument("农业知识图谱 RAG 说明", "project-kg", "rag",
                "知识图谱节点包括 Crop、EnvironmentFactor、PestDisease、Device、Strategy、Risk、Fertilizer。"
                        + "RAG 检索先按关键词命中实体，再扩展一跳关系和相关文本片段，作为 Agent 决策依据。");
    }

    private KnowledgeEntity chooseStrategy(String metricName,
                                           KnowledgeEntity ventilation,
                                           KnowledgeEntity irrigation,
                                           KnowledgeEntity shading,
                                           KnowledgeEntity lighting,
                                           KnowledgeEntity fertilization) {
        if (contains(metricName, "湿", "水")) {
            return irrigation;
        }
        if (contains(metricName, "光")) {
            return shading;
        }
        if (contains(metricName, "pH", "EC", "养分")) {
            return fertilization;
        }
        return ventilation;
    }

    private KnowledgeEntity entity(Map<String, KnowledgeEntity> cache, String name, String type,
                                   String description, String aliases, String propertiesJson) {
        String safeName = (name == null || name.isBlank()) ? "未命名知识" : name.trim();
        String key = type + ":" + safeName;
        if (cache.containsKey(key)) {
            return cache.get(key);
        }
        KnowledgeEntity entity = entityRepository.findByNameAndType(safeName, type).orElseGet(KnowledgeEntity::new);
        entity.setName(safeName);
        entity.setType(type);
        entity.setDescription(cut(description, 500));
        entity.setAliases(cut(aliases, 500));
        entity.setPropertiesJson(propertiesJson);
        KnowledgeEntity saved = entityRepository.save(entity);
        cache.put(key, saved);
        return saved;
    }

    private void relation(KnowledgeEntity source, KnowledgeEntity target, String type, String description) {
        if (source == null || target == null || Objects.equals(source.getId(), target.getId())) {
            return;
        }
        if (relationRepository.existsBySourceIdAndTargetIdAndRelationType(source.getId(), target.getId(), type)) {
            return;
        }
        KnowledgeRelation relation = new KnowledgeRelation();
        relation.setSourceId(source.getId());
        relation.setTargetId(target.getId());
        relation.setRelationType(type);
        relation.setDescription(cut(description, 500));
        relation.setWeight(1.0);
        relationRepository.save(relation);
    }

    private void createDocument(String title, String source, String category, String content) {
        KnowledgeDocument document = new KnowledgeDocument();
        document.setTitle(title);
        document.setSource(source);
        document.setCategory(category);
        document.setContent(content);
        KnowledgeDocument saved = documentRepository.save(document);

        KnowledgeChunk chunk = new KnowledgeChunk();
        chunk.setDocumentId(saved.getId());
        chunk.setContent(content);
        chunk.setKeywords(title + "," + category + ",Agent,RAG,知识图谱,环境监测,设备控制");
        chunk.setEntityIds("");
        chunkRepository.save(chunk);
    }

    private KnowledgeGraphResult.GraphNode toNode(KnowledgeEntity entity) {
        return new KnowledgeGraphResult.GraphNode(
                entity.getId(),
                entity.getName(),
                entity.getType(),
                entity.getDescription(),
                parseProperties(entity.getPropertiesJson())
        );
    }

    private KnowledgeGraphResult.GraphLink toLink(KnowledgeRelation relation) {
        return new KnowledgeGraphResult.GraphLink(
                relation.getSourceId(),
                relation.getTargetId(),
                relation.getRelationType(),
                relation.getDescription(),
                relation.getWeight()
        );
    }

    private KnowledgeGraphResult.GraphChunk toChunk(KnowledgeChunk chunk) {
        return new KnowledgeGraphResult.GraphChunk(chunk.getId(), chunk.getDocumentId(), chunk.getContent(), chunk.getKeywords());
    }

    private List<String> buildRagContext(KnowledgeGraphResult result) {
        List<String> context = new ArrayList<>();
        result.getNodes().stream().limit(8).forEach(node ->
                context.add("实体[" + node.getType() + "] " + node.getName() + "：" + nullToEmpty(node.getDescription())));
        result.getLinks().stream().limit(10).forEach(link ->
                context.add("关系 " + link.getSource() + " -" + link.getRelationType() + "-> " + link.getTarget()
                        + "：" + nullToEmpty(link.getDescription())));
        result.getChunks().stream().limit(3).forEach(chunk ->
                context.add("文档片段：" + cut(chunk.getContent(), 180)));
        return context;
    }

    private String buildDecisionQuery(AgentDecisionRequest request) {
        if (request == null) {
            return "农业 Agent 决策";
        }
        List<String> parts = new ArrayList<>();
        parts.add(request.getCrop());
        parts.add(request.getGrowthStage());
        parts.add(request.getScenario());
        EnvironmentDataDTO env = request.getEnvironment();
        if (env != null) {
            if (greaterThan(env.getAirTemperature(), 32.0)) parts.add("高温 通风降温");
            if (lessThan(env.getSoilHumidity(), 45.0)) parts.add("土壤偏干 滴灌补水");
            if (greaterThan(env.getAirHumidity(), 85.0)) parts.add("空气湿度高 病害风险");
            if (lessThan(env.getLightIntensity(), 15000.0)) parts.add("光照不足 补光");
            if (greaterThan(env.getLightIntensity(), 65000.0)) parts.add("光照过强 遮阳");
            if (env.getPestCount() != null && env.getPestCount() >= 10) parts.add("虫害压力");
            parts.add(env.getPestType());
        }
        return joinKeywords(parts.toArray(String[]::new));
    }

    private List<String> keywords(String text) {
        Set<String> result = new LinkedHashSet<>();
        if (text != null) {
            for (String part : text.split("[,，;；\\s]+")) {
                if (!part.isBlank()) {
                    result.add(part.trim());
                }
            }
        }
        if (result.isEmpty()) {
            result.add("农业");
        }
        return new ArrayList<>(result);
    }

    private String joinKeywords(String... values) {
        return java.util.Arrays.stream(values)
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .collect(Collectors.joining(" "));
    }

    private Map<String, Object> parseProperties(String json) {
        if (json == null || json.isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Map.of();
        }
    }

    private boolean lessThan(Double value, double threshold) {
        return value != null && value < threshold;
    }

    private boolean greaterThan(Double value, double threshold) {
        return value != null && value > threshold;
    }

    private boolean contains(String value, String... keywords) {
        if (value == null) {
            return false;
        }
        for (String keyword : keywords) {
            if (value.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private String cut(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
