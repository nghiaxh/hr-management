package com.hrmanagement.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserInfo user;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        @JsonProperty("_id")
        private String id;
        private String email;
        private String role;
        private String name;
    }

    public static AuthResponse of(String token, String id, String email, String role, String name) {
        return new AuthResponse(token, new UserInfo(id, email, role, name));
    }
}
