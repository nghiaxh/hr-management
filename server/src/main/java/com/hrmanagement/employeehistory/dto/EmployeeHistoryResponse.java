package com.hrmanagement.employeehistory.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeHistoryResponse {
    @JsonProperty("_id")
    private String id;
    private String employeeId;
    private String type;
    private String previousValue;
    private String newValue;
    private LocalDate effectiveDate;
    private String note;
    @JsonProperty("createdAt")
    private Instant createdAt;
    @JsonProperty("updatedAt")
    private Instant updatedAt;
}
