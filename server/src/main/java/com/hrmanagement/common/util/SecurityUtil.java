package com.hrmanagement.common.util;

import com.hrmanagement.common.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;

public class SecurityUtil {

    private static final ThreadLocal<String[]> testRoles = new ThreadLocal<>();

    public static void setTestRoles(String... roles) {
        testRoles.set(roles);
    }

    public static void clearTestRoles() {
        testRoles.remove();
    }

    public static String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof String) {
            return (String) principal;
        }
        return null;
    }

    public static String getCurrentUserRole() {
        String[] tr = testRoles.get();
        if (tr != null) {
            return tr.length > 0 ? tr[0] : null;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            return auth.getAuthorities().stream()
                    .findFirst()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .orElse(null);
        }
        return null;
    }

    public static void requireRoles(String... roles) {
        String[] tr = testRoles.get();
        if (tr != null) {
            String userRole = tr.length > 0 ? tr[0] : null;
            if (userRole == null || Arrays.stream(roles).noneMatch(r -> r.equals(userRole))) {
                throw new UnauthorizedException("Insufficient permissions");
            }
            return;
        }
        String userRole = getCurrentUserRole();
        if (userRole == null || Arrays.stream(roles).noneMatch(r -> r.equals(userRole))) {
            throw new UnauthorizedException("Insufficient permissions");
        }
    }
}
