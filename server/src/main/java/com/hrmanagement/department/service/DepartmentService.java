package com.hrmanagement.department.service;

import com.hrmanagement.auth.entity.User;
import com.hrmanagement.auth.repository.UserRepository;
import com.hrmanagement.common.dto.PaginatedResponse;
import com.hrmanagement.common.exception.NotFoundException;
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

import java.util.Map;
import java.util.Optional;

@Service
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
            if (mgrEmp.isPresent() && mgrEmp.get().getDepartmentId() != null) {
                String deptId = mgrEmp.get().getDepartmentId().getId();
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
        Department dept = Department.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();

        if (dto.getManagerId() != null) {
            User manager = userRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new NotFoundException("Manager user not found"));
            dept.setManagerId(manager);
        }

        departmentRepository.save(dept);
        return toResponse(dept);
    }

    @Transactional
    public DepartmentResponse update(String id, CreateDepartmentRequest dto) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department not found"));

        if (dto.getName() != null) dept.setName(dto.getName());
        if (dto.getDescription() != null) dept.setDescription(dto.getDescription());
        if (dto.getManagerId() != null) {
            User manager = userRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new NotFoundException("Manager user not found"));
            dept.setManagerId(manager);
        }

        departmentRepository.save(dept);
        return toResponse(dept);
    }

    @Transactional
    public void remove(String id) {
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

        if (dept.getManagerId() != null) {
            resp.setManagerId(Map.of(
                "_id", dept.getManagerId().getId(),
                "email", dept.getManagerId().getEmail(),
                "role", dept.getManagerId().getRole(),
                "name", dept.getManagerId().getName() != null ? dept.getManagerId().getName() : ""
            ));
        }
        return resp;
    }
}
