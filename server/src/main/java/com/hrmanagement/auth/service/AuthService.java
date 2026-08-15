package com.hrmanagement.auth.service;

import com.hrmanagement.auth.dto.*;
import com.hrmanagement.auth.entity.User;
import com.hrmanagement.auth.repository.UserRepository;
import com.hrmanagement.common.exception.BadRequestException;
import com.hrmanagement.common.exception.ConflictException;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.common.exception.UnauthorizedException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpSession;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                   PasswordEncoder passwordEncoder,
                   @Value("${jwt.expiration}") long jwtExpiration) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtExpiration = jwtExpiration;
    }

    public AuthResponse register(RegisterRequest dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        User user = User.builder()
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .role("employee")
                .build();
        userRepository.save(user);

        String token = user.getEmail() + ":" + user.getPasswordHash();
        return new AuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        // Create/refresh session and store user info
        HttpSession session = getCurrentHttpSession(true);
        if (session != null) {
            session.setAttribute("userId", user.getId());
            session.setAttribute("userRole", user.getRole());
            session.setMaxInactiveInterval((int) (jwtExpiration / 1000));
        }

        String token = user.getEmail() + ":" + user.getPasswordHash();
        return new AuthResponse(user, token);
    }

    public Map<String, Object> getMe(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "name", user.getName() != null ? user.getName() : ""
        );
    }

    public Map<String, Object> updateProfile(String userId, ProfileUpdateRequest dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (dto.getName() != null) user.setName(dto.getName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        userRepository.save(user);

        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "name", user.getName() != null ? user.getName() : ""
        );
    }

    public Map<String, String> changePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Invalidate all sessions for this user on password change
        invalidateUserSessions(user.getId());

        return Map.of("message", "Password changed successfully");
    }

    private void invalidateUserSessions(String userId) {
        // Spring Session provides SessionRepository for this
        // Could be implemented to clear sessions for a specific user
    }

    private HttpSession getCurrentHttpSession(boolean create) {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        if (attrs == null) {
            return null;
        }
        return attrs.getRequest().getSession(create);
    }
}
