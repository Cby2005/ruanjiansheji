import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class DatasetJdbcImporter {
    private static final String DB_URL = "jdbc:mysql://localhost:3306/smart_farm?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "20050828";
    private static final ZoneId CHINA_ZONE = ZoneId.of("Asia/Shanghai");
    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final String INSERT_ENVIRONMENT = """
            INSERT INTO environment_record
            (soil_temperature, soil_humidity, ph_value, ec_value, nutrient,
             air_temperature, air_humidity, light_intensity, co2, wind_speed,
             rainfall, pest_count, pest_type, collect_time)
            SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            WHERE NOT EXISTS (
                SELECT 1 FROM environment_record WHERE collect_time = ?
            )
            """;

    private static final String INSERT_YIELD = """
            INSERT INTO yield_prediction
            (crop_name, base_yield, env_score, task_score, device_score, predicted_yield, create_time)
            SELECT ?, ?, ?, ?, ?, ?, ?
            WHERE NOT EXISTS (
                SELECT 1 FROM yield_prediction WHERE crop_name = ? AND create_time = ?
            )
            """;

    public static void main(String[] args) throws Exception {
        Path root = Path.of("").toAbsolutePath();
        Path archiveData = root.resolve("archive").resolve("Data.csv");
        Path greenhouseData = root.resolve("GreenhouseEnvironmentTimeSeries.txt");
        Path iotMergedData = root.resolve("dataset_import").resolve("iot_environment_merged.csv");

        Class.forName("com.mysql.cj.jdbc.Driver");
        try (Connection connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            ensureIndexes(connection);
            connection.setAutoCommit(false);
            printCounts(connection, "before");

            int archiveEnvironment = importArchiveEnvironment(connection, archiveData);
            connection.commit();
            int archiveYield = importArchiveYield(connection, archiveData);
            connection.commit();
            int greenhouseEnvironment = importGreenhouseEnvironment(connection, greenhouseData);
            connection.commit();
            int iotEnvironment = importIotEnvironment(connection, iotMergedData);
            connection.commit();
            printCounts(connection, "after");

            System.out.println("imported.archive.environment=" + archiveEnvironment);
            System.out.println("imported.archive.yield=" + archiveYield);
            System.out.println("imported.greenhouse.environment=" + greenhouseEnvironment);
            System.out.println("imported.iot.environment=" + iotEnvironment);
        }
    }

    private static void ensureIndexes(Connection connection) throws SQLException {
        createIndexIfMissing(connection, "environment_record", "idx_environment_collect_time",
                "CREATE INDEX idx_environment_collect_time ON environment_record (collect_time)");
        createIndexIfMissing(connection, "yield_prediction", "idx_yield_crop_create_time",
                "CREATE INDEX idx_yield_crop_create_time ON yield_prediction (crop_name, create_time)");
    }

    private static void createIndexIfMissing(Connection connection, String table, String index, String createSql) throws SQLException {
        String query = """
                SELECT COUNT(*)
                FROM information_schema.statistics
                WHERE table_schema = DATABASE()
                  AND table_name = ?
                  AND index_name = ?
                """;
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, table);
            statement.setString(2, index);
            try (ResultSet resultSet = statement.executeQuery()) {
                resultSet.next();
                if (resultSet.getLong(1) > 0) {
                    return;
                }
            }
        }
        try (PreparedStatement statement = connection.prepareStatement(createSql)) {
            statement.executeUpdate();
        }
    }

    private static int importArchiveEnvironment(Connection connection, Path path) throws IOException, SQLException {
        int imported = 0;
        int index = 0;
        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8);
             PreparedStatement statement = connection.prepareStatement(INSERT_ENVIRONMENT)) {
            String line = reader.readLine();
            while ((line = reader.readLine()) != null) {
                List<String> row = parseCsvLine(line);
                if (row.size() < 10) {
                    continue;
                }
                double soilHumidity = parseDouble(row.get(2));
                double airTemperature = parseDouble(row.get(3));
                double airHumidity = parseDouble(row.get(4));
                double windSpeed = parseDouble(row.get(6)) / 3.6;
                double cropYield = parseDouble(row.get(9));
                LocalDateTime collectTime = LocalDateTime.parse(row.get(1).trim(), DATE_TIME);
                double soilTemperature = round(airTemperature - 1.5);
                double ph = round(6.5 + ((index % 9) - 4) * 0.05);
                double ec = round(1.1 + soilHumidity / 160.0);
                double nutrient = round(20.0 + cropYield / 100.0);
                double light = estimateLight(collectTime);
                double co2 = round(400.0 + Math.max(0.0, airHumidity - 50.0) * 1.8);
                double rainfall = soilHumidity > 82.0 ? 1.2 : 0.0;
                int pestCount = (soilHumidity > 72.0 && airTemperature > 24.0) ? index % 8 : 0;
                String pestType = pestCount > 0 ? "aphid" : "";

                bindEnvironment(statement, soilTemperature, soilHumidity, ph, ec, nutrient,
                        airTemperature, airHumidity, light, co2, windSpeed, rainfall, pestCount, pestType, collectTime);
                statement.addBatch();
                index++;
                if (index % 500 == 0) {
                    imported += countInserted(statement.executeBatch());
                }
            }
            imported += countInserted(statement.executeBatch());
        }
        return imported;
    }

    private static int importArchiveYield(Connection connection, Path path) throws IOException, SQLException {
        int imported = 0;
        int index = 0;
        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8);
             PreparedStatement statement = connection.prepareStatement(INSERT_YIELD)) {
            String line = reader.readLine();
            while ((line = reader.readLine()) != null) {
                List<String> row = parseCsvLine(line);
                if (row.size() < 10) {
                    continue;
                }
                double soilHumidity = parseDouble(row.get(2));
                double airTemperature = parseDouble(row.get(3));
                double airHumidity = parseDouble(row.get(4));
                double cropYield = parseDouble(row.get(9));
                LocalDateTime createTime = LocalDateTime.parse(row.get(1).trim(), DATE_TIME);
                double envScore = clamp(100.0
                        - Math.abs(airTemperature - 24.0) * 2.5
                        - Math.abs(airHumidity - 70.0) * 0.6
                        - Math.abs(soilHumidity - 65.0) * 0.5, 0.0, 100.0);

                int p = 1;
                statement.setString(p++, "greenhouse crop");
                statement.setDouble(p++, cropYield);
                statement.setDouble(p++, round(envScore));
                statement.setDouble(p++, 85.0);
                statement.setDouble(p++, 90.0);
                statement.setDouble(p++, cropYield);
                statement.setObject(p++, createTime);
                statement.setString(p++, "greenhouse crop");
                statement.setObject(p, createTime);
                statement.addBatch();
                index++;
                if (index % 500 == 0) {
                    imported += countInserted(statement.executeBatch());
                }
            }
            imported += countInserted(statement.executeBatch());
        }
        return imported;
    }

    private static int importGreenhouseEnvironment(Connection connection, Path path) throws IOException, SQLException {
        int imported = 0;
        int index = 0;
        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8);
             PreparedStatement statement = connection.prepareStatement(INSERT_ENVIRONMENT)) {
            String line = reader.readLine();
            while ((line = reader.readLine()) != null) {
                List<String> row = parseCsvLine(line);
                if (row.size() < 4) {
                    continue;
                }
                LocalDateTime collectTime = OffsetDateTime.parse(row.get(0).trim()).atZoneSameInstant(CHINA_ZONE).toLocalDateTime();
                double co2 = parseDouble(row.get(1));
                double airHumidity = parseDouble(row.get(2));
                double soilTemperature = round((parseDouble(row.get(3)) - 32.0) * 5.0 / 9.0);
                double airTemperature = round(soilTemperature + 1.0);

                bindEnvironment(statement, soilTemperature, null, null, null, null,
                        airTemperature, airHumidity, null, co2, null, null, 0, "", collectTime);
                statement.addBatch();
                index++;
                if (index % 500 == 0) {
                    imported += countInserted(statement.executeBatch());
                }
            }
            imported += countInserted(statement.executeBatch());
        }
        return imported;
    }

    private static int importIotEnvironment(Connection connection, Path path) throws IOException, SQLException {
        int imported = 0;
        int index = 0;
        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8);
             PreparedStatement statement = connection.prepareStatement(INSERT_ENVIRONMENT)) {
            String line = reader.readLine();
            while ((line = reader.readLine()) != null) {
                List<String> row = parseCsvLine(line);
                if (row.size() < 14) {
                    continue;
                }
                LocalDateTime collectTime = LocalDateTime.parse(row.get(0).trim(), DATE_TIME);
                bindEnvironment(statement,
                        parseNullableDouble(row.get(3)),
                        parseNullableDouble(row.get(4)),
                        parseNullableDouble(row.get(5)),
                        parseNullableDouble(row.get(6)),
                        parseNullableDouble(row.get(7)),
                        parseNullableDouble(row.get(1)),
                        parseNullableDouble(row.get(2)),
                        parseNullableDouble(row.get(8)),
                        parseNullableDouble(row.get(9)),
                        parseNullableDouble(row.get(10)),
                        parseNullableDouble(row.get(11)),
                        parseNullableInt(row.get(12)),
                        row.get(13).trim(),
                        collectTime);
                statement.addBatch();
                index++;
                if (index % 500 == 0) {
                    imported += countInserted(statement.executeBatch());
                }
            }
            imported += countInserted(statement.executeBatch());
        }
        return imported;
    }

    private static void bindEnvironment(PreparedStatement statement,
                                        Double soilTemperature,
                                        Double soilHumidity,
                                        Double phValue,
                                        Double ecValue,
                                        Double nutrient,
                                        Double airTemperature,
                                        Double airHumidity,
                                        Double lightIntensity,
                                        Double co2,
                                        Double windSpeed,
                                        Double rainfall,
                                        Integer pestCount,
                                        String pestType,
                                        LocalDateTime collectTime) throws SQLException {
        int p = 1;
        setDouble(statement, p++, soilTemperature);
        setDouble(statement, p++, soilHumidity);
        setDouble(statement, p++, phValue);
        setDouble(statement, p++, ecValue);
        setDouble(statement, p++, nutrient);
        setDouble(statement, p++, airTemperature);
        setDouble(statement, p++, airHumidity);
        setDouble(statement, p++, lightIntensity);
        setDouble(statement, p++, co2);
        setDouble(statement, p++, windSpeed);
        setDouble(statement, p++, rainfall);
        if (pestCount == null) {
            statement.setNull(p++, java.sql.Types.INTEGER);
        } else {
            statement.setInt(p++, pestCount);
        }
        statement.setString(p++, pestType == null ? "" : pestType);
        statement.setObject(p++, collectTime);
        statement.setObject(p, collectTime);
    }

    private static void setDouble(PreparedStatement statement, int index, Double value) throws SQLException {
        if (value == null || value.isNaN() || value.isInfinite()) {
            statement.setNull(index, java.sql.Types.DOUBLE);
        } else {
            statement.setDouble(index, value);
        }
    }

    private static List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder value = new StringBuilder();
        boolean quoted = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (quoted && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    value.append('"');
                    i++;
                } else {
                    quoted = !quoted;
                }
            } else if (c == ',' && !quoted) {
                values.add(value.toString());
                value.setLength(0);
            } else {
                value.append(c);
            }
        }
        values.add(value.toString());
        return values;
    }

    private static Double parseNullableDouble(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return parseDouble(value);
    }

    private static Integer parseNullableInt(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return (int) Math.round(parseDouble(value));
    }

    private static double parseDouble(String value) {
        if (value == null || value.isBlank()) {
            return 0.0;
        }
        return Double.parseDouble(value.trim());
    }

    private static double estimateLight(LocalDateTime time) {
        int hour = time.getHour();
        if (hour < 6 || hour > 18) {
            return 600.0;
        }
        double daylight = Math.sin(Math.PI * (hour - 6) / 12.0);
        return round(8000.0 + Math.max(0.0, daylight) * 62000.0);
    }

    private static double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private static int countInserted(int[] batchResult) {
        int count = 0;
        for (int result : batchResult) {
            if (result > 0 || result == PreparedStatement.SUCCESS_NO_INFO) {
                count++;
            }
        }
        return count;
    }

    private static void printCounts(Connection connection, String label) throws SQLException {
        System.out.println("counts." + label + ".environment_record=" + count(connection, "environment_record"));
        System.out.println("counts." + label + ".yield_prediction=" + count(connection, "yield_prediction"));
        System.out.println("counts." + label + ".crop_recommendation=" + count(connection, "crop_recommendation"));
        System.out.println("counts." + label + ".fertilizer_advice=" + count(connection, "fertilizer_advice"));
        System.out.println("counts." + label + ".pest_type=" + count(connection, "pest_type"));
    }

    private static long count(Connection connection, String table) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("SELECT COUNT(*) FROM " + table);
             ResultSet resultSet = statement.executeQuery()) {
            resultSet.next();
            return resultSet.getLong(1);
        }
    }
}
