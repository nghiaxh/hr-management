package com.hrmanagement.leavebalance.controller;

import com.hrmanagement.common.util.SecurityUtil;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import com.hrmanagement.leavebalance.dto.LeaveBalanceResponse;
import com.hrmanagement.leavebalance.service.LeaveBalanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leave-balance")
public class LeaveBalanceController {

    private final LeaveBalanceService leaveBalanceService;
    private final EmployeeRepository employeeRepository;

    public LeaveBalanceController(LeaveBalanceService leaveBalanceService,
                                  EmployeeRepository employeeRepository) {
        this.leaveBalanceService = leaveBalanceService;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping("/my")
    public ResponseEntity<LeaveBalanceResponse> findMyBalance() {
        String userId = SecurityUtil.getCurrentUserId();
        Employee emp = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new com.hrmanagement.common.exception.NotFoundException("Employee profile not found"));
        return ResponseEntity.ok(leaveBalanceService.findByEmployee(emp.getId()));
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<LeaveBalanceResponse> findByEmployee(@PathVariable String employeeId) {
        return ResponseEntity.ok(leaveBalanceService.findByEmployee(employeeId));
    }
}
