package com.hrmanagement.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalEmployees;
    private long totalDepartments;
    private long pendingLeaves;
    private long presentToday;
    private BigDecimal monthlyPayroll;
    private List<Map<String, Object>> departmentStats;
    private List<Map<String, Object>> recentLeaves;
}
