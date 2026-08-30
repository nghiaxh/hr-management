package com.hrmanagement.department.service;

import com.hrmanagement.auth.entity.User;
import com.hrmanagement.auth.dto.UserSummary;
import com.hrmanagement.auth.repository.UserRepository;
import com.hrmanagement.common.dto.PaginatedResponse;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.common.util.SecurityUtil;
import com.hrmanagement.department.dto.CreateDepartmentRequest;
import com.hrmanagement.department.dto.DepartmentResponse;
import com.hrmanagement.department.entity.Department;
import com.hrmanagement.department.repository.DepartmentRepository;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public DepartmentService(DepartmentRepository departmentRepository,
                             EmployeeRepository employeeRepository,
                             UserRepository userRepository) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    public PaginatedResponse<DepartmentResponse> findAll(String search, int page, int limit, String userRole, String userId) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Department> deptPage;
        if ("manager".equals(userRole)) {
            Optional<Employee> mgrEmp = employeeRepository.findByUserId(userId);
            if (mgrEmp.isPresent() && mgrEmp.get().getDepartment() != null) {
                String deptId = mgrEmp.get().getDepartment().getId();
                Optional<Department> found = departmentRepository.findById(deptId);
                if (found.isPresent()) {
                    deptPage = new org.springframework.data.domain.PageImpl<>(
                            java.util.List.of(found.get()), pageRequest, 1);
                } else {
                    deptPage = Page.empty(pageRequest);
                }
            } else {
                deptPage = Page.empty(pageRequest);
            }
        } else if (search != null && !search.isBlank()) {
            deptPage = departmentRepository.findByNameContainingIgnoreCase(search, pageRequest);
        } else {
            deptPage = departmentRepository.findAll(pageRequest);
        }

        var responses = deptPage.getContent().stream().map(this::toResponse).toList();
        return PaginatedResponse.of(responses, page, limit, deptPage.getTotalElements());
    }

    public DepartmentResponse findOne(String id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department not found"));
        return toResponse(dept);
    }

    @Transactional
    public DepartmentResponse create(CreateDepartmentRequest dto) {
        SecurityUtil.requireRoles("admin");
        Department dept = Department.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();

        if (dto.getManagerId() != null) {
            User manager = userRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new NotFoundException("Manager user not found"));
            dept.setManager(manager);
        }

        departmentRepository.save(dept);
        return toResponse(dept);
    }

    @Transactional
    public DepartmentResponse update(String id, CreateDepartmentRequest dto) {
        SecurityUtil.requireRoles("admin");
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department not found"));

        if (dto.getName() != null) dept.setName(dto.getName());
        if (dto.getDescription() != null) dept.setDescription(dto.getDescription());
        if (dto.getManagerId() != null) {
            User manager = userRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new NotFoundException("Manager user not found"));
            dept.setManager(manager);
        }

        departmentRepository.save(dept);
        return toResponse(dept);
    }

    @Transactional
    public void remove(String id) {
        SecurityUtil.requireRoles("admin");
        if (!departmentRepository.existsById(id)) {
            throw new NotFoundException("Department not found");
        }
        departmentRepository.deleteById(id);
    }

    private DepartmentResponse toResponse(Department dept) {
        DepartmentResponse resp = new DepartmentResponse();
        resp.setId(dept.getId());
        resp.setName(dept.getName());
        resp.setDescription(dept.getDescription());
        resp.setCreatedAt(dept.getCreatedAt());
        resp.setUpdatedAt(dept.getUpdatedAt());

        if (dept.getManager() != null) {
            User manager = dept.getManager();
            resp.setManagerId(new UserSummary(manager.getId(), manager.getEmail(), manager.getRole(),
                    manager.getName() != null ? manager.getName() : ""));
        }
        return resp;
    }
}
