package com.hrmanagement.leave.repository;

import com.hrmanagement.leave.entity.Leave;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRepository extends JpaRepository<Leave, String> {
    Page<Leave> findByEmployeeId(String employeeId, Pageable pageable);
    Page<Leave> findByEmployeeIdIn(List<String> employeeIds, Pageable pageable);
    Page<Leave> findByStatus(String status, Pageable pageable);
    Page<Leave> findByEmployeeIdAndStatus(String employeeId, String status, Pageable pageable);
    Page<Leave> findByEmployeeIdInAndStatus(List<String> employeeIds, String status, Pageable pageable);
    Page<Leave> findByEmployeeIdInAndType(List<String> employeeIds, String type, Pageable pageable);
    Page<Leave> findByType(String type, Pageable pageable);

    @Query("SELECT l FROM Leave l WHERE l.employeeId.id = :employeeId AND l.status IN ('pending','approved') AND l.startDate <= :endDate AND l.endDate >= :startDate")
    List<Leave> findOverlapping(@Param("employeeId") String employeeId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    long countByStatus(String status);

    @Query("SELECT l FROM Leave l WHERE l.status IN ('pending','approved') AND l.startDate <= :endDate AND l.endDate >= :startDate")
    List<Leave> findOverlappingGlobal(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
