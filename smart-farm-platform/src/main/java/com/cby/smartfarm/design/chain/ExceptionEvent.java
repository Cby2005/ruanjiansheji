package com.cby.smartfarm.design.chain;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * 异常事件 - 责任链模式的数据载体
 *
 * 责任链模式用于异常事件分级处理，降低请求发送者与处理者之间的耦合。
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "异常事件（责任链模式）")
public class ExceptionEvent {

    @Schema(description = "事件类型：COMM_INTERRUPT/SENSOR_OFFLINE/PEST_EXCEEDED/FROST等")
    private String eventType;

    @Schema(description = "事件等级：LOW/MEDIUM/HIGH/CRITICAL")
    private String level;

    @Schema(description = "事件描述信息")
    private String message;

    @Schema(description = "是否已处理")
    private boolean handled;

    @Schema(description = "处理链路日志")
    private List<String> processLog = new ArrayList<>();

    public void addLog(String log) {
        processLog.add(log);
    }
}
