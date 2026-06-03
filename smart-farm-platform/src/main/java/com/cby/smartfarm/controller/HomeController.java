package com.cby.smartfarm.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 首页控制器
 * 将根路径重定向到 Swagger UI
 */
@Controller
public class HomeController {

    @GetMapping("/")
    public String index() {
        return "redirect:/swagger-ui.html";
    }
}
