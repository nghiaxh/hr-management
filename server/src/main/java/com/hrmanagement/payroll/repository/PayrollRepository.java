package com.hrmanagement.payroll.repository;

import com.hrmanagement.payroll.entity.Payroll;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, String> {
    Page<Payroll> findByEmployeeId(String employeeId, Pageable pageable);
    Page<Payroll> findByEmployeeIdIn(List<String> employeeIds, Pageable pageable);
    Page<Payroll> findByMonthAndYear(Integer month, Integer year, Pageable pageable);
    Page<Payroll> findByEmployeeIdInAndMonthAndYear(List<String> employeeIds, Integer month, Integer year, Pageable pageable);
    Page<Payroll> findByEmployeeIdInAndStatus(List<String> employeeIds, String status, Pageable pageable);
    Page<Payroll> findByStatus(String status, Pageable pageable);
    Optional<Payroll> findByEmployeeIdAndMonthAndYear(String employeeId, Integer month, Integer year);

    @Query("SELECT COALESCE(SUM(p.netPay), 0) FROM Payroll p WHERE p.month = :month AND p.year = :year AND p.status = 'paid'")
    java.math.BigDecimal sumNetPayByMonthAndYear(@Param("month") Integer month, @Param("year") Integer year);

    @Query("SELECT COALESCE(SUM(p.netPay), 0) FROM Payroll p WHERE p.employeeId.id IN :employeeIds AND p.month = :month AND p.year = :year AND p.status = 'paid'")
    java.math.BigDecimal sumNetPayByEmployeeIdsAndMonthAndYear(@Param("employeeIds") List<String> employeeIds, @Param("month") Integer month, @Param("year") Integer year);
}
