package com.hrmanagement.employee.controller;

import com.hrmanagement.common.dto.PaginatedResponse;
import com.hrmanagement.common.util.SecurityUtil;
import com.hrmanagement.employee.dto.CreateEmployeeRequest;
import com.hrmanagement.employee.dto.EmployeeResponse;
import com.hrmanagement.employee.service.EmployeeService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<EmployeeResponse>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String departmentId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        String userId = SecurityUtil.getCurrentUserId();
        String role = SecurityUtil.getCurrentUserRole();
        return ResponseEntity.ok(employeeService.findAll(search, departmentId, page, limit, role, userId));
    }

    @GetMapping("/me")
    public ResponseEntity<EmployeeResponse> getMyEmployee() {
        String userId = SecurityUtil.getCurrentUserId();
        EmployeeResponse emp = employeeService.getMyEmployee(userId);
        if (emp == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(emp);
    }

    @GetMapping("/export")
    public void exportCsv(HttpServletResponse response) throws IOException {
        String userId = SecurityUtil.getCurrentUserId();
        String role = SecurityUtil.getCurrentUserRole();
        employeeService.exportCsv(role, userId, response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> findOne(@PathVariable String id) {
        String userId = SecurityUtil.getCurrentUserId();
        String role = SecurityUtil.getCurrentUserRole();
        return ResponseEntity.ok(employeeService.findOne(id, role, userId));
    }

    @PostMapping
    public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody CreateEmployeeRequest dto) {
        return ResponseEntity.ok(employeeService.create(dto));
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<Map<String, Object>> bulkDelete(@RequestBody Map<String, List<String>> body) {
        return ResponseEntity.ok(employeeService.bulkDelete(body.get("ids")));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> update(@PathVariable String id,
                                                    @Valid @RequestBody CreateEmployeeRequest dto) {
        return ResponseEntity.ok(employeeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable String id) {
        employeeService.remove(id);
        return ResponseEntity.noContent().build();
    }
}
