package com.hrmanagement.payroll.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollResponse {
    @JsonProperty("id")
    private String id;
    private PayrollEmployeeSummary employeeId;
    private Integer month;
    private Integer year;
    private BigDecimal basicSalary;
    private BigDecimal bonus;
    private BigDecimal socialInsurance;
    private BigDecimal healthInsurance;
    private BigDecimal unemploymentInsurance;
    private BigDecimal unionDues;
    private BigDecimal pit;
    private BigDecimal totalDeductions;
    private BigDecimal netPay;
    private String status;
    private Instant paidAt;
    @JsonProperty("createdAt")
    private Instant createdAt;
}
