package com.hrmanagement.attendance.controller;

import com.hrmanagement.attendance.dto.AttendanceResponse;
import com.hrmanagement.attendance.service.AttendanceService;
import com.hrmanagement.common.util.SecurityUtil;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public ResponseEntity<List<AttendanceResponse>> findAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) String status) {
        String userId = SecurityUtil.getCurrentUserId();
        String role = SecurityUtil.getCurrentUserRole();
        return ResponseEntity.ok(attendanceService.findAll(from, to, employeeId, status, role, userId));
    }

    @PostMapping("/check-in")
    public ResponseEntity<AttendanceResponse> checkIn() {
        String userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(attendanceService.checkIn(userId));
    }

    @PatchMapping("/{id}/check-out")
    public ResponseEntity<AttendanceResponse> checkOut(@PathVariable String id) {
        String userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(attendanceService.checkOut(id, userId));
    }
}
