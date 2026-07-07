package com.hrmanagement.leave.service;

import com.hrmanagement.auth.entity.User;
import com.hrmanagement.auth.repository.UserRepository;
import com.hrmanagement.common.dto.PaginatedResponse;
import com.hrmanagement.common.exception.BadRequestException;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.common.exception.UnauthorizedException;
import com.hrmanagement.common.util.SecurityUtil;
import com.hrmanagement.department.entity.Department;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import com.hrmanagement.leave.dto.CreateLeaveRequest;
import com.hrmanagement.leave.dto.LeaveResponse;
import com.hrmanagement.leave.dto.UpdateLeaveStatusRequest;
import com.hrmanagement.leave.entity.Leave;
import com.hrmanagement.leave.repository.LeaveRepository;
import com.hrmanagement.leavebalance.service.LeaveBalanceService;
import com.hrmanagement.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveServiceTest {

    @Mock private LeaveRepository leaveRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private LeaveBalanceService leaveBalanceService;
    @Mock private NotificationService notificationService;
    @Mock private UserRepository userRepository;

    private LeaveService leaveService;

    private Employee emp;
    private Leave leave;
    private User approver;

    @BeforeEach
    void setUp() {
        leaveService = new LeaveService(leaveRepository, employeeRepository,
                leaveBalanceService, notificationService, userRepository);

        Department dept = new Department();
        dept.setId("dept-1");

        User user = User.builder().id("user-1").build();
        emp = Employee.builder().id("emp-1").user(user).department(dept)
                .firstName("John").lastName("Doe").position("Dev").build();
        emp.setUser(user);

        approver = User.builder().id("approver-1").email("mgr@b.com").build();

        leave = Leave.builder()
                .id("leave-1")
                .employee(emp)
                .type("annual")
                .startDate(LocalDate.of(2025, 7, 1))
                .endDate(LocalDate.of(2025, 7, 3))
                .status("pending")
                .build();
    }

    @Test
    void create_savesLeave() {
        when(employeeRepository.findByUserId("user-1")).thenReturn(Optional.of(emp));
        when(leaveRepository.findOverlapping(anyString(), any(), any())).thenReturn(List.of());
        when(leaveRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        LeaveResponse result = leaveService.create(
                new CreateLeaveRequest("annual", LocalDate.of(2025, 7, 1), LocalDate.of(2025, 7, 3), "Vacation"),
                "user-1");

        assertEquals("pending", result.getStatus());
        assertEquals("annual", result.getType());
        verify(leaveRepository).save(any(Leave.class));
    }

    @Test
    void create_throwsWhenEndDateBeforeStartDate() {
        when(employeeRepository.findByUserId("user-1")).thenReturn(Optional.of(emp));

        assertThrows(BadRequestException.class,
                () -> leaveService.create(
                        new CreateLeaveRequest("annual", LocalDate.of(2025, 7, 5), LocalDate.of(2025, 7, 3), ""),
                        "user-1"));
    }

    @Test
    void create_throwsWhenExceeds30Days() {
        when(employeeRepository.findByUserId("user-1")).thenReturn(Optional.of(emp));

        assertThrows(BadRequestException.class,
                () -> leaveService.create(
                        new CreateLeaveRequest("annual", LocalDate.of(2025, 7, 1), LocalDate.of(2025, 8, 5), ""),
                        "user-1"));
    }

    @Test
    void create_throwsOnOverlappingLeave() {
        when(employeeRepository.findByUserId("user-1")).thenReturn(Optional.of(emp));
        when(leaveRepository.findOverlapping(anyString(), any(), any())).thenReturn(List.of(leave));

        assertThrows(BadRequestException.class,
                () -> leaveService.create(
                        new CreateLeaveRequest("annual", LocalDate.of(2025, 7, 1), LocalDate.of(2025, 7, 3), ""),
                        "user-1"));
    }

    @Test
    void updateStatus_approvesAndDeductsBalance() {
        SecurityUtil.setTestRoles("manager");
        when(leaveRepository.findById("leave-1")).thenReturn(Optional.of(leave));
        when(employeeRepository.findById("emp-1")).thenReturn(Optional.of(emp));
        when(userRepository.findById("approver-1")).thenReturn(Optional.of(approver));
        when(leaveRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        doNothing().when(leaveBalanceService).deduct(anyString(), anyString(), anyLong());

        LeaveResponse result = leaveService.updateStatus("leave-1",
                new UpdateLeaveStatusRequest("approved", null), "approver-1");

        assertEquals("approved", result.getStatus());
        verify(leaveBalanceService).deduct("emp-1", "annual", 3L);
        verify(notificationService).create(anyString(), anyString(), anyString(), eq("leave_approved"), anyString(), anyString());
        SecurityUtil.clearTestRoles();
    }

    @Test
    void updateStatus_rejectsAndNotifies() {
        SecurityUtil.setTestRoles("manager");
        when(leaveRepository.findById("leave-1")).thenReturn(Optional.of(leave));
        when(employeeRepository.findById("emp-1")).thenReturn(Optional.of(emp));
        when(userRepository.findById("approver-1")).thenReturn(Optional.of(approver));
        when(leaveRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        LeaveResponse result = leaveService.updateStatus("leave-1",
                new UpdateLeaveStatusRequest("rejected", "Not enough reason"), "approver-1");

        assertEquals("rejected", result.getStatus());
        assertEquals("Not enough reason", result.getRejectionReason());
        verify(notificationService).create(anyString(), anyString(), anyString(), eq("leave_rejected"), anyString(), anyString());
        SecurityUtil.clearTestRoles();
    }

    @Test
    void updateStatus_throwsWhenNotPending() {
        SecurityUtil.setTestRoles("manager");
        leave.setStatus("approved");
        when(leaveRepository.findById("leave-1")).thenReturn(Optional.of(leave));

        assertThrows(BadRequestException.class,
                () -> leaveService.updateStatus("leave-1",
                        new UpdateLeaveStatusRequest("rejected", null), "approver-1"));
        SecurityUtil.clearTestRoles();
    }

    @Test
    void findAll_employeeSeesOwnLeaves() {
        when(employeeRepository.findByUserId("user-1")).thenReturn(Optional.of(emp));
        Page<Leave> page = new PageImpl<>(List.of(leave));
        when(leaveRepository.findByEmployeeId(eq("emp-1"), any(PageRequest.class)))
                .thenReturn(page);

        PaginatedResponse<LeaveResponse> result = leaveService.findAll(null, null, null, 1, 10, "employee", "user-1");

        assertEquals(1, result.getData().size());
    }

    @Test
    void findOne_employeeCanViewOwnLeave() {
        when(leaveRepository.findById("leave-1")).thenReturn(Optional.of(leave));
        when(employeeRepository.findByUserId("user-1")).thenReturn(Optional.of(emp));

        LeaveResponse result = leaveService.findOne("leave-1", "employee", "user-1");
        assertNotNull(result);
    }

    @Test
    void findOne_employeeCannotViewOthersLeave() {
        Employee otherEmp = Employee.builder().id("emp-other").build();
        when(leaveRepository.findById("leave-1")).thenReturn(Optional.of(leave));
        when(employeeRepository.findByUserId("user-other")).thenReturn(Optional.of(otherEmp));

        assertThrows(UnauthorizedException.class,
                () -> leaveService.findOne("leave-1", "employee", "user-other"));
    }

    @Test
    void findOne_throwsWhenNotFound() {
        when(leaveRepository.findById("bad-id")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                () -> leaveService.findOne("bad-id", "admin", "user-1"));
    }
}
