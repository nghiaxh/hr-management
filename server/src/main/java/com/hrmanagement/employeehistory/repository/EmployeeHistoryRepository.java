package com.hrmanagement.employeehistory.repository;

import com.hrmanagement.employeehistory.entity.EmployeeHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EmployeeHistoryRepository extends JpaRepository<EmployeeHistory, String> {
    @Query("SELECT h FROM EmployeeHistory h WHERE h.employeeId.id = :employeeId ORDER BY h.effectiveDate DESC")
    List<EmployeeHistory> findByEmployeeIdOrderByEffectiveDateDesc(@Param("employeeId") String employeeId);
}
