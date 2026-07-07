package com.hrmanagement.employee.service;

import com.hrmanagement.common.dto.PaginatedResponse;
import com.hrmanagement.common.exception.BadRequestException;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.common.util.SecurityUtil;
import com.hrmanagement.department.entity.Department;
import com.hrmanagement.department.repository.DepartmentRepository;
import com.hrmanagement.employee.dto.CreateEmployeeRequest;
import com.hrmanagement.employee.dto.EmployeeResponse;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import com.hrmanagement.auth.entity.User;
import com.hrmanagement.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public EmployeeService(EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository,
            UserRepository userRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
    }

    public PaginatedResponse<EmployeeResponse> findAll(String search, String departmentId, int page, int limit,
            String userRole, String userId) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Employee> empPage;
        String effectiveDeptId = departmentId;

        if ("manager".equals(userRole)) {
            var mgrEmp = employeeRepository.findByUserId(userId);
            if (mgrEmp.isPresent() && mgrEmp.get().getDepartment() != null) {
                effectiveDeptId = mgrEmp.get().getDepartment().getId();
            }
        }

        if (effectiveDeptId != null && search != null && !search.isBlank()) {
            empPage = employeeRepository.searchByDepartment(effectiveDeptId, search, pageRequest);
        } else if (effectiveDeptId != null) {
            empPage = employeeRepository.findByDepartmentId(effectiveDeptId, pageRequest);
        } else if (search != null && !search.isBlank()) {
            empPage = employeeRepository.search(search, pageRequest);
        } else {
            empPage = employeeRepository.findAll(pageRequest);
        }

        var responses = empPage.getContent().stream().map(this::toResponse).toList();
        return PaginatedResponse.of(responses, page, limit, empPage.getTotalElements());
    }

    public EmployeeResponse findOne(String id, String userRole, String userId) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found"));

        if ("employee".equals(userRole)) {
            if (emp.getUser() == null || !emp.getUser().getId().equals(userId)) {
                throw new NotFoundException("Employee not found");
            }
        }
        return toResponse(emp);
    }

    @Transactional
    public EmployeeResponse create(CreateEmployeeRequest dto) {
        SecurityUtil.requireRoles("admin");
        if (dto.getUserId() == null || dto.getUserId().isBlank()) {
            throw new BadRequestException("User ID is required");
        }

        Employee emp = Employee.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .position(dto.getPosition())
                .salary(dto.getSalary())
                .hireDate(dto.getHireDate())
                .phone(dto.getPhone())
                .contractType(dto.getContractType())
                .contractExpiry(dto.getContractExpiry())
                .build();

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new NotFoundException("User not found"));
        emp.setUser(user);

        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new NotFoundException("Department not found"));
        emp.setDepartment(dept);

        employeeRepository.save(emp);
        return toResponse(emp);
    }

    @Transactional
    public EmployeeResponse update(String id, CreateEmployeeRequest dto) {
        SecurityUtil.requireRoles("admin");
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found"));

        if (dto.getFirstName() != null)
            emp.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null)
            emp.setLastName(dto.getLastName());
        if (dto.getPosition() != null)
            emp.setPosition(dto.getPosition());
        if (dto.getSalary() != null)
            emp.setSalary(dto.getSalary());
        if (dto.getHireDate() != null)
            emp.setHireDate(dto.getHireDate());
        if (dto.getPhone() != null)
            emp.setPhone(dto.getPhone());
        if (dto.getContractType() != null)
            emp.setContractType(dto.getContractType());
        if (dto.getContractExpiry() != null)
            emp.setContractExpiry(dto.getContractExpiry());

        if (dto.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new NotFoundException("Department not found"));
            emp.setDepartment(dept);
        }

        employeeRepository.save(emp);
        return toResponse(emp);
    }

    @Transactional
    public void remove(String id) {
        SecurityUtil.requireRoles("admin");
        if (!employeeRepository.existsById(id)) {
            throw new NotFoundException("Employee not found");
        }
        employeeRepository.deleteById(id);
    }

    @Transactional
    public Map<String, Object> bulkDelete(List<String> ids) {
        SecurityUtil.requireRoles("admin");
        if (ids == null || ids.isEmpty() || ids.size() > 100) {
            throw new BadRequestException("Invalid or too many IDs (max 100)");
        }
        employeeRepository.deleteAllById(ids);
        return Map.of("deleted", ids.size());
    }

    public void exportCsv(String userRole, String userId, HttpServletResponse response) throws IOException {
        String effectiveDeptId = null;
        if ("manager".equals(userRole)) {
            var mgrEmp = employeeRepository.findByUserId(userId);
            if (mgrEmp.isPresent() && mgrEmp.get().getDepartment() != null) {
                effectiveDeptId = mgrEmp.get().getDepartment().getId();
            }
        }

        List<Employee> employees;
        if (effectiveDeptId != null) {
            employees = employeeRepository.findByDepartmentId(effectiveDeptId);
        } else {
            employees = employeeRepository.findAll();
        }

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=employees.csv");
        PrintWriter writer = response.getWriter();
        writer.println("firstName,lastName,position,department,salary,email,phone,contractType,hireDate");
        for (Employee e : employees) {
            String deptName = e.getDepartment() != null ? e.getDepartment().getName() : "";
            String email = e.getUser() != null ? e.getUser().getEmail() : "";
            String hireDate = e.getHireDate() != null ? e.getHireDate().toString() : "";
            writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",%s,\"%s\",\"%s\",\"%s\",\"%s\"%n",
                    e.getFirstName(), e.getLastName(), e.getPosition(),
                    deptName, e.getSalary(), email,
                    e.getPhone() != null ? e.getPhone() : "",
                    e.getContractType() != null ? e.getContractType() : "",
                    hireDate);
        }
        writer.flush();
    }

    public Employee findByUserId(String userId) {
        return employeeRepository.findByUserId(userId).orElse(null);
    }

    public EmployeeResponse getMyEmployee(String userId) {
        return employeeRepository.findByUserId(userId)
                .map(this::toResponse)
                .orElse(null);
    }

    private EmployeeResponse toResponse(Employee emp) {
        EmployeeResponse resp = new EmployeeResponse();
        resp.setId(emp.getId());
        resp.setFirstName(emp.getFirstName());
        resp.setLastName(emp.getLastName());
        resp.setPosition(emp.getPosition());
        resp.setSalary(emp.getSalary());
        resp.setHireDate(emp.getHireDate());
        resp.setPhone(emp.getPhone());
        resp.setContractType(emp.getContractType());
        resp.setContractExpiry(emp.getContractExpiry());
        resp.setCreatedAt(emp.getCreatedAt());
        resp.setUpdatedAt(emp.getUpdatedAt());

        if (emp.getUser() != null) {
            resp.setUserId(Map.of(
                    "id", emp.getUser().getId(),
                    "email", emp.getUser().getEmail(),
                    "role", emp.getUser().getRole(),
                    "name", emp.getUser().getName() != null ? emp.getUser().getName() : ""));
        }

        if (emp.getDepartment() != null) {
            resp.setDepartmentId(Map.of(
                    "id", emp.getDepartment().getId(),
                    "name", emp.getDepartment().getName()));
        }

        return resp;
    }
}