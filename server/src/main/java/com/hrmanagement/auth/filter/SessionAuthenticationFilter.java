package com.hrmanagement.auth.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        HttpSession session = request.getSession(false);

        if (session != null) {
            String userId = (String) session.getAttribute("userId");
            String userRole = (String) session.getAttribute("userRole");

            if (userId != null && userRole != null) {
                long expiry = jwtExpiration;
                if (session.getMaxInactiveInterval() > 0) {
                    expiry = session.getMaxInactiveInterval() * 1000;
                }

                long now = System.currentTimeMillis();
                long sessionCreated = session.getCreationTime();
                long lastAccessed = session.getLastAccessedTime();

                if (now - lastAccessed < expiry && now - sessionCreated < expiry) {
                    // Session is valid, set authentication
                    List<GrantedAuthority> authorities = List.of(
                            new SimpleGrantedAuthority("ROLE_" + userRole));

                    Authentication auth = new UsernamePasswordAuthenticationToken(
                            userId, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    // Session expired, clear it
                    session.invalidate();
                    SecurityContextHolder.clearContext();
                }
            } else {
                SecurityContextHolder.clearContext();
            }
        } else {
            // No session found, check for JSESSIONID cookie to create one
            Optional<Cookie> jsessionCookie = Optional.ofNullable(null);
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("JSESSIONID".equals(cookie.getName())) {
                        jsessionCookie = Optional.of(cookie);
                        break;
                    }
                }
            }

            if (jsessionCookie.isPresent()) {
                // Session exists but wasn't loaded by getSession(false) -
                // this can happen, so let's try getSession(true)
                session = request.getSession(true);
                String userId = (String) session.getAttribute("userId");
                String userRole = (String) session.getAttribute("userRole");

                if (userId != null && userRole != null) {
                    List<GrantedAuthority> authorities = List.of(
                            new SimpleGrantedAuthority("ROLE_" + userRole));

                    Authentication auth = new UsernamePasswordAuthenticationToken(
                            userId, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    SecurityContextHolder.clearContext();
                }
            } else {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}