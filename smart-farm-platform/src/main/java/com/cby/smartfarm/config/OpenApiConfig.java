package com.cby.smartfarm.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("智慧农场综合管理平台 API")
                        .version("1.0.0")
                        .description("基于SpringBoot的IoT智慧农业管理系统，展示9种设计模式")
                        .contact(new Contact().name("CBY").email("admin@smartfarm.com"))
                        .license(new License().name("MIT")));
    }
}
