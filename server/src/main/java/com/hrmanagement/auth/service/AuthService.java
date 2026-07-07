package com.hrmanagement.auth.service;

import com.hrmanagement.auth.dto.*;
import com.hrmanagement.auth.entity.User;
import com.hrmanagement.auth.repository.UserRepository;
import com.hrmanagement.common.exception.BadRequestException;
import com.hrmanagement.common.exception.ConflictException;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.common.exception.UnauthorizedException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecretKey jwtKey;
    private final long jwtExpiration;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       @Value("${jwt.secret}") String jwtSecret,
                       @Value("${jwt.expiration}") long jwtExpiration) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
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

        return generateToken(user);
    }

    public AuthResponse login(LoginRequest dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return generateToken(user);
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

        return Map.of("message", "Password changed successfully");
    }

    private AuthResponse generateToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpiration);

        String token = Jwts.builder()
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(jwtKey)
                .compact();

        return AuthResponse.of(token, user.getId(), user.getEmail(), user.getRole(), user.getName());
    }
}
