package com.hrmanagement.attendance.repository;

import com.hrmanagement.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, String> {
    Optional<Attendance> findByEmployeeIdAndDate(String employeeId, LocalDate date);
    List<Attendance> findByEmployeeIdAndDateBetween(String employeeId, LocalDate from, LocalDate to);
    List<Attendance> findByEmployeeIdInAndDateBetween(List<String> employeeIds, LocalDate from, LocalDate to);
    List<Attendance> findByEmployeeId(String employeeId);

    @Query("SELECT a FROM Attendance a WHERE a.employeeId.id IN :employeeIds AND a.date BETWEEN :from AND :to")
    List<Attendance> findByEmployeeIdsAndDateRange(@Param("employeeIds") List<String> employeeIds, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT a FROM Attendance a WHERE a.date BETWEEN :from AND :to")
    List<Attendance> findByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    long countByDateAndStatusIn(LocalDate date, List<String> statuses);
    long countByEmployeeIdInAndDateAndStatusIn(List<String> employeeIds, LocalDate date, List<String> statuses);
}
