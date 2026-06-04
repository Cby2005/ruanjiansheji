package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 用户管理控制器
 * 仅管理员可访问的用户管理接口
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "用户管理", description = "管理员专属的用户管理接口")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "获取所有用户列表")
    public Result<List<Map<String, Object>>> getAllUsers() {
        try {
            return Result.success(userService.getAllUsers());
        } catch (Exception e) {
            return Result.fail(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取用户")
    public Result<Map<String, Object>> getUserById(@PathVariable Long id) {
        try {
            return Result.success(userService.getUserById(id));
        } catch (Exception e) {
            return Result.fail(e.getMessage());
        }
    }

    @PostMapping
    @Operation(summary = "创建用户")
    public Result<Map<String, Object>> createUser(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String role = request.get("role");

        if (username == null || username.trim().isEmpty()) {
            return Result.fail("用户名不能为空");
        }
        if (password == null || password.trim().isEmpty()) {
            return Result.fail("密码不能为空");
        }
        if (role == null || role.trim().isEmpty()) {
            return Result.fail("角色不能为空");
        }

        try {
            return Result.success(userService.createUser(username, password, role));
        } catch (Exception e) {
            return Result.fail(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新用户信息")
    public Result<Map<String, Object>> updateUser(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String username = request.get("username");
        String role = request.get("role");

        try {
            return Result.success(userService.updateUser(id, username, role));
        } catch (Exception e) {
            return Result.fail(e.getMessage());
        }
    }

    @PostMapping("/{id}/reset-password")
    @Operation(summary = "重置用户密码")
    public Result<Map<String, Object>> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String newPassword = request.get("newPassword");

        if (newPassword == null || newPassword.trim().isEmpty()) {
            return Result.fail("新密码不能为空");
        }

        try {
            return Result.success(userService.resetPassword(id, newPassword));
        } catch (Exception e) {
            return Result.fail(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除用户")
    public Result<Map<String, Object>> deleteUser(@PathVariable Long id) {
        try {
            return Result.success(userService.deleteUser(id));
        } catch (Exception e) {
            return Result.fail(e.getMessage());
        }
    }

    @PutMapping("/{id}/toggle-status")
    @Operation(summary = "切换用户启用/禁用状态")
    public Result<Map<String, Object>> toggleUserStatus(@PathVariable Long id) {
        try {
            return Result.success(userService.toggleUserStatus(id));
        } catch (Exception e) {
            return Result.fail(e.getMessage());
        }
    }

    @GetMapping("/stats")
    @Operation(summary = "获取用户统计信息")
    public Result<Map<String, Object>> getUserStats() {
        try {
            return Result.success(userService.getUserStats());
        } catch (Exception e) {
            return Result.fail(e.getMessage());
        }
    }
}
