package com.hrmanagement.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hrmanagement.auth.entity.User;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public class AuthResponse {
    @Getter private UserInfo user;
    @Getter private String token;

    public AuthResponse(User user, String token) {
        this.user = new UserInfo(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getName()
        );
        this.token = token;
    }

@NoArgsConstructor
@Getter
public static class UserInfo {
        @JsonProperty("id")
        private String id;
        private String email;
        private String role;
        private String name;

        public UserInfo(String id, String email, String role, String name) {
            this.id = id;
            this.email = email;
            this.role = role;
            this.name = name;
        }
    }
}