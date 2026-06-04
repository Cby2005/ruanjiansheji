package com.cby.smartfarm.weather;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.service.CityLocationService;
import com.cby.smartfarm.weather.dto.WeatherCurrentDTO;
import com.cby.smartfarm.weather.dto.WeatherDecisionDTO;
import com.cby.smartfarm.weather.dto.WeatherForecastDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
@Tag(name = "Open-Meteo 天气数据", description = "实时、预报、历史天气与 Agent 决策输入")
public class WeatherController {

    private final WeatherService weatherService;
    private final CityLocationService cityLocationService;

    @GetMapping("/current")
    @Operation(summary = "查询当前天气")
    public Result<WeatherCurrentDTO> current(
            @RequestParam(defaultValue = "1") Long farmId,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {
        return Result.success(weatherService.current(farmId, latitude, longitude));
    }

    @GetMapping("/forecast")
    @Operation(summary = "查询未来天气预报")
    public Result<WeatherForecastDTO> forecast(
            @RequestParam(defaultValue = "1") Long farmId,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {
        return Result.success(weatherService.forecast(farmId, latitude, longitude));
    }

    @GetMapping("/history")
    @Operation(summary = "查询历史天气并保存到 MySQL")
    public Result<List<WeatherRecordEntity>> history(
            @RequestParam(defaultValue = "1") Long farmId,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return Result.success(weatherService.history(farmId, latitude, longitude, start, end));
    }

    @GetMapping("/decision-input")
    @Operation(summary = "生成适合多 Agent 农业决策使用的天气输入")
    public Result<WeatherDecisionDTO> decisionInput(
            @RequestParam(defaultValue = "1") Long farmId,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {
        return Result.success(weatherService.decisionInput(farmId, latitude, longitude));
    }

    @GetMapping("/decision-input/by-city")
    @Operation(summary = "根据城市名称生成天气决策输入")
    public Result<WeatherDecisionDTO> decisionInputByCity(@RequestParam String cityName) {
        var loc = cityLocationService.findByName(cityName)
                .orElseThrow(() -> new RuntimeException("未找到城市: " + cityName));
        return Result.success(weatherService.decisionInput(1L, loc.getLatitude(), loc.getLongitude()));
    }

    @GetMapping("/forecast/by-city")
    @Operation(summary = "根据城市名称查询天气预报")
    public Result<WeatherForecastDTO> forecastByCity(@RequestParam String cityName) {
        var loc = cityLocationService.findByName(cityName)
                .orElseThrow(() -> new RuntimeException("未找到城市: " + cityName));
        return Result.success(weatherService.forecast(1L, loc.getLatitude(), loc.getLongitude()));
    }
}
