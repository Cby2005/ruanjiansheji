package com.cby.smartfarm.service;

import com.cby.smartfarm.entity.*;
import com.cby.smartfarm.repository.*;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.exceptions.CsvException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 数据导入服务
 * 负责从CSV文件导入各类数据集
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DataImportService {

    private final EnvironmentRecordRepository environmentRecordRepository;
    private final CropRecommendationRepository cropRecommendationRepository;
    private final FertilizerAdviceRepository fertilizerAdviceRepository;
    private final PestTypeRepository pestTypeRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 导入所有数据集
     */
    @Transactional
    public Map<String, Object> importAll() {
        Map<String, Object> result = new HashMap<>();
        result.put("environment", importEnvironmentData());
        result.put("cropRecommendation", importCropRecommendation());
        result.put("fertilizerAdvice", importFertilizerAdvice());
        result.put("pestType", importPestType());
        return result;
    }

    /**
     * 导入环境数据
     */
    @Transactional
    public Map<String, Object> importEnvironmentData() {
        Map<String, Object> result = new HashMap<>();
        List<EnvironmentRecord> records = new ArrayList<>();

        try {
            ClassPathResource resource = new ClassPathResource("data/sample_environment.csv");
            try (CSVReader reader = new CSVReaderBuilder(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))
                    .withCSVParser(new CSVParserBuilder().withSeparator(',').build())
                    .build()) {

                List<String[]> lines = reader.readAll();
                // 跳过标题行
                for (int i = 1; i < lines.size(); i++) {
                    String[] line = lines.get(i);
                    if (line.length >= 14) {
                        EnvironmentRecord record = new EnvironmentRecord();
                        record.setCollectTime(LocalDateTime.parse(line[0].trim(), DATE_FORMATTER));
                        record.setAirTemperature(parseDouble(line[1]));
                        record.setAirHumidity(parseDouble(line[2]));
                        record.setSoilTemperature(parseDouble(line[3]));
                        record.setSoilHumidity(parseDouble(line[4]));
                        record.setRainfall(parseDouble(line[5]));
                        record.setWindSpeed(parseDouble(line[6]));
                        record.setLightIntensity(parseDouble(line[7]));
                        record.setCo2(parseDouble(line[8]));
                        record.setPhValue(parseDouble(line[9]));
                        record.setEcValue(parseDouble(line[10]));
                        record.setNutrient(parseDouble(line[11]));
                        record.setPestType(line[12].trim());
                        record.setPestCount(parseInt(line[13]));
                        records.add(record);
                    }
                }
            }

            environmentRecordRepository.saveAll(records);
            result.put("success", true);
            result.put("count", records.size());
            result.put("message", "成功导入 " + records.size() + " 条环境数据");
            log.info("成功导入 {} 条环境数据", records.size());

        } catch (IOException | CsvException e) {
            log.error("导入环境数据失败", e);
            result.put("success", false);
            result.put("message", "导入失败: " + e.getMessage());
        }

        return result;
    }

    /**
     * 导入作物推荐数据
     */
    @Transactional
    public Map<String, Object> importCropRecommendation() {
        Map<String, Object> result = new HashMap<>();
        List<CropRecommendation> records = new ArrayList<>();

        try {
            ClassPathResource resource = new ClassPathResource("data/crop_recommendation.csv");
            try (CSVReader reader = new CSVReaderBuilder(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))
                    .withCSVParser(new CSVParserBuilder().withSeparator(',').build())
                    .build()) {

                List<String[]> lines = reader.readAll();
                // 跳过标题行
                for (int i = 1; i < lines.size(); i++) {
                    String[] line = lines.get(i);
                    if (line.length >= 8) {
                        CropRecommendation record = new CropRecommendation();
                        record.setN(parseDouble(line[0]));
                        record.setP(parseDouble(line[1]));
                        record.setK(parseDouble(line[2]));
                        record.setTemperature(parseDouble(line[3]));
                        record.setHumidity(parseDouble(line[4]));
                        record.setPh(parseDouble(line[5]));
                        record.setRainfall(parseDouble(line[6]));
                        record.setLabel(line[7].trim());
                        records.add(record);
                    }
                }
            }

            cropRecommendationRepository.saveAll(records);
            result.put("success", true);
            result.put("count", records.size());
            result.put("message", "成功导入 " + records.size() + " 条作物推荐数据");
            log.info("成功导入 {} 条作物推荐数据", records.size());

        } catch (IOException | CsvException e) {
            log.error("导入作物推荐数据失败", e);
            result.put("success", false);
            result.put("message", "导入失败: " + e.getMessage());
        }

        return result;
    }

    /**
     * 导入施肥建议数据
     */
    @Transactional
    public Map<String, Object> importFertilizerAdvice() {
        Map<String, Object> result = new HashMap<>();
        List<FertilizerAdvice> records = new ArrayList<>();

        try {
            ClassPathResource resource = new ClassPathResource("data/fertilizer_advice.csv");
            try (CSVReader reader = new CSVReaderBuilder(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))
                    .withCSVParser(new CSVParserBuilder().withSeparator(',').build())
                    .build()) {

                List<String[]> lines = reader.readAll();
                // 跳过标题行
                for (int i = 1; i < lines.size(); i++) {
                    String[] line = lines.get(i);
                    if (line.length >= 9) {
                        FertilizerAdvice record = new FertilizerAdvice();
                        record.setCrop(line[0].trim());
                        record.setN(parseDouble(line[1]));
                        record.setP(parseDouble(line[2]));
                        record.setK(parseDouble(line[3]));
                        record.setPh(parseDouble(line[4]));
                        record.setSoilMoisture(parseDouble(line[5]));
                        record.setFertilizerName(line[6].trim());
                        record.setFertilizerAmount(line[7].trim());
                        record.setAdvice(line[8].trim());
                        records.add(record);
                    }
                }
            }

            fertilizerAdviceRepository.saveAll(records);
            result.put("success", true);
            result.put("count", records.size());
            result.put("message", "成功导入 " + records.size() + " 条施肥建议数据");
            log.info("成功导入 {} 条施肥建议数据", records.size());

        } catch (IOException | CsvException e) {
            log.error("导入施肥建议数据失败", e);
            result.put("success", false);
            result.put("message", "导入失败: " + e.getMessage());
        }

        return result;
    }

    /**
     * 导入害虫类型数据
     */
    @Transactional
    public Map<String, Object> importPestType() {
        Map<String, Object> result = new HashMap<>();
        List<PestType> records = new ArrayList<>();

        try {
            ClassPathResource resource = new ClassPathResource("data/pest_type.csv");
            try (CSVReader reader = new CSVReaderBuilder(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))
                    .withCSVParser(new CSVParserBuilder().withSeparator(',').build())
                    .build()) {

                List<String[]> lines = reader.readAll();
                // 跳过标题行
                for (int i = 1; i < lines.size(); i++) {
                    String[] line = lines.get(i);
                    if (line.length >= 7) {
                        PestType record = new PestType();
                        record.setPestCode(line[0].trim());
                        record.setPestName(line[1].trim());
                        record.setPestCategory(line[2].trim());
                        record.setDamageCrop(line[3].trim());
                        record.setDamagePart(line[4].trim());
                        record.setDamageSymptom(line[5].trim());
                        record.setPreventionMethod(line[6].trim());
                        records.add(record);
                    }
                }
            }

            pestTypeRepository.saveAll(records);
            result.put("success", true);
            result.put("count", records.size());
            result.put("message", "成功导入 " + records.size() + " 条害虫类型数据");
            log.info("成功导入 {} 条害虫类型数据", records.size());

        } catch (IOException | CsvException e) {
            log.error("导入害虫类型数据失败", e);
            result.put("success", false);
            result.put("message", "导入失败: " + e.getMessage());
        }

        return result;
    }

    /**
     * 获取导入数据统计
     */
    public Map<String, Object> getImportStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("environmentRecordCount", environmentRecordRepository.count());
        stats.put("cropRecommendationCount", cropRecommendationRepository.count());
        stats.put("fertilizerAdviceCount", fertilizerAdviceRepository.count());
        stats.put("pestTypeCount", pestTypeRepository.count());
        return stats;
    }

    private Double parseDouble(String value) {
        try {
            return Double.parseDouble(value.trim());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private Integer parseInt(String value) {
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
