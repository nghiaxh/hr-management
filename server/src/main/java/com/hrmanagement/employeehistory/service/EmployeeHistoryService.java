package com.hrmanagement.employeehistory.service;

import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.employeehistory.dto.CreateEmployeeHistoryRequest;
import com.hrmanagement.employeehistory.dto.EmployeeHistoryResponse;
import com.hrmanagement.employeehistory.entity.EmployeeHistory;
import com.hrmanagement.employeehistory.repository.EmployeeHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmployeeHistoryService {

    private final EmployeeHistoryRepository historyRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeHistoryService(EmployeeHistoryRepository historyRepository,
                                  EmployeeRepository employeeRepository) {
        this.historyRepository = historyRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<EmployeeHistoryResponse> findByEmployee(String employeeId) {
        return historyRepository.findByEmployeeIdOrderByEffectiveDateDesc(employeeId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public EmployeeHistoryResponse create(String employeeId, CreateEmployeeHistoryRequest dto) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee not found"));

        EmployeeHistory history = EmployeeHistory.builder()
                .employeeId(employee)
                .type(dto.getType())
                .previousValue(dto.getPreviousValue())
                .newValue(dto.getNewValue())
                .effectiveDate(dto.getEffectiveDate())
                .note(dto.getNote())
                .build();
        historyRepository.save(history);
        return toResponse(history);
    }

    private EmployeeHistoryResponse toResponse(EmployeeHistory h) {
        EmployeeHistoryResponse resp = new EmployeeHistoryResponse();
        resp.setId(h.getId());
        resp.setEmployeeId(h.getEmployeeId().getId());
        resp.setType(h.getType());
        resp.setPreviousValue(h.getPreviousValue());
        resp.setNewValue(h.getNewValue());
        resp.setEffectiveDate(h.getEffectiveDate());
        resp.setNote(h.getNote());
        resp.setCreatedAt(h.getCreatedAt());
        resp.setUpdatedAt(h.getUpdatedAt());
        return resp;
    }
}
