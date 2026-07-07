package com.hrmanagement.department.service;

import com.hrmanagement.auth.entity.User;
import com.hrmanagement.auth.repository.UserRepository;
import com.hrmanagement.common.dto.PaginatedResponse;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.common.util.SecurityUtil;
import com.hrmanagement.department.dto.CreateDepartmentRequest;
import com.hrmanagement.department.dto.DepartmentResponse;
import com.hrmanagement.department.entity.Department;
import com.hrmanagement.department.repository.DepartmentRepository;
import com.hrmanagement.employee.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock private DepartmentRepository departmentRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private UserRepository userRepository;

    private DepartmentService departmentService;
    private Department dept;
    private User manager;

    @BeforeEach
    void setUp() {
        departmentService = new DepartmentService(departmentRepository, employeeRepository, userRepository);
        manager = User.builder().id("user-1").email("mgr@b.com").role("manager").build();
        dept = new Department();
        dept.setId("dept-1");
        dept.setName("Engineering");
        dept.setDescription("Engineering team");
        dept.setManager(manager);
    }

    @Test
    void findOne_returnsDepartment() {
        when(departmentRepository.findById("dept-1")).thenReturn(Optional.of(dept));

        DepartmentResponse result = departmentService.findOne("dept-1");

        assertEquals("Engineering", result.getName());
    }

    @Test
    void findOne_throwsOnNotFound() {
        when(departmentRepository.findById("bad")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> departmentService.findOne("bad"));
    }

    @Test
    void create_savesDepartment() {
        SecurityUtil.setTestRoles("admin");
        when(userRepository.findById("user-1")).thenReturn(Optional.of(manager));
        when(departmentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        DepartmentResponse result = departmentService.create(
                new CreateDepartmentRequest("HR", "HR department", "user-1"));

        assertEquals("HR", result.getName());
        SecurityUtil.clearTestRoles();
    }

    @Test
    void update_modifiesDepartment() {
        SecurityUtil.setTestRoles("admin");
        when(departmentRepository.findById("dept-1")).thenReturn(Optional.of(dept));
        when(departmentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        DepartmentResponse result = departmentService.update("dept-1",
                new CreateDepartmentRequest("Engineering Updated", null, null));

        assertEquals("Engineering Updated", result.getName());
        SecurityUtil.clearTestRoles();
    }

    @Test
    void delete_removesDepartment() {
        SecurityUtil.setTestRoles("admin");
        when(departmentRepository.existsById("dept-1")).thenReturn(true);
        doNothing().when(departmentRepository).deleteById("dept-1");

        departmentService.remove("dept-1");

        verify(departmentRepository).deleteById("dept-1");
        SecurityUtil.clearTestRoles();
    }

    @Test
    void findAll_paginated() {
        when(departmentRepository.findAll(any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(org.springframework.data.domain.Page.empty());

        PaginatedResponse<DepartmentResponse> result = departmentService.findAll(null, 1, 10, "admin", "admin-user");

        assertNotNull(result);
    }
}
