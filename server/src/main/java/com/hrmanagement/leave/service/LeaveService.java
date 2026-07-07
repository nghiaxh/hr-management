package com.hrmanagement.leave.service;

import com.hrmanagement.auth.entity.User;
import com.hrmanagement.auth.repository.UserRepository;
import com.hrmanagement.common.dto.PaginatedResponse;
import com.hrmanagement.common.exception.BadRequestException;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.common.exception.UnauthorizedException;
import com.hrmanagement.common.util.SecurityUtil;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import com.hrmanagement.leave.dto.CreateLeaveRequest;
import com.hrmanagement.leave.dto.LeaveResponse;
import com.hrmanagement.leave.dto.UpdateLeaveStatusRequest;
import com.hrmanagement.leave.entity.Leave;
import com.hrmanagement.leave.repository.LeaveRepository;
import com.hrmanagement.leavebalance.service.LeaveBalanceService;
import com.hrmanagement.notification.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class LeaveService {
    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceService leaveBalanceService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public LeaveService(LeaveRepository leaveRepository,
            EmployeeRepository employeeRepository,
            LeaveBalanceService leaveBalanceService,
            NotificationService notificationService,
            UserRepository userRepository) {
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
        this.leaveBalanceService = leaveBalanceService;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    public PaginatedResponse<LeaveResponse> findAll(String status, String employeeId, String type,
            int page, int limit, String userRole, String userId) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Leave> leavePage;

        if ("employee".equals(userRole)) {
            Optional<Employee> emp = employeeRepository.findByUserId(userId);
            if (emp.isEmpty()) {
                return PaginatedResponse.of(List.of(), page, limit, 0);
            }
            String empId = emp.get().getId();
            if (status != null && !status.isBlank()) {
                leavePage = leaveRepository.findByEmployeeIdAndStatus(empId, status, pageRequest);
            } else {
                leavePage = leaveRepository.findByEmployeeId(empId, pageRequest);
            }
        } else if ("manager".equals(userRole)) {
            Optional<Employee> mgrEmp = employeeRepository.findByUserId(userId);
            if (mgrEmp.isEmpty() || mgrEmp.get().getDepartment() == null) {
                return PaginatedResponse.of(List.of(), page, limit, 0);
            }
            List<String> deptEmpIds = employeeRepository.findByDepartmentId(mgrEmp.get().getDepartment().getId())
                    .stream().map(Employee::getId).toList();

            if (status != null && !status.isBlank()) {
                leavePage = leaveRepository.findByEmployeeIdInAndStatus(deptEmpIds, status, pageRequest);
            } else if (type != null && !type.isBlank()) {
                leavePage = leaveRepository.findByEmployeeIdInAndType(deptEmpIds, type, pageRequest);
            } else {
                leavePage = leaveRepository.findByEmployeeIdIn(deptEmpIds, pageRequest);
            }
        } else {
            // admin
            if (employeeId != null && !employeeId.isBlank()) {
                if (status != null && !status.isBlank()) {
                    leavePage = leaveRepository.findByEmployeeIdAndStatus(employeeId, status, pageRequest);
                } else {
                    leavePage = leaveRepository.findByEmployeeId(employeeId, pageRequest);
                }
            } else if (status != null && !status.isBlank()) {
                leavePage = leaveRepository.findByStatus(status, pageRequest);
            } else {
                leavePage = leaveRepository.findAll(pageRequest);
            }
        }

        var responses = leavePage.getContent().stream().map(this::toResponse).toList();
        return PaginatedResponse.of(responses, page, limit, leavePage.getTotalElements());
    }

    public LeaveResponse findOne(String id, String userRole, String userId) {
        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Leave not found"));

        if ("employee".equals(userRole)) {
            Optional<Employee> emp = employeeRepository.findByUserId(userId);
            if (emp.isEmpty() || !emp.get().getId().equals(leave.getEmployee().getId())) {
                throw new UnauthorizedException("Access denied");
            }
        } else if ("manager".equals(userRole)) {
            Optional<Employee> mgrEmp = employeeRepository.findByUserId(userId);
            if (mgrEmp.isEmpty() || mgrEmp.get().getDepartment() == null) {
                throw new UnauthorizedException("Access denied");
            }
            Optional<Employee> leaveEmp = employeeRepository.findById(leave.getEmployee().getId());
            if (leaveEmp.isEmpty() || leaveEmp.get().getDepartment() == null ||
                    !leaveEmp.get().getDepartment().getId().equals(mgrEmp.get().getDepartment().getId())) {
                throw new UnauthorizedException("Access denied");
            }
        }
        return toResponse(leave);
    }

    @Transactional
    public LeaveResponse create(CreateLeaveRequest dto, String userId) {
        Employee emp = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Employee profile not found"));

        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("endDate must be >= startDate");
        }

        long days = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;
        if (days > 30) {
            throw new BadRequestException("Leave cannot exceed 30 days");
        }

        List<Leave> overlaps = leaveRepository.findOverlapping(emp.getId(), dto.getStartDate(), dto.getEndDate());
        if (!overlaps.isEmpty()) {
            throw new BadRequestException("Overlapping approved leave exists");
        }

        Leave leave = Leave.builder()
                .employee(emp)
                .type(dto.getType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .status("pending")
                .build();

        leaveRepository.save(leave);
        return toResponse(leave);
    }

    @Transactional
    public LeaveResponse updateStatus(String id, UpdateLeaveStatusRequest dto, String userId) {
        SecurityUtil.requireRoles("admin", "manager");
        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Leave not found"));

        if (!"pending".equals(leave.getStatus())) {
            throw new BadRequestException("Can only update pending leaves");
        }

        Employee emp = employeeRepository.findById(leave.getEmployee().getId())
                .orElseThrow(() -> new NotFoundException("Employee not found"));

        // Fix: Set the approver correctly using the current user's ID
        User approver = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Approving user not found"));

        leave.setStatus(dto.getStatus());
        leave.setApprovedBy(approver);

        if (dto.getRejectionReason() != null) {
            leave.setRejectionReason(dto.getRejectionReason());
        }

        leaveRepository.save(leave);

        if ("approved".equals(dto.getStatus())) {
            long days = ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;
            try {
                leaveBalanceService.deduct(leave.getEmployee().getId(), leave.getType(), days);
            } catch (Exception e) {
                // Rollback status if deduction fails
                leave.setStatus("pending");
                leaveRepository.save(leave);
                throw new BadRequestException("Insufficient leave balance: " + e.getMessage());
            }

            String userOwnerId = emp.getUser() != null ? emp.getUser().getId() : userId;
            String leaveTypeName = switch (leave.getType()) {
                case "annual" -> "phép năm";
                case "sick" -> "ốm";
                default -> "cá nhân";
            };
            notificationService.create(userOwnerId, "Đơn nghỉ phép đã duyệt",
                    "Đơn nghỉ phép " + leaveTypeName + " (" + leave.getStartDate() + " - " + leave.getEndDate()
                            + ") đã được duyệt.",
                    "leave_approved", leave.getId(), "Leave");
        } else if ("rejected".equals(dto.getStatus())) {
            String userOwnerId = emp.getUser() != null ? emp.getUser().getId() : userId;
            String leaveTypeName = switch (leave.getType()) {
                case "annual" -> "phép năm";
                case "sick" -> "ốm";
                default -> "cá nhân";
            };
            String reason = dto.getRejectionReason() != null ? " Lý do: " + dto.getRejectionReason() : "";
            notificationService.create(userOwnerId, "Đơn nghỉ phép bị từ chối",
                    "Đơn nghỉ phép " + leaveTypeName + " của bạn đã bị từ chối." + reason,
                    "leave_rejected", leave.getId(), "Leave");
        }

        return toResponse(leave);
    }

    private LeaveResponse toResponse(Leave leave) {
        LeaveResponse resp = new LeaveResponse();
        resp.setId(leave.getId());
        resp.setType(leave.getType());
        resp.setStartDate(leave.getStartDate());
        resp.setEndDate(leave.getEndDate());
        resp.setStatus(leave.getStatus());
        resp.setReason(leave.getReason());
        resp.setRejectionReason(leave.getRejectionReason());
        resp.setCreatedAt(leave.getCreatedAt());

        if (leave.getEmployee() != null) {
            Employee emp = leave.getEmployee();
            resp.setEmployeeId(Map.of(
                    "id", emp.getId(),
                    "firstName", emp.getFirstName(),
                    "lastName", emp.getLastName(),
                    "position", emp.getPosition()));
        }

        if (leave.getApprovedBy() != null) {
            resp.setApprovedBy(Map.of(
                    "id", leave.getApprovedBy().getId(),
                    "email", leave.getApprovedBy().getEmail(),
                    "name", leave.getApprovedBy().getName() != null ? leave.getApprovedBy().getName() : ""));
        }

        return resp;
    }
}