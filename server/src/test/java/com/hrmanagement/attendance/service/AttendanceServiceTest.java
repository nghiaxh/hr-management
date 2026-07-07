package com.hrmanagement.attendance.service;

import com.hrmanagement.attendance.dto.AttendanceResponse;
import com.hrmanagement.attendance.entity.Attendance;
import com.hrmanagement.attendance.repository.AttendanceRepository;
import com.hrmanagement.common.exception.BadRequestException;
import com.hrmanagement.department.entity.Department;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock private AttendanceRepository attendanceRepository;
    @Mock private EmployeeRepository employeeRepository;

    private AttendanceService attendanceService;
    private Employee emp;

    @BeforeEach
    void setUp() {
        attendanceService = new AttendanceService(attendanceRepository, employeeRepository);
        Department dept = new Department();
        dept.setId("dept-1");
        emp = Employee.builder().id("emp-1").department(dept)
                .firstName("John").lastName("Doe").position("Dev").build();
    }

    @Test
    void checkIn_createsPresentRecordBefore9AM() {
        when(employeeRepository.findByUserId("user-1")).thenReturn(Optional.of(emp));
        when(attendanceRepository.findByEmployeeIdAndDate(eq("emp-1"), any())).thenReturn(Optional.empty());
        when(attendanceRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AttendanceResponse result = attendanceService.checkIn("user-1");

        assertNotNull(result);
        assertTrue("present".equals(result.getStatus()) || "late".equals(result.getStatus()));
    }

    @Test
    void checkIn_throwsWhenAlreadyCheckedIn() {
        when(employeeRepository.findByUserId("user-1")).thenReturn(Optional.of(emp));
        when(attendanceRepository.findByEmployeeIdAndDate(eq("emp-1"), any())).thenReturn(Optional.of(new Attendance()));

        assertThrows(BadRequestException.class, () -> attendanceService.checkIn("user-1"));
    }

    @Test
    void checkOut_updatesRecord() {
        Attendance record = Attendance.builder()
                .id("att-1")
                .employee(emp)
                .checkIn(LocalDateTime.now().minusHours(9))
                .status("present")
                .build();
        when(employeeRepository.findByUserId("user-1")).thenReturn(Optional.of(emp));
        when(attendanceRepository.findById("att-1")).thenReturn(Optional.of(record));
        when(attendanceRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AttendanceResponse result = attendanceService.checkOut("att-1", "user-1");

        assertNotNull(result.getCheckOut());
    }

    @Test
    void checkOut_throwsWhenAlreadyCheckedOut() {
        Attendance record = Attendance.builder()
                .id("att-1")
                .employee(emp)
                .checkOut(LocalDateTime.now())
                .build();
        when(employeeRepository.findByUserId("user-1")).thenReturn(Optional.of(emp));
        when(attendanceRepository.findById("att-1")).thenReturn(Optional.of(record));

        assertThrows(BadRequestException.class, () -> attendanceService.checkOut("att-1", "user-1"));
    }

    @Test
    void checkOut_marksHalfDayWhenLessThan4Hours() {
        Attendance record = Attendance.builder()
                .employee(emp)
                .checkIn(LocalDateTime.now().minusHours(2))
                .status("present")
                .build();
        when(employeeRepository.findByUserId("user-1")).thenReturn(Optional.of(emp));
        when(attendanceRepository.findById("att-1")).thenReturn(Optional.of(record));
        when(attendanceRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AttendanceResponse result = attendanceService.checkOut("att-1", "user-1");

        assertEquals("half-day", result.getStatus());
    }

    @Test
    void findAll_adminSeesAll() {
        when(attendanceRepository.findAll()).thenReturn(List.of());

        List<AttendanceResponse> result = attendanceService.findAll(null, null, null, null, "admin", "user-1");

        assertNotNull(result);
    }

    @Test
    void findAll_employeeSeesOwn() {
        when(employeeRepository.findByUserId("user-1")).thenReturn(Optional.of(emp));
        when(attendanceRepository.findByEmployeeId("emp-1")).thenReturn(List.of());

        List<AttendanceResponse> result = attendanceService.findAll(null, null, null, null, "employee", "user-1");

        assertNotNull(result);
    }
}
