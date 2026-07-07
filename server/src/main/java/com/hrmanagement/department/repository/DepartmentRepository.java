package com.hrmanagement.department.repository;

import com.hrmanagement.department.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, String> {
    Page<Department> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
