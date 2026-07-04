package com.hrmanagement.leave.controller;

import com.hrmanagement.common.dto.PaginatedResponse;
import com.hrmanagement.common.util.SecurityUtil;
import com.hrmanagement.leave.dto.CreateLeaveRequest;
import com.hrmanagement.leave.dto.LeaveResponse;
import com.hrmanagement.leave.dto.UpdateLeaveStatusRequest;
import com.hrmanagement.leave.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<LeaveResponse>> findAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        String userId = SecurityUtil.getCurrentUserId();
        String role = SecurityUtil.getCurrentUserRole();
        return ResponseEntity.ok(leaveService.findAll(status, employeeId, type, page, limit, role, userId));
    }

    @PostMapping
    public ResponseEntity<LeaveResponse> create(@Valid @RequestBody CreateLeaveRequest dto) {
        String userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(leaveService.create(dto, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveResponse> findOne(@PathVariable String id) {
        String userId = SecurityUtil.getCurrentUserId();
        String role = SecurityUtil.getCurrentUserRole();
        return ResponseEntity.ok(leaveService.findOne(id, role, userId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<LeaveResponse> updateStatus(@PathVariable String id,
                                                       @Valid @RequestBody UpdateLeaveStatusRequest dto) {
        String userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(leaveService.updateStatus(id, dto, userId));
    }
}
