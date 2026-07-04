package com.hrmanagement.leave.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateLeaveStatusRequest {
    @NotNull(message = "Status is required")
    private String status;
    private String rejectionReason;
}
