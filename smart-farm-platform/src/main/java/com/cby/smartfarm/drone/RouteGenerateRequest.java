package com.cby.smartfarm.drone;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record RouteGenerateRequest(
        @NotNull Long greenhouseId,
        @NotBlank String routeName,
        @NotBlank String routeType,
        Double startX,
        Double startY,
        Double startZ,
        Double endX,
        Double endY,
        Double endZ,
        @NotEmpty @Size(min = 2, message = "至少选择2个巡检点") List<Long> pointIds,
        @NotBlank String algorithmType) {}
