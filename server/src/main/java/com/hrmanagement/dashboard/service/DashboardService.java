package com.hrmanagement.dashboard.service;

import com.hrmanagement.attendance.repository.AttendanceRepository;
import com.hrmanagement.department.entity.Department;
import com.hrmanagement.department.repository.DepartmentRepository;
import com.hrmanagement.dashboard.dto.AdminDashboardResponse;
import com.hrmanagement.dashboard.dto.EmployeeDashboardResponse;
import com.hrmanagement.dashboard.dto.ManagerDashboardResponse;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import com.hrmanagement.leave.entity.Leave;
import com.hrmanagement.leave.repository.LeaveRepository;
import com.hrmanagement.payroll.entity.Payroll;
import com.hrmanagement.payroll.repository.PayrollRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRepository leaveRepository;
    private final AttendanceRepository attendanceRepository;
    private final PayrollRepository payrollRepository;

    public DashboardService(EmployeeRepository employeeRepository,
                            DepartmentRepository departmentRepository,
                            LeaveRepository leaveRepository,
                            AttendanceRepository attendanceRepository,
                            PayrollRepository payrollRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.leaveRepository = leaveRepository;
        this.attendanceRepository = attendanceRepository;
        this.payrollRepository = payrollRepository;
    }

    public Object getDashboard(String userRole, String userId) {
        return switch (userRole) {
            case "admin" -> adminDashboard();
            case "manager" -> managerDashboard(userId);
            default -> employeeDashboard(userId);
        };
    }

    private AdminDashboardResponse adminDashboard() {
        LocalDate today = LocalDate.now();
        LocalDate now = today;
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        long totalEmployees = employeeRepository.count();
        long totalDepartments = departmentRepository.count();
        long pendingLeaves = leaveRepository.countByStatus("pending");
        long presentToday = attendanceRepository.countByDateAndStatusIn(today, List.of("present", "late"));
        BigDecimal monthlyPayroll = payrollRepository.sumNetPayByMonthAndYear(currentMonth, currentYear);

        List<Map<String, Object>> departmentStats = new ArrayList<>();
        List<Department> departments = departmentRepository.findAll();
        for (Department dept : departments) {
            long count = employeeRepository.countByDepartmentId(dept.getId());
            departmentStats.add(Map.of("name", dept.getName(), "count", count));
        }

        List<Leave> recentLeavesList = leaveRepository.findAll(
                org.springframework.data.domain.PageRequest.of(0, 5, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))
        ).getContent();
        List<Map<String, Object>> recentLeaves = recentLeavesList.stream().map(l -> {
            Map<String, Object> m = new HashMap<>();
            m.put("_id", l.getId());
            m.put("type", l.getType());
            m.put("status", l.getStatus());
            m.put("startDate", l.getStartDate());
            m.put("endDate", l.getEndDate());
            if (l.getEmployeeId() != null) {
                m.put("employeeId", Map.of(
                        "_id", l.getEmployeeId().getId(),
                        "firstName", l.getEmployeeId().getFirstName(),
                        "lastName", l.getEmployeeId().getLastName()
                ));
            }
            return m;
        }).toList();

        return new AdminDashboardResponse(totalEmployees, totalDepartments, pendingLeaves,
                presentToday, monthlyPayroll, departmentStats, recentLeaves);
    }

    private ManagerDashboardResponse managerDashboard(String userId) {
        Optional<Employee> mgrEmp = employeeRepository.findByUserId(userId);
        if (mgrEmp.isEmpty() || mgrEmp.get().getDepartmentId() == null) {
            return new ManagerDashboardResponse("N/A", 0, 0, 0, BigDecimal.ZERO);
        }

        Employee emp = mgrEmp.get();
        Department dept = emp.getDepartmentId();
        LocalDate today = LocalDate.now();
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();

        List<String> deptEmpIds = employeeRepository.findByDepartmentId(dept.getId())
                .stream().map(Employee::getId).toList();

        long totalEmployees = deptEmpIds.size();
        long pendingLeaves = leaveRepository.countByStatus("pending");
        long presentToday = attendanceRepository.countByEmployeeIdInAndDateAndStatusIn(deptEmpIds, today, List.of("present", "late"));
        BigDecimal departmentPayroll = payrollRepository.sumNetPayByEmployeeIdsAndMonthAndYear(deptEmpIds, currentMonth, currentYear);

        return new ManagerDashboardResponse(dept.getName(), totalEmployees, pendingLeaves, presentToday, departmentPayroll);
    }

    private EmployeeDashboardResponse employeeDashboard(String userId) {
        Optional<Employee> empOpt = employeeRepository.findByUserId(userId);
        if (empOpt.isEmpty()) {
            return new EmployeeDashboardResponse(Map.of(), Map.of(), null, List.of());
        }

        Employee emp = empOpt.get();
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        List<Leave> allLeaves = leaveRepository.findByEmployeeId(emp.getId(),
                org.springframework.data.domain.PageRequest.of(0, 1000)).getContent();

        Map<String, Long> myLeaves = new HashMap<>();
        myLeaves.put("pending", 0L);
        myLeaves.put("approved", 0L);
        myLeaves.put("rejected", 0L);
        for (Leave l : allLeaves) {
            myLeaves.merge(l.getStatus(), 1L, Long::sum);
        }

        List<com.hrmanagement.attendance.entity.Attendance> monthAttendance =
                attendanceRepository.findByEmployeeIdAndDateBetween(emp.getId(), startOfMonth, endOfMonth);

        Map<String, Long> myAttendance = new HashMap<>();
        myAttendance.put("present", 0L);
        myAttendance.put("late", 0L);
        myAttendance.put("absent", 0L);
        myAttendance.put("halfDay", 0L);
        myAttendance.put("totalDays", (long) monthAttendance.size());
        for (com.hrmanagement.attendance.entity.Attendance a : monthAttendance) {
            switch (a.getStatus()) {
                case "present" -> myAttendance.merge("present", 1L, Long::sum);
                case "late" -> myAttendance.merge("late", 1L, Long::sum);
                case "absent" -> myAttendance.merge("absent", 1L, Long::sum);
                case "half-day" -> myAttendance.merge("halfDay", 1L, Long::sum);
            }
        }

        Payroll lastPayroll = payrollRepository.findByEmployeeId(emp.getId(),
                org.springframework.data.domain.PageRequest.of(0, 1, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "year", "month")))
                .stream().findFirst().orElse(null);

        List<Leave> upcomingLeaves = leaveRepository.findByEmployeeId(emp.getId(),
                org.springframework.data.domain.PageRequest.of(0, 100)).getContent()
                .stream()
                .filter(l -> "approved".equals(l.getStatus()) && !l.getStartDate().isBefore(now))
                .sorted(Comparator.comparing(Leave::getStartDate))
                .limit(3)
                .toList();

        List<Map<String, Object>> upcomingLeavesMapped = upcomingLeaves.stream().map(l -> {
            Map<String, Object> m = new HashMap<>();
            m.put("_id", l.getId());
            m.put("type", l.getType());
            m.put("startDate", l.getStartDate());
            m.put("endDate", l.getEndDate());
            m.put("status", l.getStatus());
            return m;
        }).toList();

        return new EmployeeDashboardResponse(myLeaves, myAttendance, lastPayroll, upcomingLeavesMapped);
    }
}
