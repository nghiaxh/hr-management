package com.hrmanagement.auth.service;

import com.hrmanagement.auth.dto.*;
import com.hrmanagement.auth.entity.User;
import com.hrmanagement.auth.repository.UserRepository;
import com.hrmanagement.common.exception.BadRequestException;
import com.hrmanagement.common.exception.ConflictException;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.common.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    private AuthService authService;

    private static final String JWT_SECRET = "xPJb1efX8tSZHdjsqpkwzC2m6vQaoWrUMuB3l4DN0OGRAyYn0123456789";
    private static final long JWT_EXPIRATION = 86400000L;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, JWT_SECRET, JWT_EXPIRATION);
    }

    @Test
    void register_createsUserAndReturnsToken() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId("new-id");
            return u;
        });

        AuthResponse result = authService.register(new RegisterRequest("test@example.com", "password123"));

        assertNotNull(result);
        assertNotNull(result.getToken());
        assertEquals("test@example.com", result.getUser().getEmail());
        assertEquals("employee", result.getUser().getRole());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_throwsOnDuplicateEmail() {
        when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);

        assertThrows(ConflictException.class,
                () -> authService.register(new RegisterRequest("dup@example.com", "password123")));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_returnsTokenForValidCredentials() {
        User user = User.builder().id("u1").email("a@b.com").passwordHash("encoded").role("admin").build();
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass", "encoded")).thenReturn(true);

        AuthResponse result = authService.login(new LoginRequest("a@b.com", "pass"));

        assertNotNull(result);
        assertEquals("a@b.com", result.getUser().getEmail());
    }

    @Test
    void login_throwsOnWrongPassword() {
        User user = User.builder().passwordHash("encoded").build();
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        assertThrows(UnauthorizedException.class,
                () -> authService.login(new LoginRequest("a@b.com", "wrong")));
    }

    @Test
    void login_throwsOnUnknownEmail() {
        when(userRepository.findByEmail("unknown@b.com")).thenReturn(Optional.empty());

        assertThrows(UnauthorizedException.class,
                () -> authService.login(new LoginRequest("unknown@b.com", "pass")));
    }

    @Test
    void getMe_returnsUserInfo() {
        User user = User.builder().id("u1").email("a@b.com").role("admin").name("Admin").build();
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));

        var result = authService.getMe("u1");

        assertEquals("a@b.com", result.get("email"));
        assertEquals("Admin", result.get("name"));
    }

    @Test
    void getMe_throwsOnNotFound() {
        when(userRepository.findById("bad")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> authService.getMe("bad"));
    }

    @Test
    void updateProfile_updatesName() {
        User user = User.builder().id("u1").email("old@b.com").role("employee").build();
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = authService.updateProfile("u1", new ProfileUpdateRequest("New Name", null));

        assertEquals("New Name", result.get("name"));
    }

    @Test
    void changePassword_succeedsWithCorrectCurrent() {
        User user = User.builder().passwordHash("oldEncoded").build();
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPass", "oldEncoded")).thenReturn(true);
        when(passwordEncoder.encode("newPass")).thenReturn("newEncoded");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = authService.changePassword("u1", "oldPass", "newPass");

        assertEquals("Password changed successfully", result.get("message"));
        verify(userRepository).save(user);
    }

    @Test
    void changePassword_throwsOnWrongCurrent() {
        User user = User.builder().passwordHash("oldEncoded").build();
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "oldEncoded")).thenReturn(false);

        assertThrows(BadRequestException.class,
                () -> authService.changePassword("u1", "wrong", "newPass"));
    }
}
