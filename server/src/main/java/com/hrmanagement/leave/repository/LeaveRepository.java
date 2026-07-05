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
    @Query("SELECT l FROM Leave l WHERE l.employeeId.id = :employeeId")
    Page<Leave> findByEmployeeId(@Param("employeeId") String employeeId, Pageable pageable);

    @Query("SELECT l FROM Leave l WHERE l.employeeId.id IN :employeeIds")
    Page<Leave> findByEmployeeIdIn(@Param("employeeIds") List<String> employeeIds, Pageable pageable);

    Page<Leave> findByStatus(String status, Pageable pageable);

    @Query("SELECT l FROM Leave l WHERE l.employeeId.id = :employeeId AND l.status = :status")
    Page<Leave> findByEmployeeIdAndStatus(@Param("employeeId") String employeeId, @Param("status") String status, Pageable pageable);

    @Query("SELECT l FROM Leave l WHERE l.employeeId.id IN :employeeIds AND l.status = :status")
    Page<Leave> findByEmployeeIdInAndStatus(@Param("employeeIds") List<String> employeeIds, @Param("status") String status, Pageable pageable);

    @Query("SELECT l FROM Leave l WHERE l.employeeId.id IN :employeeIds AND l.type = :type")
    Page<Leave> findByEmployeeIdInAndType(@Param("employeeIds") List<String> employeeIds, @Param("type") String type, Pageable pageable);

    Page<Leave> findByType(String type, Pageable pageable);

    @Query("SELECT l FROM Leave l WHERE l.employeeId.id = :employeeId AND l.status IN ('pending','approved') AND l.startDate <= :endDate AND l.endDate >= :startDate")
    List<Leave> findOverlapping(@Param("employeeId") String employeeId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    long countByStatus(String status);

    @Query("SELECT l FROM Leave l WHERE l.status IN ('pending','approved') AND l.startDate <= :endDate AND l.endDate >= :startDate")
    List<Leave> findOverlappingGlobal(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
