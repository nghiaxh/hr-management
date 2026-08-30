package com.hrmanagement.leavebalance.controller;

import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.common.policy.CurrentUserPolicy;
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
    private final CurrentUserPolicy currentUserPolicy;
    private final EmployeeRepository employeeRepository;

    public LeaveBalanceController(LeaveBalanceService leaveBalanceService,
                                  CurrentUserPolicy currentUserPolicy,
                                  EmployeeRepository employeeRepository) {
        this.leaveBalanceService = leaveBalanceService;
        this.currentUserPolicy = currentUserPolicy;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping("/my")
    public ResponseEntity<LeaveBalanceResponse> findMyBalance() {
        String userId = SecurityUtil.getCurrentUserId();
        Employee emp = currentUserPolicy.currentEmployee(userId)
                .orElseThrow(() -> new NotFoundException("Employee profile not found"));
        return ResponseEntity.ok(leaveBalanceService.findByEmployee(emp.getId()));
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<LeaveBalanceResponse> findByEmployee(@PathVariable String employeeId) {
        String userRole = SecurityUtil.getCurrentUserRole();
        String userId = SecurityUtil.getCurrentUserId();

        Employee targetEmp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee not found"));

        if ("admin".equals(userRole)) {
            return ResponseEntity.ok(leaveBalanceService.findByEmployee(employeeId));
        }

        if ("manager".equals(userRole)) {
            Optional<Employee> mgrEmp = currentUserPolicy.currentEmployee(userId);
            if (mgrEmp.isPresent() && currentUserPolicy.isSameDepartment(mgrEmp.get(), targetEmp)) {
                return ResponseEntity.ok(leaveBalanceService.findByEmployee(employeeId));
            }
            throw new NotFoundException("Employee not found");
        }

        if (currentUserPolicy.isSelf(userId, targetEmp)) {
            return ResponseEntity.ok(leaveBalanceService.findByEmployee(employeeId));
        }
        throw new NotFoundException("Employee not found");
    }
}
