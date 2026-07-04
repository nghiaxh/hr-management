package com.hrmanagement.employeehistory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateEmployeeHistoryRequest {
    @NotBlank(message = "Type is required")
    private String type;
    private String previousValue;
    @NotBlank(message = "New value is required")
    private String newValue;
    @NotNull(message = "Effective date is required")
    private LocalDate effectiveDate;
    private String note;
}
