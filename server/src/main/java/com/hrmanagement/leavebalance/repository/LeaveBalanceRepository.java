package com.hrmanagement.leavebalance.repository;

import com.hrmanagement.leavebalance.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, String> {
    Optional<LeaveBalance> findByEmployeeId(String employeeId);
    List<LeaveBalance> findByEmployeeIdIn(List<String> employeeIds);
}
