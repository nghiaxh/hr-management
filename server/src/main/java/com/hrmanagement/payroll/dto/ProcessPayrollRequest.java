package com.hrmanagement.payroll.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ProcessPayrollRequest {
    @NotEmpty(message = "Employee IDs are required")
    private List<String> employeeIds;

    @Min(1) @Max(12)
    private Integer month;

    @Min(2020)
    private Integer year;

    private Map<String, Double> bonuses;
    private Map<String, Double> deductions;
}
