package com.hrmanagement.attendance.repository;

import com.hrmanagement.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, String> {
    @Query("SELECT a FROM Attendance a WHERE a.employeeId.id = :employeeId AND a.date = :date")
    Optional<Attendance> findByEmployeeIdAndDate(@Param("employeeId") String employeeId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE a.employeeId.id = :employeeId AND a.date BETWEEN :from AND :to")
    List<Attendance> findByEmployeeIdAndDateBetween(@Param("employeeId") String employeeId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT a FROM Attendance a WHERE a.employeeId.id IN :employeeIds AND a.date BETWEEN :from AND :to")
    List<Attendance> findByEmployeeIdInAndDateBetween(@Param("employeeIds") List<String> employeeIds, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT a FROM Attendance a WHERE a.employeeId.id = :employeeId")
    List<Attendance> findByEmployeeId(@Param("employeeId") String employeeId);

    @Query("SELECT a FROM Attendance a WHERE a.employeeId.id IN :employeeIds AND a.date BETWEEN :from AND :to")
    List<Attendance> findByEmployeeIdsAndDateRange(@Param("employeeIds") List<String> employeeIds, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT a FROM Attendance a WHERE a.date BETWEEN :from AND :to")
    List<Attendance> findByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status IN :statuses")
    long countByDateAndStatusIn(@Param("date") LocalDate date, @Param("statuses") List<String> statuses);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.employeeId.id IN :employeeIds AND a.date = :date AND a.status IN :statuses")
    long countByEmployeeIdInAndDateAndStatusIn(@Param("employeeIds") List<String> employeeIds, @Param("date") LocalDate date, @Param("statuses") List<String> statuses);
}
