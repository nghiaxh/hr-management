package com.hrmanagement.leavebalance.controller;

import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.common.util.SecurityUtil;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import com.hrmanagement.leavebalance.dto.LeaveBalanceResponse;
import com.hrmanagement.leavebalance.service.LeaveBalanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

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
        String userRole = SecurityUtil.getCurrentUserRole();
        String userId = SecurityUtil.getCurrentUserId();

        Employee targetEmp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new com.hrmanagement.common.exception.NotFoundException("Employee not found"));

        if ("admin".equals(userRole)) {
            return ResponseEntity.ok(leaveBalanceService.findByEmployee(employeeId));
        }

        if ("manager".equals(userRole)) {
            Optional<Employee> mgrEmp = employeeRepository.findByUserId(userId);
            if (mgrEmp.isPresent() && mgrEmp.get().getDepartment() != null &&
                    targetEmp.getDepartment() != null &&
                    mgrEmp.get().getDepartment().getId().equals(targetEmp.getDepartment().getId())) {
                return ResponseEntity.ok(leaveBalanceService.findByEmployee(employeeId));
            }
            throw new com.hrmanagement.common.exception.NotFoundException("Employee not found");
        }

        Optional<Employee> self = employeeRepository.findByUserId(userId);
        if (self.isPresent() && self.get().getId().equals(employeeId)) {
            return ResponseEntity.ok(leaveBalanceService.findByEmployee(employeeId));
        }
        throw new com.hrmanagement.common.exception.NotFoundException("Employee not found");
    }
}
