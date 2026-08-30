package com.hrmanagement.auth.dto;

public record UserSummary(String id, String email, String role, String name) {
    public UserSummary {
        name = name != null ? name : "";
    }
}
