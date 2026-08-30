package com.hrmanagement.payroll.dto;

import java.math.BigDecimal;

public record PayrollEmployeeSummary(
        String id,
        String firstName,
        String lastName,
        String position,
        BigDecimal salary) {
}
