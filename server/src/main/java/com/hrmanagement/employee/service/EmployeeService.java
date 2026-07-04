package com.hrmanagement.employee.service;

import com.hrmanagement.common.dto.PaginatedResponse;
import com.hrmanagement.common.exception.BadRequestException;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.department.entity.Department;
import com.hrmanagement.department.repository.DepartmentRepository;
import com.hrmanagement.employee.dto.CreateEmployeeRequest;
import com.hrmanagement.employee.dto.EmployeeResponse;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.entity.EmployeeDocument;
import com.hrmanagement.employee.repository.EmployeeRepository;
import com.hrmanagement.employeehistory.dto.CreateEmployeeHistoryRequest;
import com.hrmanagement.employeehistory.dto.EmployeeHistoryResponse;
import com.hrmanagement.employeehistory.service.EmployeeHistoryService;
import com.hrmanagement.auth.entity.User;
import com.hrmanagement.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final EmployeeHistoryService employeeHistoryService;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           UserRepository userRepository,
                           EmployeeHistoryService employeeHistoryService) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.employeeHistoryService = employeeHistoryService;
    }

    public PaginatedResponse<EmployeeResponse> findAll(String search, String departmentId, int page, int limit, String userRole, String userId) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Employee> empPage;

        String effectiveDeptId = departmentId;
        if ("manager".equals(userRole)) {
            var mgrEmp = employeeRepository.findByUserId(userId);
            if (mgrEmp.isPresent() && mgrEmp.get().getDepartmentId() != null) {
                effectiveDeptId = mgrEmp.get().getDepartmentId().getId();
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
            if (emp.getUserId() == null || !emp.getUserId().getId().equals(userId)) {
                throw new NotFoundException("Employee not found");
            }
        }

        return toResponse(emp);
    }

    @Transactional
    public EmployeeResponse create(CreateEmployeeRequest dto) {
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

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new NotFoundException("User not found"));
            emp.setUserId(user);
        }

        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new NotFoundException("Department not found"));
        emp.setDepartmentId(dept);

        employeeRepository.save(emp);
        return toResponse(emp);
    }

    @Transactional
    public EmployeeResponse update(String id, CreateEmployeeRequest dto) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found"));

        if (dto.getFirstName() != null) emp.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) emp.setLastName(dto.getLastName());
        if (dto.getPosition() != null) emp.setPosition(dto.getPosition());
        if (dto.getSalary() != null) emp.setSalary(dto.getSalary());
        if (dto.getHireDate() != null) emp.setHireDate(dto.getHireDate());
        if (dto.getPhone() != null) emp.setPhone(dto.getPhone());
        if (dto.getContractType() != null) emp.setContractType(dto.getContractType());
        if (dto.getContractExpiry() != null) emp.setContractExpiry(dto.getContractExpiry());

        if (dto.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new NotFoundException("Department not found"));
            emp.setDepartmentId(dept);
        }

        employeeRepository.save(emp);
        return toResponse(emp);
    }

    @Transactional
    public void remove(String id) {
        if (!employeeRepository.existsById(id)) {
            throw new NotFoundException("Employee not found");
        }
        employeeRepository.deleteById(id);
    }

    @Transactional
    public Map<String, Object> bulkDelete(List<String> ids) {
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
            if (mgrEmp.isPresent() && mgrEmp.get().getDepartmentId() != null) {
                effectiveDeptId = mgrEmp.get().getDepartmentId().getId();
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
            String deptName = e.getDepartmentId() != null ? e.getDepartmentId().getName() : "";
            String email = e.getUserId() != null ? e.getUserId().getEmail() : "";
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

    public EmployeeResponse addDocument(String id, MultipartFile file) throws IOException {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found"));

        EmployeeDocument doc = EmployeeDocument.builder()
                .employee(emp)
                .name(file.getOriginalFilename())
                .url("/uploads/" + file.getOriginalFilename())
                .type(file.getContentType())
                .build();
        emp.getDocuments().add(doc);
        employeeRepository.save(emp);
        return toResponse(emp);
    }

    @Transactional
    public EmployeeResponse removeDocument(String id, String docId) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found"));
        emp.getDocuments().removeIf(d -> d.getId().equals(docId));
        employeeRepository.save(emp);
        return toResponse(emp);
    }

    public Employee findByUserId(String userId) {
        return employeeRepository.findByUserId(userId).orElse(null);
    }

    public List<EmployeeHistoryResponse> getHistory(String employeeId) {
        return employeeHistoryService.findByEmployee(employeeId);
    }

    public EmployeeHistoryResponse addHistory(String employeeId, CreateEmployeeHistoryRequest dto) {
        return employeeHistoryService.create(employeeId, dto);
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

        if (emp.getUserId() != null) {
            resp.setUserId(Map.of(
                    "_id", emp.getUserId().getId(),
                    "email", emp.getUserId().getEmail(),
                    "role", emp.getUserId().getRole(),
                    "name", emp.getUserId().getName() != null ? emp.getUserId().getName() : ""
            ));
        }

        if (emp.getDepartmentId() != null) {
            resp.setDepartmentId(Map.of(
                    "_id", emp.getDepartmentId().getId(),
                    "name", emp.getDepartmentId().getName()
            ));
        }

        if (emp.getDocuments() != null) {
            var docs = emp.getDocuments().stream().map(d ->
                    new EmployeeResponse.DocumentDto(d.getId(), d.getName(), d.getUrl(), d.getType(), d.getUploadedAt())
            ).toList();
            resp.setDocuments(docs);
        } else {
            resp.setDocuments(List.of());
        }

        return resp;
    }
}
