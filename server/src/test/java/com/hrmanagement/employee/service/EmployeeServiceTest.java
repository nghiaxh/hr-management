package com.hrmanagement.employee.service;

import com.hrmanagement.auth.entity.User;
import com.hrmanagement.auth.repository.UserRepository;
import com.hrmanagement.common.dto.PaginatedResponse;
import com.hrmanagement.common.exception.BadRequestException;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.common.policy.CurrentUserPolicy;
import com.hrmanagement.common.util.SecurityUtil;
import com.hrmanagement.department.entity.Department;
import com.hrmanagement.department.repository.DepartmentRepository;
import com.hrmanagement.employee.dto.CreateEmployeeRequest;
import com.hrmanagement.employee.dto.EmployeeResponse;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock private EmployeeRepository employeeRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private UserRepository userRepository;

    private EmployeeService employeeService;
    private Employee emp;
    private User user;
    private Department dept;

    @BeforeEach
    void setUp() {
        employeeService = new EmployeeService(employeeRepository, departmentRepository, userRepository,
                new CurrentUserPolicy(employeeRepository));
        user = User.builder().id("user-1").email("e@b.com").role("employee").name("Emp").build();
        dept = new Department();
        dept.setId("dept-1");
        dept.setName("Engineering");
        emp = Employee.builder().id("emp-1").user(user).department(dept)
                .firstName("John").lastName("Doe").position("Developer")
                .salary(new BigDecimal("15000000")).hireDate(LocalDate.of(2024, 1, 1)).build();
    }

    @Test
    void create_savesEmployee() {
        SecurityUtil.setTestRoles("admin");
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(departmentRepository.findById("dept-1")).thenReturn(Optional.of(dept));
        when(employeeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        EmployeeResponse result = employeeService.create(new CreateEmployeeRequest(
                "user-1", "dept-1", "John", "Doe", "Developer",
                new BigDecimal("15000000"), LocalDate.of(2024, 1, 1),
                "0123456789", "full-time", null));

        assertEquals("John", result.getFirstName());
        assertEquals("Developer", result.getPosition());
        SecurityUtil.clearTestRoles();
    }

    @Test
    void create_throwsWhenUserIdMissing() {
        SecurityUtil.setTestRoles("admin");
        assertThrows(BadRequestException.class,
                () -> employeeService.create(new CreateEmployeeRequest(
                        "", "dept-1", "John", "Doe", "Dev",
                        null, null, null, null, null)));
        SecurityUtil.clearTestRoles();
    }

    @Test
    void findOne_returnsEmployee() {
        when(employeeRepository.findById("emp-1")).thenReturn(Optional.of(emp));

        EmployeeResponse result = employeeService.findOne("emp-1", "admin", "user-admin");

        assertEquals("John", result.getFirstName());
    }

    @Test
    void findOne_employeeSeesOwnProfile() {
        when(employeeRepository.findById("emp-1")).thenReturn(Optional.of(emp));

        EmployeeResponse result = employeeService.findOne("emp-1", "employee", "user-1");

        assertEquals("John", result.getFirstName());
    }

    @Test
    void findOne_employeeCannotSeeOtherProfile() {
        when(employeeRepository.findById("emp-1")).thenReturn(Optional.of(emp));

        assertThrows(NotFoundException.class,
                () -> employeeService.findOne("emp-1", "employee", "other-user"));
    }

    @Test
    void update_updatesFields() {
        SecurityUtil.setTestRoles("admin");
        when(employeeRepository.findById("emp-1")).thenReturn(Optional.of(emp));
        when(employeeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        when(departmentRepository.findById("dept-1")).thenReturn(Optional.of(dept));
        EmployeeResponse result = employeeService.update("emp-1", new CreateEmployeeRequest(
                "user-1", "dept-1", "Jane", "Doe", "Senior Developer",
                new BigDecimal("20000000"), LocalDate.of(2023, 1, 1),
                null, null, null));

        assertEquals("Jane", result.getFirstName());
        assertEquals("Senior Developer", result.getPosition());
        SecurityUtil.clearTestRoles();
    }

    @Test
    void delete_removesEmployee() {
        SecurityUtil.setTestRoles("admin");
        when(employeeRepository.existsById("emp-1")).thenReturn(true);
        doNothing().when(employeeRepository).deleteById("emp-1");

        employeeService.remove("emp-1");

        verify(employeeRepository).deleteById("emp-1");
        SecurityUtil.clearTestRoles();
    }

    @Test
    void bulkDelete_validatesIds() {
        SecurityUtil.setTestRoles("admin");
        assertThrows(BadRequestException.class,
                () -> employeeService.bulkDelete(List.of()));
        SecurityUtil.clearTestRoles();
    }

    @Test
    void findOne_managerSeesDeptEmployee() {
        Employee mgrEmp = Employee.builder().id("mgr-emp").department(dept).build();
        when(employeeRepository.findById("emp-1")).thenReturn(Optional.of(emp));
        when(employeeRepository.findByUserId("mgr-user")).thenReturn(Optional.of(mgrEmp));

        EmployeeResponse result = employeeService.findOne("emp-1", "manager", "mgr-user");

        assertEquals("John", result.getFirstName());
    }

    @Test
    void findOne_managerCannotSeeOtherDeptEmployee() {
        Department otherDept = new Department();
        otherDept.setId("dept-other");
        Employee mgrEmp = Employee.builder().id("mgr-emp").department(otherDept).build();
        when(employeeRepository.findById("emp-1")).thenReturn(Optional.of(emp));
        when(employeeRepository.findByUserId("mgr-user")).thenReturn(Optional.of(mgrEmp));

        assertThrows(NotFoundException.class,
                () -> employeeService.findOne("emp-1", "manager", "mgr-user"));
    }

    @Test
    void findAll_employeeSeesOnlySelf() {
        when(employeeRepository.findByUserId("user-1")).thenReturn(Optional.of(emp));

        PaginatedResponse<EmployeeResponse> result = employeeService.findAll(null, null, 1, 10, "employee", "user-1");

        assertEquals(1, result.getData().size());
        assertEquals(emp.getId(), result.getData().get(0).getId());
        verify(employeeRepository, never()).findAll(any(PageRequest.class));
    }

    @Test
    void findAll_employeeWithoutProfileReturnsEmpty() {
        when(employeeRepository.findByUserId("user-1")).thenReturn(Optional.empty());

        PaginatedResponse<EmployeeResponse> result = employeeService.findAll(null, null, 1, 10, "employee", "user-1");

        assertEquals(0, result.getData().size());
    }

    @Test
    void exportCsv_forbidsEmployeeRole() {
        SecurityUtil.setTestRoles("employee");

        assertThrows(com.hrmanagement.common.exception.UnauthorizedException.class,
                () -> employeeService.exportCsv("employee", "user-1", null));

        SecurityUtil.clearTestRoles();
    }

    @Test
    void findAll_managerSeesDeptEmployees() {
        when(employeeRepository.findByUserId("mgr-user")).thenReturn(Optional.of(emp));
        Page<Employee> page = new PageImpl<>(List.of(emp));
        when(employeeRepository.findByDepartmentId(eq("dept-1"), any(PageRequest.class)))
                .thenReturn(page);

        PaginatedResponse<EmployeeResponse> result = employeeService.findAll(null, null, 1, 10, "manager", "mgr-user");

        assertEquals(1, result.getData().size());
    }
}
