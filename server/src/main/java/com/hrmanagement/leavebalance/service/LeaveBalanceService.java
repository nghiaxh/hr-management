package com.hrmanagement.leavebalance.service;

import com.hrmanagement.common.exception.BadRequestException;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import com.hrmanagement.leavebalance.dto.LeaveBalanceResponse;
import com.hrmanagement.leavebalance.entity.LeaveBalance;
import com.hrmanagement.leavebalance.repository.LeaveBalanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class LeaveBalanceService {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveBalanceService(LeaveBalanceRepository leaveBalanceRepository,
                               EmployeeRepository employeeRepository) {
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.employeeRepository = employeeRepository;
    }

    public LeaveBalanceResponse findByEmployee(String employeeId) {
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeId(employeeId)
                .orElseGet(() -> {
                    Employee emp = employeeRepository.findById(employeeId)
                            .orElseThrow(() -> new NotFoundException("Employee not found"));
                    LeaveBalance newBalance = LeaveBalance.builder()
                            .employeeId(emp)
                            .build();
                    return leaveBalanceRepository.save(newBalance);
                });
        return toResponse(balance);
    }

    @Transactional
    public void deduct(String employeeId, String type, long days) {
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new NotFoundException("Leave balance not found"));

        switch (type) {
            case "annual" -> {
                if (balance.getAnnualUsed() + days > balance.getAnnualTotal()) {
                    throw new BadRequestException("Insufficient annual leave balance");
                }
                balance.setAnnualUsed(balance.getAnnualUsed() + (int) days);
            }
            case "sick" -> {
                if (balance.getSickUsed() + days > balance.getSickTotal()) {
                    throw new BadRequestException("Insufficient sick leave balance");
                }
                balance.setSickUsed(balance.getSickUsed() + (int) days);
            }
            case "personal" -> {
                if (balance.getPersonalUsed() + days > balance.getPersonalTotal()) {
                    throw new BadRequestException("Insufficient personal leave balance");
                }
                balance.setPersonalUsed(balance.getPersonalUsed() + (int) days);
            }
            default -> throw new BadRequestException("Invalid leave type");
        }

        leaveBalanceRepository.save(balance);
    }

    private LeaveBalanceResponse toResponse(LeaveBalance b) {
        return new LeaveBalanceResponse(
                b.getId(), b.getEmployeeId().getId(),
                b.getAnnualTotal(), b.getAnnualUsed(),
                b.getSickTotal(), b.getSickUsed(),
                b.getPersonalTotal(), b.getPersonalUsed()
        );
    }
}
