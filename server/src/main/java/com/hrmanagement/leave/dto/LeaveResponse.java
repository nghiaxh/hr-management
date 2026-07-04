package com.hrmanagement.leave.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveResponse {
    @JsonProperty("_id")
    private String id;
    private Object employeeId;
    private String type;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Object approvedBy;
    private String reason;
    private String rejectionReason;
    @JsonProperty("createdAt")
    private Instant createdAt;
}
