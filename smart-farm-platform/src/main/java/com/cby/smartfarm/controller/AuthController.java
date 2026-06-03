package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 认证控制器
 * 处理用户注册和登录请求
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "用户认证", description = "用户注册、登录和认证管理")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "用户注册")
    public Result<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String role = request.get("role");

        if (username == null || username.trim().isEmpty()) {
            return Result.fail("用户名不能为空");
        }
        if (password == null || password.trim().isEmpty()) {
            return Result.fail("密码不能为空");
        }

        try {
            return Result.success(authService.register(username, password, role));
        } catch (IllegalArgumentException e) {
            return Result.fail(e.getMessage());
        }
    }

    @PostMapping("/login")
    @Operation(summary = "用户登录")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (username == null || username.trim().isEmpty()) {
            return Result.fail("用户名不能为空");
        }
        if (password == null || password.trim().isEmpty()) {
            return Result.fail("密码不能为空");
        }

        try {
            return Result.success(authService.login(username, password));
        } catch (IllegalArgumentException e) {
            return Result.fail(e.getMessage());
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "刷新Token")
    public Result<Map<String, Object>> refreshToken(@RequestHeader("Authorization") String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return Result.fail("Token无效");
        }

        try {
            String token = authorization.substring(7);
            return Result.success(authService.refreshToken(token));
        } catch (Exception e) {
            return Result.fail("Token已过期或无效");
        }
    }

    @PostMapping("/change-password")
    @Operation(summary = "修改密码")
    public Result<Map<String, Object>> changePassword(
            @RequestHeader("Authorization") String authorization,
            @RequestBody Map<String, String> request) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return Result.fail("未登录");
        }

        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        if (oldPassword == null || oldPassword.trim().isEmpty()) {
            return Result.fail("旧密码不能为空");
        }
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return Result.fail("新密码不能为空");
        }

        try {
            String token = authorization.substring(7);
            String username = authService.getCurrentUser(token).get("user").toString();
            // 从 token 中获取用户名
            username = token.substring(token.indexOf(".") + 1, token.lastIndexOf("."));
            // 简化处理，直接使用 token 解析
            return Result.success(authService.changePassword(
                getUsernameFromToken(authorization), oldPassword, newPassword));
        } catch (Exception e) {
            return Result.fail(e.getMessage());
        }
    }

    @GetMapping("/me")
    @Operation(summary = "获取当前用户信息")
    public Result<Map<String, Object>> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return Result.fail("未登录或Token无效");
        }

        try {
            String token = authorization.substring(7);
            return Result.success(authService.getCurrentUser(token));
        } catch (Exception e) {
            return Result.fail("Token已过期或无效");
        }
    }

    private String getUsernameFromToken(String authorization) {
        String token = authorization.substring(7);
        return authService.getCurrentUser(token).get("user").toString();
    }
}
