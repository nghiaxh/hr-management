package com.hrmanagement.payroll.service;

import com.hrmanagement.common.dto.PaginatedResponse;
import com.hrmanagement.common.policy.CurrentUserPolicy;
import com.hrmanagement.common.util.SecurityUtil;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import com.hrmanagement.payroll.dto.PayrollResponse;
import com.hrmanagement.payroll.dto.ProcessPayrollRequest;
import com.hrmanagement.payroll.entity.Payroll;
import com.hrmanagement.payroll.repository.PayrollRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PayrollServiceTest {

    @Mock private PayrollRepository payrollRepository;
    @Mock private EmployeeRepository employeeRepository;

    private PayrollService payrollService;
    private Employee emp;
    private Payroll payroll;

    @BeforeEach
    void setUp() {
        payrollService = new PayrollService(payrollRepository, employeeRepository,
                new CurrentUserPolicy(employeeRepository));
        emp = Employee.builder().id("emp-1").salary(new BigDecimal("15000000"))
                .firstName("Jane").lastName("Doe").position("Engineer").build();
        payroll = Payroll.builder()
                .id("pay-1").employee(emp).month(6).year(2025)
                .basicSalary(new BigDecimal("15000000"))
                .netPay(new BigDecimal("13275000"))
                .status("draft")
                .build();
    }

    @Test
    void calculatePIT_zeroForNoIncome() {
        BigDecimal result = PayrollService.calculatePIT(BigDecimal.ZERO);
        assertEquals(BigDecimal.ZERO, result);
    }

    @Test
    void calculatePIT_negativeReturnsZero() {
        BigDecimal result = PayrollService.calculatePIT(new BigDecimal("-1000"));
        assertEquals(BigDecimal.ZERO, result);
    }

    @Test
    void calculatePIT_bracket1() {
        // 5% on first 5M
        BigDecimal result = PayrollService.calculatePIT(new BigDecimal("5000000"));
        assertEquals(new BigDecimal("250000"), result);
    }

    @Test
    void calculatePIT_bracket2() {
        // 5% on first 5M (250k) + 10% on next 5M (500k) = 750k
        BigDecimal result = PayrollService.calculatePIT(new BigDecimal("10000000"));
        assertEquals(new BigDecimal("750000"), result);
    }

    @Test
    void calculatePIT_bracket3() {
        // 5% on 5M (250k) + 10% on 5M (500k) + 20% on 8M (1.6M) = 2.35M
        BigDecimal result = PayrollService.calculatePIT(new BigDecimal("18000000"));
        assertEquals(new BigDecimal("2350000"), result);
    }

    @Test
    void calculateDeductions_correctlyComputesAll() {
        var deductions = payrollService.calculateDeductions(new BigDecimal("15000000"));

        // BHXH = 15M * 0.08 = 1.2M
        assertEquals(new BigDecimal("1200000"), deductions.socialInsurance());
        // BHYT = 15M * 0.015 = 225k
        assertEquals(new BigDecimal("225000"), deductions.healthInsurance());
        // BHTN = 15M * 0.01 = 150k
        assertEquals(new BigDecimal("150000"), deductions.unemploymentInsurance());
        // Công đoàn = 15M * 0.01 = 150k
        assertEquals(new BigDecimal("150000"), deductions.unionDues());
        // Total insurance = 1.2M + 225k + 150k + 150k = 1.725M
        // Taxable = 15M - 15.5M - 1.725M = negative -> PIT = 0
        assertEquals(BigDecimal.ZERO, deductions.pit());
        assertEquals(new BigDecimal("1725000"), deductions.totalDeductions());
    }

    @Test
    void process_createsPayrollRecords() {
        SecurityUtil.setTestRoles("admin");
        when(employeeRepository.findById("emp-1")).thenReturn(Optional.of(emp));
        when(payrollRepository.findByEmployeeIdAndMonthAndYear("emp-1", 7, 2025)).thenReturn(Optional.empty());
        when(payrollRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        List<PayrollResponse> results = payrollService.process(
                new ProcessPayrollRequest(List.of("emp-1"), 7, 2025));

        assertEquals(1, results.size());
        assertEquals("draft", results.getFirst().getStatus());
        SecurityUtil.clearTestRoles();
    }

    @Test
    void process_skipsExistingPayroll() {
        SecurityUtil.setTestRoles("admin");
        when(employeeRepository.findById("emp-1")).thenReturn(Optional.of(emp));
        when(payrollRepository.findByEmployeeIdAndMonthAndYear("emp-1", 7, 2025))
                .thenReturn(Optional.of(payroll));

        List<PayrollResponse> results = payrollService.process(
                new ProcessPayrollRequest(List.of("emp-1"), 7, 2025));

        assertTrue(results.isEmpty());
        verify(payrollRepository, never()).save(any());
        SecurityUtil.clearTestRoles();
    }

    @Test
    void pay_marksAsPaid() {
        SecurityUtil.setTestRoles("admin");
        when(payrollRepository.findById("pay-1")).thenReturn(Optional.of(payroll));
        when(payrollRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        PayrollResponse result = payrollService.pay("pay-1");

        assertEquals("paid", result.getStatus());
        assertNotNull(result.getPaidAt());
        SecurityUtil.clearTestRoles();
    }

    @Test
    void findAll_employeeSeesOwnPayroll() {
        when(employeeRepository.findByUserId("user-1")).thenReturn(Optional.of(emp));
        Page<Payroll> page = new PageImpl<>(List.of(payroll));
        when(payrollRepository.findByEmployeeId(eq("emp-1"), any(PageRequest.class))).thenReturn(page);

        PaginatedResponse<PayrollResponse> result = payrollService.findAll(null, null, null, null, 1, 10, "employee", "user-1");

        assertEquals(1, result.getData().size());
    }
}
