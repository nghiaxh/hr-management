package com.hrmanagement.payroll.service;

import com.hrmanagement.common.dto.PaginatedResponse;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.common.policy.CurrentUserPolicy;
import com.hrmanagement.common.util.SecurityUtil;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import com.hrmanagement.payroll.dto.PayrollEmployeeSummary;
import com.hrmanagement.payroll.dto.PayrollResponse;
import com.hrmanagement.payroll.dto.ProcessPayrollRequest;
import com.hrmanagement.payroll.entity.Payroll;
import com.hrmanagement.payroll.repository.PayrollRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final CurrentUserPolicy currentUserPolicy;

    public PayrollService(PayrollRepository payrollRepository, EmployeeRepository employeeRepository,
                          CurrentUserPolicy currentUserPolicy) {
        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
        this.currentUserPolicy = currentUserPolicy;
    }

    public PaginatedResponse<PayrollResponse> findAll(Integer month, Integer year, String employeeId,
                                                       String status, int page, int limit,
                                                       String userRole, String userId) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "year", "month"));
        Page<Payroll> payrollPage;

        if ("employee".equals(userRole)) {
            Optional<Employee> emp = currentUserPolicy.currentEmployee(userId);
            if (emp.isEmpty()) return PaginatedResponse.of(List.of(), page, limit, 0);
            payrollPage = payrollRepository.findByEmployeeId(emp.get().getId(), pageRequest);
        } else if ("manager".equals(userRole)) {
            List<String> deptEmpIds = currentUserPolicy.departmentEmployeeIds(userId);
            if (deptEmpIds.isEmpty()) {
                return PaginatedResponse.of(List.of(), page, limit, 0);
            }
            payrollPage = payrollRepository.findByEmployeeIdIn(deptEmpIds, pageRequest);
        } else {
            if (employeeId != null && !employeeId.isBlank()) {
                payrollPage = payrollRepository.findByEmployeeId(employeeId, pageRequest);
            } else if (month != null && year != null) {
                payrollPage = payrollRepository.findByMonthAndYear(month, year, pageRequest);
            } else if (status != null && !status.isBlank()) {
                payrollPage = payrollRepository.findByStatus(status, pageRequest);
            } else {
                payrollPage = payrollRepository.findAll(pageRequest);
            }
        }

        var responses = payrollPage.getContent().stream().map(this::toResponse).toList();
        return PaginatedResponse.of(responses, page, limit, payrollPage.getTotalElements());
    }

    private static final BigDecimal PERSONAL_DEDUCTION = new BigDecimal("15500000");
    private static final BigDecimal BHXH_RATE = new BigDecimal("0.08");
    private static final BigDecimal BHYT_RATE = new BigDecimal("0.015");
    private static final BigDecimal BHTN_RATE = new BigDecimal("0.01");
    private static final BigDecimal CONG_DOAN_RATE = new BigDecimal("0.01");

    private static final BigDecimal[] PIT_BRACKET_LIMITS = {
        new BigDecimal("5000000"), new BigDecimal("10000000"),
        new BigDecimal("18000000"), new BigDecimal("32000000"),
        BigDecimal.valueOf(Long.MAX_VALUE)
    };
    private static final BigDecimal[] PIT_BRACKET_RATES = {
        new BigDecimal("0.05"), new BigDecimal("0.10"),
        new BigDecimal("0.20"), new BigDecimal("0.30"),
        new BigDecimal("0.35")
    };

    static BigDecimal calculatePIT(BigDecimal taxableIncome) {
        if (taxableIncome.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        BigDecimal remaining = taxableIncome;
        BigDecimal prev = BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;
        for (int i = 0; i < PIT_BRACKET_LIMITS.length; i++) {
            BigDecimal bracket = PIT_BRACKET_LIMITS[i].subtract(prev);
            if (remaining.compareTo(bracket) <= 0) {
                total = total.add(remaining.multiply(PIT_BRACKET_RATES[i]));
                break;
            }
            total = total.add(bracket.multiply(PIT_BRACKET_RATES[i]));
            remaining = remaining.subtract(bracket);
            prev = PIT_BRACKET_LIMITS[i];
        }
        return total.setScale(0, RoundingMode.DOWN);
    }

    record Deductions(BigDecimal socialInsurance, BigDecimal healthInsurance,
                      BigDecimal unemploymentInsurance, BigDecimal unionDues,
                      BigDecimal pit, BigDecimal totalDeductions) {}

    Deductions calculateDeductions(BigDecimal salary) {
        BigDecimal si = salary.multiply(BHXH_RATE).setScale(0, RoundingMode.DOWN);
        BigDecimal hi = salary.multiply(BHYT_RATE).setScale(0, RoundingMode.DOWN);
        BigDecimal ui = salary.multiply(BHTN_RATE).setScale(0, RoundingMode.DOWN);
        BigDecimal cd = salary.multiply(CONG_DOAN_RATE).setScale(0, RoundingMode.DOWN);
        BigDecimal totalInsurance = si.add(hi).add(ui).add(cd);
        BigDecimal taxableIncome = salary.subtract(PERSONAL_DEDUCTION).subtract(totalInsurance);
        BigDecimal pit = calculatePIT(taxableIncome);
        BigDecimal totalDeductions = totalInsurance.add(pit);
        return new Deductions(si, hi, ui, cd, pit, totalDeductions);
    }

    @Transactional
    public List<PayrollResponse> process(ProcessPayrollRequest dto) {
        SecurityUtil.requireRoles("admin");
        List<PayrollResponse> results = new ArrayList<>();
        for (String empId : dto.getEmployeeIds()) {
            Employee emp = employeeRepository.findById(empId)
                    .orElseThrow(() -> new NotFoundException("Employee not found: " + empId));

            Optional<Payroll> existing = payrollRepository.findByEmployeeIdAndMonthAndYear(empId, dto.getMonth(), dto.getYear());
            if (existing.isPresent()) continue;

            BigDecimal salary = emp.getSalary();
            Deductions d = calculateDeductions(salary);
            BigDecimal netPay = salary.subtract(d.totalDeductions);

            Payroll payroll = Payroll.builder()
                    .employee(emp)
                    .month(dto.getMonth())
                    .year(dto.getYear())
                    .basicSalary(salary)
                    .bonus(BigDecimal.ZERO)
                    .socialInsurance(d.socialInsurance)
                    .healthInsurance(d.healthInsurance)
                    .unemploymentInsurance(d.unemploymentInsurance)
                    .unionDues(d.unionDues)
                    .pit(d.pit)
                    .totalDeductions(d.totalDeductions)
                    .netPay(netPay)
                    .status("draft")
                    .build();
            payrollRepository.save(payroll);
            results.add(toResponse(payroll));
        }
        return results;
    }

    @Transactional
    public PayrollResponse pay(String id) {
        SecurityUtil.requireRoles("admin");
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Payroll not found"));
        payroll.setStatus("paid");
        payroll.setPaidAt(Instant.now());
        payrollRepository.save(payroll);
        return toResponse(payroll);
    }

    private PayrollResponse toResponse(Payroll p) {
        PayrollResponse resp = new PayrollResponse();
        resp.setId(p.getId());
        resp.setMonth(p.getMonth());
        resp.setYear(p.getYear());
        resp.setBasicSalary(p.getBasicSalary());
        resp.setBonus(p.getBonus());
        resp.setSocialInsurance(p.getSocialInsurance());
        resp.setHealthInsurance(p.getHealthInsurance());
        resp.setUnemploymentInsurance(p.getUnemploymentInsurance());
        resp.setUnionDues(p.getUnionDues());
        resp.setPit(p.getPit());
        resp.setTotalDeductions(p.getTotalDeductions());
        resp.setNetPay(p.getNetPay());
        resp.setStatus(p.getStatus());
        resp.setPaidAt(p.getPaidAt());
        resp.setCreatedAt(p.getCreatedAt());

        if (p.getEmployee() != null) {
            Employee emp = p.getEmployee();
            resp.setEmployeeId(new PayrollEmployeeSummary(emp.getId(), emp.getFirstName(), emp.getLastName(),
                    emp.getPosition(), emp.getSalary()));
        }
        return resp;
    }
}
