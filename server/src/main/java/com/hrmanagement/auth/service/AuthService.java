package com.hrmanagement.auth.service;

import com.hrmanagement.auth.dto.*;
import com.hrmanagement.auth.entity.User;
import com.hrmanagement.auth.repository.UserRepository;
import com.hrmanagement.common.exception.BadRequestException;
import com.hrmanagement.common.exception.ConflictException;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.common.exception.UnauthorizedException;
import com.hrmanagement.employee.repository.EmployeeRepository;
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
    private final PasswordEncoder passwordEncoder;
    private final EmployeeRepository employeeRepository;

    public AuthService(UserRepository userRepository,
                   PasswordEncoder passwordEncoder,
                   EmployeeRepository employeeRepository,
                   @Value("${session.expiration}") long sessionExpiration) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.employeeRepository = employeeRepository;
        this.sessionExpiration = sessionExpiration;
    }

    private final long sessionExpiration;

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
            session.setMaxInactiveInterval((int) (sessionExpiration / 1000));
        }

        return new AuthResponse(user, employeeRepository.existsByUserId(user.getId()));
    }

    public Map<String, Object> getMe(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return toProfileMap(user);
    }

    public Map<String, Object> updateProfile(String userId, ProfileUpdateRequest dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new ConflictException("Email already exists");
            }
        }

        if (dto.getName() != null) user.setName(dto.getName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        userRepository.save(user);

        return toProfileMap(user);
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

    private Map<String, Object> toProfileMap(User user) {
        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "name", user.getName() != null ? user.getName() : "",
                "hasEmployeeProfile", employeeRepository.existsByUserId(user.getId())
        );
    }

    private HttpSession getCurrentHttpSession(boolean create) {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs) {
            return attrs.getRequest().getSession(create);
        }
        return null;
    }
}
