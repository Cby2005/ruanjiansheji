package com.cby.smartfarm.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "city_location")
@Schema(description = "城市经纬度信息")
public class CityLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID")
    private Long id;

    @Column(name = "province", nullable = false, length = 50)
    @Schema(description = "省份")
    private String province;

    @Column(name = "city_name", nullable = false, length = 50)
    @Schema(description = "城市名称")
    private String cityName;

    @Column(name = "latitude", nullable = false)
    @Schema(description = "纬度")
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    @Schema(description = "经度")
    private Double longitude;
}
