package com.cby.smartfarm.service;

import com.cby.smartfarm.entity.FarmTask;
import com.cby.smartfarm.repository.FarmTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FarmTaskService {

    private final FarmTaskRepository farmTaskRepository;

    public List<FarmTask> findAll() {
        return farmTaskRepository.findAll();
    }

    public FarmTask findById(Long id) {
        return farmTaskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("任务不存在: " + id));
    }

    public List<FarmTask> findByStatus(String status) {
        return farmTaskRepository.findByStatus(status);
    }

    @Transactional
    public FarmTask create(FarmTask task) {
        task.setId(null);
        task.setStatus("TODO");
        FarmTask saved = farmTaskRepository.save(task);
        log.info("任务创建: {} - {}", saved.getId(), saved.getTaskName());
        return saved;
    }

    @Transactional
    public FarmTask assign(Long id, String assignee) {
        FarmTask task = findById(id);
        task.setAssignee(assignee);
        if ("TODO".equals(task.getStatus())) {
            task.setStatus("DOING");
        }
        FarmTask saved = farmTaskRepository.save(task);
        log.info("任务分配: {} → {}", saved.getTaskName(), assignee);
        return saved;
    }

    @Transactional
    public FarmTask complete(Long id) {
        FarmTask task = findById(id);
        task.setStatus("DONE");
        task.setFinishTime(LocalDateTime.now());
        FarmTask saved = farmTaskRepository.save(task);
        log.info("任务完成: {}", saved.getTaskName());
        return saved;
    }

    /**
     * 根据作物类型和生长期自动生成建议任务
     */
    public List<Map<String, String>> getAdvice(String crop, String stage) {
        List<Map<String, String>> adviceList = new ArrayList<>();
        String key = (crop + "_" + stage).toLowerCase();

        String[][] advices = switch (key) {
            case "tomato_seedling", "番茄_苗期" -> new String[][]{
                    {"浇水", "灌溉", "番茄苗期需保持土壤湿润"},
                    {"补光", "补光", "苗期光照不足时需补充蓝光"},
                    {"巡检", "巡检", "检查苗期生长状况"}
            };
            case "tomato_flowering", "番茄_开花期" -> new String[][]{
                    {"施肥", "施肥", "开花期追施磷钾肥促进花芽分化"},
                    {"人工授粉检查", "授粉", "检查番茄花粉传播情况"}
            };
            case "tomato_fruiting", "番茄_结果期" -> new String[][]{
                    {"采收检查", "采收", "检查果实成熟度，及时采收"},
                    {"病虫害巡检", "打药", "结果期重点防治蚜虫和白粉虱"}
            };
            case "cucumber_seedling", "黄瓜_苗期" -> new String[][]{
                    {"保持湿度", "灌溉", "黄瓜苗期需高湿度环境"},
                    {"补光", "补光", "苗期适当补光促进生长"}
            };
            case "strawberry_fruiting", "草莓_结果期" -> new String[][]{
                    {"采收", "采收", "草莓成熟后及时采收避免过熟"},
                    {"控温", "巡检", "结果期保持温度在15-25°C"},
                    {"控湿", "灌溉", "控制湿度防止灰霉病"}
            };
            default -> new String[][]{
                    {"常规巡检", "巡检", "定期检查作物生长状况"}
            };
        };

        for (String[] a : advices) {
            Map<String, String> item = new HashMap<>();
            item.put("taskName", a[0]);
            item.put("taskType", a[1]);
            item.put("remark", a[2]);
            adviceList.add(item);
        }

        log.info("生成建议任务: {} + {}，共 {} 条", crop, stage, adviceList.size());
        return adviceList;
    }
}
