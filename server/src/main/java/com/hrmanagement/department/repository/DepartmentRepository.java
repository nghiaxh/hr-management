package com.hrmanagement.department.repository;

import com.hrmanagement.department.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DepartmentRepository extends JpaRepository<Department, String> {
    Page<Department> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("SELECT COUNT(d) FROM Department d WHERE d.managerId.id = :managerId")
    long countByManagerId(@Param("managerId") String managerId);
}
