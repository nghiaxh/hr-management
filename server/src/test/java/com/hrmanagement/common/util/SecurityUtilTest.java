package com.hrmanagement.common.util;

import com.hrmanagement.common.exception.UnauthorizedException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SecurityUtilTest {

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        SecurityUtil.clearTestRoles();
    }

    @Test
    void requireRoles_allowsWhenRoleMatches() {
        SecurityUtil.setTestRoles("admin");
        assertDoesNotThrow(() -> SecurityUtil.requireRoles("admin"));
    }

    @Test
    void requireRoles_allowsWhenRoleInMultiple() {
        SecurityUtil.setTestRoles("manager");
        assertDoesNotThrow(() -> SecurityUtil.requireRoles("admin", "manager"));
    }

    @Test
    void requireRoles_throwsWhenRoleDoesNotMatch() {
        SecurityUtil.setTestRoles("employee");
        assertThrows(UnauthorizedException.class,
                () -> SecurityUtil.requireRoles("admin", "manager"));
    }

    @Test
    void requireRoles_usesSecurityContextWhenNoTestRole() {
        var auth = new UsernamePasswordAuthenticationToken(
                "user", null, List.of(() -> "ROLE_admin"));
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertDoesNotThrow(() -> SecurityUtil.requireRoles("admin"));
    }

    @Test
    void requireRoles_throwsWhenNoAuthentication() {
        SecurityContextHolder.clearContext();
        assertThrows(UnauthorizedException.class,
                () -> SecurityUtil.requireRoles("admin"));
    }

    @Test
    void getCurrentUserId_returnsUserIdFromToken() {
        var auth = new UsernamePasswordAuthenticationToken(
                "test-user-id", null, List.of(() -> "ROLE_admin"));
        SecurityContextHolder.getContext().setAuthentication(auth);

        String userId = SecurityUtil.getCurrentUserId();
        assertEquals("test-user-id", userId);
    }

    @Test
    void getCurrentUserRole_returnsRoleFromToken() {
        var auth = new UsernamePasswordAuthenticationToken(
                "user", null, List.of(() -> "ROLE_manager"));
        SecurityContextHolder.getContext().setAuthentication(auth);

        String role = SecurityUtil.getCurrentUserRole();
        assertEquals("manager", role);
    }
}
