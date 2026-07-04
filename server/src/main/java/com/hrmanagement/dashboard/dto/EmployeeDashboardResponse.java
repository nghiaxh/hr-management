package com.hrmanagement.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDashboardResponse {
    private Map<String, Long> myLeaves;
    private Map<String, Long> myAttendance;
    private Object lastPayroll;
    private List<Map<String, Object>> upcomingLeaves;
}
