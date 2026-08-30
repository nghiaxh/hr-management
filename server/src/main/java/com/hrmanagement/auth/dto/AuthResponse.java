package com.hrmanagement.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hrmanagement.auth.entity.User;
import lombok.Getter;

@Getter
public class AuthResponse {
    private final UserInfo user;

    public AuthResponse(User user, boolean hasEmployeeProfile) {
        this.user = new UserInfo(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getName(),
                hasEmployeeProfile
        );
    }

    @Getter
    public static class UserInfo {
        @JsonProperty("id")
        private final String id;
        private final String email;
        private final String role;
        private final String name;
        private final boolean hasEmployeeProfile;

        public UserInfo(String id, String email, String role, String name, boolean hasEmployeeProfile) {
            this.id = id;
            this.email = email;
            this.role = role;
            this.name = name;
            this.hasEmployeeProfile = hasEmployeeProfile;
        }
    }
}