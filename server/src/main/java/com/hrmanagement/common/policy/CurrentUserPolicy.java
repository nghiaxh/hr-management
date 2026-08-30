package com.hrmanagement.common.policy;

import com.hrmanagement.department.entity.Department;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class CurrentUserPolicy {

    private final EmployeeRepository employeeRepository;

    public CurrentUserPolicy(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Optional<Employee> currentEmployee(String userId) {
        return employeeRepository.findByUserId(userId);
    }

    public Department currentDepartment(String userId) {
        return currentEmployee(userId).map(Employee::getDepartment).orElse(null);
    }

    public List<String> departmentEmployeeIds(String userId) {
        Department dept = currentDepartment(userId);
        if (dept == null) {
            return List.of();
        }
        return employeeRepository.findByDepartmentId(dept.getId())
                .stream().map(Employee::getId).toList();
    }

    public boolean isSelf(String userId, Employee target) {
        return target != null && target.getUser() != null && userId.equals(target.getUser().getId());
    }

    public boolean isSameDepartment(Employee a, Employee b) {
        if (a == null || b == null) {
            return false;
        }
        Department da = a.getDepartment();
        Department db = b.getDepartment();
        return da != null && db != null && da.getId().equals(db.getId());
    }
}
