package com.hrmanagement.auth.controller;

import com.hrmanagement.auth.dto.*;
import com.hrmanagement.auth.service.AuthService;
import com.hrmanagement.common.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe() {
        String userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(authService.getMe(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@Valid @RequestBody ProfileUpdateRequest dto) {
        String userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(authService.updateProfile(userId, dto));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest dto) {
        String userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(authService.changePassword(userId, dto.getCurrentPassword(), dto.getNewPassword()));
    }
}
