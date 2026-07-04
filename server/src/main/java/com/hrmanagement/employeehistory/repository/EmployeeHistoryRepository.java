package com.hrmanagement.employeehistory.repository;

import com.hrmanagement.employeehistory.entity.EmployeeHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeHistoryRepository extends JpaRepository<EmployeeHistory, String> {
    List<EmployeeHistory> findByEmployeeIdOrderByEffectiveDateDesc(String employeeId);
}
