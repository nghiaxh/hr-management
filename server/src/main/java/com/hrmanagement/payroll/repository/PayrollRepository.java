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
    @Query("SELECT p FROM Payroll p WHERE p.employee.id = :employeeId")
    Page<Payroll> findByEmployeeId(@Param("employeeId") String employeeId, Pageable pageable);

    @Query("SELECT p FROM Payroll p WHERE p.employee.id IN :employeeIds")
    Page<Payroll> findByEmployeeIdIn(@Param("employeeIds") List<String> employeeIds, Pageable pageable);

    Page<Payroll> findByMonthAndYear(Integer month, Integer year, Pageable pageable);

    Page<Payroll> findByStatus(String status, Pageable pageable);

    @Query("SELECT p FROM Payroll p WHERE p.employee.id = :employeeId AND p.month = :month AND p.year = :year")
    Optional<Payroll> findByEmployeeIdAndMonthAndYear(@Param("employeeId") String employeeId, @Param("month") Integer month, @Param("year") Integer year);
}
