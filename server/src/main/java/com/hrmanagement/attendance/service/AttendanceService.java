package com.hrmanagement.attendance.service;

import com.hrmanagement.attendance.dto.AttendanceResponse;
import com.hrmanagement.attendance.entity.Attendance;
import com.hrmanagement.attendance.repository.AttendanceRepository;
import com.hrmanagement.common.exception.BadRequestException;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             EmployeeRepository employeeRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<AttendanceResponse> findAll(LocalDate from, LocalDate to, String employeeId, String status,
                                            String userRole, String userId) {
        List<Attendance> records;

        if ("employee".equals(userRole)) {
            Optional<Employee> emp = employeeRepository.findByUserId(userId);
            if (emp.isEmpty()) return List.of();
            if (from != null && to != null) {
                records = attendanceRepository.findByEmployeeIdAndDateBetween(emp.get().getId(), from, to);
            } else {
                records = attendanceRepository.findByEmployeeId(emp.get().getId());
            }
        } else if ("manager".equals(userRole)) {
            Optional<Employee> mgrEmp = employeeRepository.findByUserId(userId);
            if (mgrEmp.isEmpty() || mgrEmp.get().getDepartmentId() == null) return List.of();
            List<String> deptEmpIds = employeeRepository.findByDepartmentId(mgrEmp.get().getDepartmentId().getId())
                    .stream().map(Employee::getId).toList();
            if (employeeId != null && !employeeId.isBlank()) {
                if (!deptEmpIds.contains(employeeId)) return List.of();
                if (from != null && to != null) {
                    records = attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, from, to);
                } else {
                    records = attendanceRepository.findByEmployeeId(employeeId);
                }
            } else if (from != null && to != null) {
                records = attendanceRepository.findByEmployeeIdsAndDateRange(deptEmpIds, from, to);
            } else {
                records = attendanceRepository.findByEmployeeIdInAndDateBetween(deptEmpIds, LocalDate.now().minusMonths(2), LocalDate.now());
            }
        } else {
            // admin
            if (employeeId != null && !employeeId.isBlank()) {
                if (from != null && to != null) {
                    records = attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, from, to);
                } else {
                    records = attendanceRepository.findByEmployeeId(employeeId);
                }
            } else if (from != null && to != null) {
                records = attendanceRepository.findByDateRange(from, to);
            } else {
                records = attendanceRepository.findAll();
            }
        }

        if (status != null && !status.isBlank()) {
            records = records.stream().filter(r -> status.equals(r.getStatus())).toList();
        }

        return records.stream().map(this::toResponse).toList();
    }

    @Transactional
    public AttendanceResponse checkIn(String userId) {
        Employee emp = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Employee profile not found"));

        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(emp.getId(), today);
        if (existing.isPresent()) {
            throw new BadRequestException("Already checked in today");
        }

        LocalDateTime now = LocalDateTime.now();
        String status = now.toLocalTime().isAfter(LocalTime.of(9, 0)) ? "late" : "present";

        Attendance record = Attendance.builder()
                .employeeId(emp)
                .date(today)
                .checkIn(now)
                .status(status)
                .build();
        attendanceRepository.save(record);
        return toResponse(record);
    }

    @Transactional
    public AttendanceResponse checkOut(String id, String userId) {
        Employee emp = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Employee profile not found"));

        Attendance record = attendanceRepository.findById(id)
                .filter(r -> r.getEmployeeId().getId().equals(emp.getId()))
                .orElseThrow(() -> new NotFoundException("Attendance record not found"));

        if (record.getCheckOut() != null) {
            throw new BadRequestException("Already checked out");
        }

        record.setCheckOut(LocalDateTime.now());
        double hours = java.time.Duration.between(record.getCheckIn(), record.getCheckOut()).toMinutes() / 60.0;
        if (hours < 4) {
            record.setStatus("half-day");
        } else if ("late".equals(record.getStatus()) && hours >= 8) {
            record.setStatus("present");
        }
        attendanceRepository.save(record);
        return toResponse(record);
    }

    private AttendanceResponse toResponse(Attendance a) {
        AttendanceResponse resp = new AttendanceResponse();
        resp.setId(a.getId());
        resp.setDate(a.getDate());
        resp.setCheckIn(a.getCheckIn());
        resp.setCheckOut(a.getCheckOut());
        resp.setStatus(a.getStatus());
        resp.setNote(a.getNote());

        if (a.getEmployeeId() != null) {
            Employee emp = a.getEmployeeId();
            resp.setEmployeeId(java.util.Map.of(
                    "_id", emp.getId(),
                    "firstName", emp.getFirstName(),
                    "lastName", emp.getLastName(),
                    "position", emp.getPosition()
            ));
        }
        return resp;
    }
}
