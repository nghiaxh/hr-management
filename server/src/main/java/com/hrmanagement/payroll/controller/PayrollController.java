package com.hrmanagement.payroll.controller;

import com.hrmanagement.common.dto.PaginatedResponse;
import com.hrmanagement.common.util.SecurityUtil;
import com.hrmanagement.payroll.dto.PayrollResponse;
import com.hrmanagement.payroll.dto.ProcessPayrollRequest;
import com.hrmanagement.payroll.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<PayrollResponse>> findAll(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        String userId = SecurityUtil.getCurrentUserId();
        String role = SecurityUtil.getCurrentUserRole();
        return ResponseEntity.ok(payrollService.findAll(month, year, employeeId, status, page, limit, role, userId));
    }

    @PostMapping("/process")
    public ResponseEntity<List<PayrollResponse>> process(@Valid @RequestBody ProcessPayrollRequest dto) {
        return ResponseEntity.ok(payrollService.process(dto));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<PayrollResponse> pay(@PathVariable String id) {
        return ResponseEntity.ok(payrollService.pay(id));
    }
}
