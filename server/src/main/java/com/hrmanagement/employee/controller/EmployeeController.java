package com.hrmanagement.employee.controller;

import com.hrmanagement.common.dto.PaginatedResponse;
import com.hrmanagement.common.util.SecurityUtil;
import com.hrmanagement.employee.dto.CreateEmployeeRequest;
import com.hrmanagement.employee.dto.EmployeeResponse;
import com.hrmanagement.employee.service.EmployeeService;
import com.hrmanagement.employeehistory.dto.CreateEmployeeHistoryRequest;
import com.hrmanagement.employeehistory.dto.EmployeeHistoryResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping("/{id}/documents")
    public ResponseEntity<EmployeeResponse> addDocument(@PathVariable String id,
                                                        @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(employeeService.addDocument(id, file));
    }

    @DeleteMapping("/{id}/documents/{docId}")
    public ResponseEntity<EmployeeResponse> removeDocument(@PathVariable String id,
                                                           @PathVariable String docId) {
        return ResponseEntity.ok(employeeService.removeDocument(id, docId));
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

    @GetMapping("/{id}/history")
    public ResponseEntity<List<EmployeeHistoryResponse>> getHistory(@PathVariable String id) {
        return ResponseEntity.ok(employeeService.getHistory(id));
    }

    @PostMapping("/{id}/history")
    public ResponseEntity<EmployeeHistoryResponse> addHistory(@PathVariable String id,
                                                              @Valid @RequestBody CreateEmployeeHistoryRequest dto) {
        return ResponseEntity.ok(employeeService.addHistory(id, dto));
    }
}
