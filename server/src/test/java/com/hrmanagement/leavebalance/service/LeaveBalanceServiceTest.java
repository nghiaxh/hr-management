package com.hrmanagement.leavebalance.service;

import com.hrmanagement.common.exception.BadRequestException;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import com.hrmanagement.leavebalance.entity.LeaveBalance;
import com.hrmanagement.leavebalance.repository.LeaveBalanceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveBalanceServiceTest {

    @Mock private LeaveBalanceRepository leaveBalanceRepository;
    @Mock private EmployeeRepository employeeRepository;

    private LeaveBalanceService leaveBalanceService;
    private LeaveBalance balance;
    private Employee emp;

    @BeforeEach
    void setUp() {
        leaveBalanceService = new LeaveBalanceService(leaveBalanceRepository, employeeRepository);
        emp = Employee.builder().id("emp-1").build();
        balance = LeaveBalance.builder()
                .id("lb-1").employee(emp)
                .annualTotal(12).annualUsed(0)
                .sickTotal(30).sickUsed(0)
                .personalTotal(5).personalUsed(0)
                .build();
    }

    @Test
    void deduct_annualLeave() {
        when(leaveBalanceRepository.findByEmployeeId("emp-1")).thenReturn(Optional.of(balance));
        when(leaveBalanceRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        leaveBalanceService.deduct("emp-1", "annual", 3);

        assertEquals(3, balance.getAnnualUsed());
        verify(leaveBalanceRepository).save(balance);
    }

    @Test
    void deduct_sickLeave() {
        when(leaveBalanceRepository.findByEmployeeId("emp-1")).thenReturn(Optional.of(balance));
        when(leaveBalanceRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        leaveBalanceService.deduct("emp-1", "sick", 2);

        assertEquals(2, balance.getSickUsed());
    }

    @Test
    void deduct_personalLeave() {
        when(leaveBalanceRepository.findByEmployeeId("emp-1")).thenReturn(Optional.of(balance));
        when(leaveBalanceRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        leaveBalanceService.deduct("emp-1", "personal", 1);

        assertEquals(1, balance.getPersonalUsed());
    }

    @Test
    void deduct_throwsOnInsufficientAnnual() {
        balance.setAnnualUsed(11);
        when(leaveBalanceRepository.findByEmployeeId("emp-1")).thenReturn(Optional.of(balance));

        assertThrows(BadRequestException.class,
                () -> leaveBalanceService.deduct("emp-1", "annual", 5));
    }

    @Test
    void deduct_throwsOnInsufficientSick() {
        balance.setSickUsed(29);
        when(leaveBalanceRepository.findByEmployeeId("emp-1")).thenReturn(Optional.of(balance));

        assertThrows(BadRequestException.class,
                () -> leaveBalanceService.deduct("emp-1", "sick", 5));
    }

    @Test
    void deduct_throwsOnInvalidType() {
        when(leaveBalanceRepository.findByEmployeeId("emp-1")).thenReturn(Optional.of(balance));

        assertThrows(BadRequestException.class,
                () -> leaveBalanceService.deduct("emp-1", "invalid", 1));
    }

    @Test
    void deduct_autoCreatesBalanceWhenMissing() {
        when(leaveBalanceRepository.findByEmployeeId("emp-1")).thenReturn(Optional.empty());
        when(employeeRepository.findById("emp-1")).thenReturn(Optional.of(emp));
        when(leaveBalanceRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        leaveBalanceService.deduct("emp-1", "annual", 1);

        verify(leaveBalanceRepository).save(any(LeaveBalance.class));
    }

    @Test
    void findByEmployee_returnsExisting() {
        when(leaveBalanceRepository.findByEmployeeId("emp-1")).thenReturn(Optional.of(balance));

        var result = leaveBalanceService.findByEmployee("emp-1");

        assertEquals(12, result.getAnnualTotal());
    }

    @Test
    void findByEmployee_createsNewIfMissing() {
        when(leaveBalanceRepository.findByEmployeeId("emp-1")).thenReturn(Optional.empty());
        when(employeeRepository.findById("emp-1")).thenReturn(Optional.of(emp));
        when(leaveBalanceRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = leaveBalanceService.findByEmployee("emp-1");

        assertEquals(12, result.getAnnualTotal());
        assertEquals(30, result.getSickTotal());
        assertEquals(3, result.getPersonalTotal());
    }
}
