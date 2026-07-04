package com.hrmanagement.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManagerDashboardResponse {
    private String departmentName;
    private long totalEmployees;
    private long pendingLeaves;
    private long presentToday;
    private BigDecimal departmentPayroll;
}
