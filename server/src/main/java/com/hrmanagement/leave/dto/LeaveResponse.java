package com.hrmanagement.leave.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hrmanagement.employee.dto.EmployeeSummary;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveResponse {
    @JsonProperty("id")
    private String id;
    private EmployeeSummary employeeId;
    private String type;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private ApproverSummary approvedBy;
    private String reason;
    private String rejectionReason;
    @JsonProperty("createdAt")
    private Instant createdAt;
}
