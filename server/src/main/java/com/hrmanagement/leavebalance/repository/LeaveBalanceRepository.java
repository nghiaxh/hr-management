package com.hrmanagement.leavebalance.repository;

import com.hrmanagement.leavebalance.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, String> {
    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.employee.id = :employeeId")
    Optional<LeaveBalance> findByEmployeeId(@Param("employeeId") String employeeId);
}
