package com.hrmanagement.leavebalance.repository;

import com.hrmanagement.leavebalance.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, String> {
    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.employeeId.id = :employeeId")
    Optional<LeaveBalance> findByEmployeeId(@Param("employeeId") String employeeId);

    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.employeeId.id IN :employeeIds")
    List<LeaveBalance> findByEmployeeIdIn(@Param("employeeIds") List<String> employeeIds);
}
