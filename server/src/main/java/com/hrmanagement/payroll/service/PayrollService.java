package com.hrmanagement.payroll.service;

import com.hrmanagement.common.dto.PaginatedResponse;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
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
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;

    public PayrollService(PayrollRepository payrollRepository, EmployeeRepository employeeRepository) {
        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
    }

    public PaginatedResponse<PayrollResponse> findAll(Integer month, Integer year, String employeeId,
                                                       String status, int page, int limit,
                                                       String userRole, String userId) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "year", "month"));
        Page<Payroll> payrollPage;

        if ("employee".equals(userRole)) {
            Optional<Employee> emp = employeeRepository.findByUserId(userId);
            if (emp.isEmpty()) return PaginatedResponse.of(List.of(), page, limit, 0);
            payrollPage = payrollRepository.findByEmployeeId(emp.get().getId(), pageRequest);
        } else if ("manager".equals(userRole)) {
            Optional<Employee> mgrEmp = employeeRepository.findByUserId(userId);
            if (mgrEmp.isEmpty() || mgrEmp.get().getDepartmentId() == null) {
                return PaginatedResponse.of(List.of(), page, limit, 0);
            }
            List<String> deptEmpIds = employeeRepository.findByDepartmentId(mgrEmp.get().getDepartmentId().getId())
                    .stream().map(Employee::getId).toList();
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

    @Transactional
    public List<PayrollResponse> process(ProcessPayrollRequest dto) {
        List<PayrollResponse> results = new ArrayList<>();
        for (String empId : dto.getEmployeeIds()) {
            Employee emp = employeeRepository.findById(empId)
                    .orElseThrow(() -> new NotFoundException("Employee not found: " + empId));

            Optional<Payroll> existing = payrollRepository.findByEmployeeIdAndMonthAndYear(empId, dto.getMonth(), dto.getYear());
            if (existing.isPresent()) continue;

            double bonus = dto.getBonuses() != null ? dto.getBonuses().getOrDefault(empId, 0.0) : 0;
            double deductions = dto.getDeductions() != null ? dto.getDeductions().getOrDefault(empId, 0.0) : 0;
            double netPay = emp.getSalary().doubleValue() + bonus - deductions;

            Payroll payroll = Payroll.builder()
                    .employeeId(emp)
                    .month(dto.getMonth())
                    .year(dto.getYear())
                    .basicSalary(emp.getSalary())
                    .bonus(BigDecimal.valueOf(bonus))
                    .deductions(BigDecimal.valueOf(deductions))
                    .netPay(BigDecimal.valueOf(Math.max(0, netPay)))
                    .status("draft")
                    .build();
            payrollRepository.save(payroll);
            results.add(toResponse(payroll));
        }
        return results;
    }

    @Transactional
    public PayrollResponse pay(String id) {
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
        resp.setDeductions(p.getDeductions());
        resp.setNetPay(p.getNetPay());
        resp.setStatus(p.getStatus());
        resp.setPaidAt(p.getPaidAt());
        resp.setCreatedAt(p.getCreatedAt());

        if (p.getEmployeeId() != null) {
            Employee emp = p.getEmployeeId();
            resp.setEmployeeId(java.util.Map.of(
                    "_id", emp.getId(),
                    "firstName", emp.getFirstName(),
                    "lastName", emp.getLastName(),
                    "position", emp.getPosition(),
                    "salary", emp.getSalary()
            ));
        }
        return resp;
    }
}
