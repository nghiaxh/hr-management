package com.hrmanagement.department.controller;

import com.hrmanagement.common.dto.PaginatedResponse;
import com.hrmanagement.common.util.SecurityUtil;
import com.hrmanagement.department.dto.CreateDepartmentRequest;
import com.hrmanagement.department.dto.DepartmentResponse;
import com.hrmanagement.department.service.DepartmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<DepartmentResponse>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        String userId = SecurityUtil.getCurrentUserId();
        String role = SecurityUtil.getCurrentUserRole();
        return ResponseEntity.ok(departmentService.findAll(search, page, limit, role, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponse> findOne(@PathVariable String id) {
        return ResponseEntity.ok(departmentService.findOne(id));
    }

    @PostMapping
    public ResponseEntity<DepartmentResponse> create(@Valid @RequestBody CreateDepartmentRequest dto) {
        return ResponseEntity.ok(departmentService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartmentResponse> update(@PathVariable String id,
                                                     @Valid @RequestBody CreateDepartmentRequest dto) {
        return ResponseEntity.ok(departmentService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable String id) {
        departmentService.remove(id);
        return ResponseEntity.noContent().build();
    }
}
