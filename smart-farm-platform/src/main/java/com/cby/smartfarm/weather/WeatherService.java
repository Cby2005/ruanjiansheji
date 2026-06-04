package com.cby.smartfarm.weather;

import com.cby.smartfarm.weather.dto.WeatherCurrentDTO;
import com.cby.smartfarm.weather.dto.WeatherDecisionDTO;
import com.cby.smartfarm.weather.dto.WeatherForecastDTO;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WeatherService {

    private final OpenMeteoClient openMeteoClient;
    private final WeatherRecordMapper weatherRecordMapper;

    @Value("${farm.default.latitude:39.9042}")
    private Double defaultLatitude;

    @Value("${farm.default.longitude:116.4074}")
    private Double defaultLongitude;

    @Transactional
    public WeatherCurrentDTO current(Long farmId, Double latitude, Double longitude) {
        Coordinate coordinate = resolveCoordinate(latitude, longitude);
        JsonNode root = openMeteoClient.fetchCurrent(coordinate.latitude(), coordinate.longitude());
        JsonNode current = root.path("current");

        WeatherRecordEntity record = new WeatherRecordEntity();
        record.setFarmId(defaultFarmId(farmId));
        record.setLatitude(coordinate.latitude());
        record.setLongitude(coordinate.longitude());
        record.setRecordTime(parseTime(current.path("time").asText(null)));
        record.setTemperature(doubleValue(current, "temperature_2m"));
        record.setHumidity(doubleValue(current, "relative_humidity_2m"));
        record.setPrecipitation(doubleValue(current, "precipitation"));
        record.setWindSpeed(doubleValue(current, "wind_speed_10m"));
        record.setSoilTemperature(doubleValue(current, "soil_temperature_0cm"));
        record.setSoilMoisture(doubleValue(current, "soil_moisture_0_to_1cm"));
        record.setSource("Open-Meteo");
        weatherRecordMapper.save(record);
        return toCurrentDto(record);
    }

    public WeatherForecastDTO forecast(Long farmId, Double latitude, Double longitude) {
        Coordinate coordinate = resolveCoordinate(latitude, longitude);
        JsonNode root = openMeteoClient.fetchForecast(coordinate.latitude(), coordinate.longitude());
        WeatherForecastDTO dto = new WeatherForecastDTO();
        dto.setFarmId(defaultFarmId(farmId));
        dto.setLatitude(coordinate.latitude());
        dto.setLongitude(coordinate.longitude());
        dto.setSource("Open-Meteo");
        dto.setHourly(readHourly(root.path("hourly"), 72));
        return dto;
    }

    @Transactional
    public List<WeatherRecordEntity> history(Long farmId, Double latitude, Double longitude, LocalDate start, LocalDate end) {
        Coordinate coordinate = resolveCoordinate(latitude, longitude);
        JsonNode root = openMeteoClient.fetchHistory(coordinate.latitude(), coordinate.longitude(), start, end);
        List<WeatherRecordEntity> records = new ArrayList<>();
        for (WeatherForecastDTO.HourlyWeather item : readHourly(root.path("hourly"), Integer.MAX_VALUE)) {
            WeatherRecordEntity record = new WeatherRecordEntity();
            record.setFarmId(defaultFarmId(farmId));
            record.setLatitude(coordinate.latitude());
            record.setLongitude(coordinate.longitude());
            record.setRecordTime(item.getTime());
            record.setTemperature(item.getTemperature());
            record.setHumidity(item.getHumidity());
            record.setPrecipitation(item.getPrecipitation());
            record.setWindSpeed(item.getWindSpeed());
            record.setSoilTemperature(item.getSoilTemperature());
            record.setSoilMoisture(item.getSoilMoisture());
            record.setSource("Open-Meteo");
            records.add(record);
        }
        return weatherRecordMapper.saveAll(records);
    }

    @Transactional
    public WeatherDecisionDTO decisionInput(Long farmId, Double latitude, Double longitude) {
        WeatherCurrentDTO current = current(farmId, latitude, longitude);
        WeatherForecastDTO forecast = forecast(farmId, latitude, longitude);
        double next24hRain = forecast.getHourly().stream()
                .limit(24)
                .map(WeatherForecastDTO.HourlyWeather::getPrecipitation)
                .filter(value -> value != null)
                .mapToDouble(Double::doubleValue)
                .sum();

        WeatherDecisionDTO dto = new WeatherDecisionDTO();
        dto.setFarmId(current.getFarmId());
        dto.setLatitude(current.getLatitude());
        dto.setLongitude(current.getLongitude());
        dto.setTemperature(current.getTemperature());
        dto.setHumidity(current.getHumidity());
        dto.setPrecipitation(current.getPrecipitation());
        dto.setWindSpeed(current.getWindSpeed());
        dto.setSoilTemperature(current.getSoilTemperature());
        dto.setSoilMoisture(current.getSoilMoisture());
        dto.setNext24hPrecipitation(round(next24hRain));
        dto.setSource("Open-Meteo");
        dto.setRiskHints(buildRiskHints(current, next24hRain));
        dto.setAgentInputText(buildAgentInputText(current, next24hRain, dto.getRiskHints()));
        return dto;
    }

    private List<WeatherForecastDTO.HourlyWeather> readHourly(JsonNode hourly, int maxItems) {
        List<WeatherForecastDTO.HourlyWeather> list = new ArrayList<>();
        JsonNode times = hourly.path("time");
        int size = Math.min(times.size(), maxItems);
        for (int i = 0; i < size; i++) {
            WeatherForecastDTO.HourlyWeather item = new WeatherForecastDTO.HourlyWeather();
            item.setTime(parseTime(times.get(i).asText()));
            item.setTemperature(doubleAt(hourly, "temperature_2m", i));
            item.setHumidity(doubleAt(hourly, "relative_humidity_2m", i));
            item.setPrecipitation(doubleAt(hourly, "precipitation", i));
            item.setWindSpeed(doubleAt(hourly, "wind_speed_10m", i));
            item.setSoilTemperature(doubleAt(hourly, "soil_temperature_0cm", i));
            item.setSoilMoisture(doubleAt(hourly, "soil_moisture_0_to_1cm", i));
            list.add(item);
        }
        return list;
    }

    private List<String> buildRiskHints(WeatherCurrentDTO current, double next24hRain) {
        List<String> hints = new ArrayList<>();
        if (greaterThan(current.getTemperature(), 30.0)) {
            hints.add("高温");
        }
        if (greaterThan(current.getHumidity(), 75.0)) {
            hints.add("高湿");
        }
        if (lessThan(current.getTemperature(), 8.0)) {
            hints.add("低温");
        }
        if (greaterThan(current.getWindSpeed(), 8.0)) {
            hints.add("大风");
        }
        if (next24hRain < 1.0) {
            hints.add("未来24小时无降雨");
        } else if (next24hRain >= 20.0) {
            hints.add("未来24小时强降雨");
        }
        if (hints.isEmpty()) {
            hints.add("天气风险较低");
        }
        return hints;
    }

    private String buildAgentInputText(WeatherCurrentDTO current, double next24hRain, List<String> hints) {
        String rainText = next24hRain < 1.0 ? "未来24小时无明显降雨" : "未来24小时预计降雨" + round(next24hRain) + "mm";
        return "当前温度" + valueText(current.getTemperature()) + "℃，相对湿度"
                + valueText(current.getHumidity()) + "%，风速" + valueText(current.getWindSpeed())
                + "m/s，" + rainText + "，风险提示：" + String.join("、", hints)
                + "，需关注作物蒸散、灌溉安排和病害风险。";
    }

    private WeatherCurrentDTO toCurrentDto(WeatherRecordEntity record) {
        WeatherCurrentDTO dto = new WeatherCurrentDTO();
        dto.setFarmId(record.getFarmId());
        dto.setLatitude(record.getLatitude());
        dto.setLongitude(record.getLongitude());
        dto.setRecordTime(record.getRecordTime());
        dto.setTemperature(record.getTemperature());
        dto.setHumidity(record.getHumidity());
        dto.setPrecipitation(record.getPrecipitation());
        dto.setWindSpeed(record.getWindSpeed());
        dto.setSoilTemperature(record.getSoilTemperature());
        dto.setSoilMoisture(record.getSoilMoisture());
        dto.setSource(record.getSource());
        return dto;
    }

    private Coordinate resolveCoordinate(Double latitude, Double longitude) {
        return new Coordinate(latitude == null ? defaultLatitude : latitude,
                longitude == null ? defaultLongitude : longitude);
    }

    private Long defaultFarmId(Long farmId) {
        return farmId == null ? 1L : farmId;
    }

    private Double doubleValue(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isMissingNode() || value.isNull() ? null : value.asDouble();
    }

    private Double doubleAt(JsonNode node, String field, int index) {
        JsonNode array = node.path(field);
        if (!array.isArray() || index >= array.size() || array.get(index).isNull()) {
            return null;
        }
        return array.get(index).asDouble();
    }

    private LocalDateTime parseTime(String value) {
        if (value == null || value.isBlank()) {
            return LocalDateTime.now();
        }
        return LocalDateTime.parse(value);
    }

    private boolean greaterThan(Double value, double threshold) {
        return value != null && value > threshold;
    }

    private boolean lessThan(Double value, double threshold) {
        return value != null && value < threshold;
    }

    private Double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private String valueText(Double value) {
        return value == null ? "未知" : String.valueOf(value);
    }

    private record Coordinate(Double latitude, Double longitude) {
    }
}
