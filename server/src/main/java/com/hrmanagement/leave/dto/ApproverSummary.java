package com.hrmanagement.leave.dto;

public record ApproverSummary(String id, String email, String name) {
    public ApproverSummary {
        name = name != null ? name : "";
    }
}
