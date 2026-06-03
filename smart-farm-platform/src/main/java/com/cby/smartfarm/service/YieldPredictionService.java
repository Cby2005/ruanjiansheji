package com.cby.smartfarm.service;

import com.cby.smartfarm.entity.YieldPrediction;
import com.cby.smartfarm.repository.YieldPredictionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class YieldPredictionService {

    private final YieldPredictionRepository yieldPredictionRepository;

    /**
     * 产量预测公式：预测产量 = 基础产量 × 环境适宜度 × 农事完成率 × 设备稳定系数
     *
     * @param cropName   作物名称
     * @param baseYield  基础产量(kg)
     * @param envScore   环境适宜度(0~1)
     * @param taskScore  农事完成率(0~1)
     * @param deviceScore 设备稳定系数(0~1)
     */
    @Transactional
    public YieldPrediction predict(String cropName, double baseYield,
                                   double envScore, double taskScore, double deviceScore) {
        double predictedYield = Math.round(baseYield * envScore * taskScore * deviceScore * 100.0) / 100.0;

        YieldPrediction prediction = new YieldPrediction();
        prediction.setCropName(cropName);
        prediction.setBaseYield(baseYield);
        prediction.setEnvScore(envScore);
        prediction.setTaskScore(taskScore);
        prediction.setDeviceScore(deviceScore);
        prediction.setPredictedYield(predictedYield);

        YieldPrediction saved = yieldPredictionRepository.save(prediction);
        log.info("产量预测: 作物{}, 基础产量{}kg, 环境{}, 农事{}, 设备{}, 预测产量{}kg",
                cropName, baseYield, envScore, taskScore, deviceScore, predictedYield);
        return saved;
    }
}
