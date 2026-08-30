package com.hrmanagement.seed;

import com.hrmanagement.attendance.entity.Attendance;
import com.hrmanagement.attendance.repository.AttendanceRepository;
import com.hrmanagement.auth.entity.User;
import com.hrmanagement.auth.repository.UserRepository;
import com.hrmanagement.department.entity.Department;
import com.hrmanagement.department.repository.DepartmentRepository;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import com.hrmanagement.leave.entity.Leave;
import com.hrmanagement.leave.repository.LeaveRepository;
import com.hrmanagement.leavebalance.entity.LeaveBalance;
import com.hrmanagement.leavebalance.repository.LeaveBalanceRepository;
import com.hrmanagement.notification.entity.Notification;
import com.hrmanagement.notification.repository.NotificationRepository;
import com.hrmanagement.payroll.entity.Payroll;
import com.hrmanagement.payroll.repository.PayrollRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.jdbc.core.JdbcTemplate;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final PayrollRepository payrollRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public DataSeeder(UserRepository userRepository,
                      DepartmentRepository departmentRepository,
                      EmployeeRepository employeeRepository,
                      LeaveBalanceRepository leaveBalanceRepository,
                      AttendanceRepository attendanceRepository,
                      LeaveRepository leaveRepository,
                      PayrollRepository payrollRepository,
                      NotificationRepository notificationRepository,
                      PasswordEncoder passwordEncoder,
                      Environment environment) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRepository = leaveRepository;
        this.payrollRepository = payrollRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(String... args) {
        if (!environment.acceptsProfiles(Profiles.of("seed"))) {
            return;
        }
        seed();
    }

    @Transactional
    public void seed() {
        log.info("Seeding database...");

        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
        jdbcTemplate.execute("TRUNCATE TABLE leaves");
        jdbcTemplate.execute("TRUNCATE TABLE leave_balances");
        jdbcTemplate.execute("TRUNCATE TABLE attendances");
        jdbcTemplate.execute("TRUNCATE TABLE notifications");
        jdbcTemplate.execute("TRUNCATE TABLE payrolls");
        jdbcTemplate.execute("TRUNCATE TABLE employees");
        jdbcTemplate.execute("TRUNCATE TABLE departments");
        jdbcTemplate.execute("TRUNCATE TABLE users");
        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");

        User adminUser = createUser("admin@hr.com", "admin123", "admin", "Admin");

        Department engDept = Department.builder()
                .name("Engineering")
                .description("Phát triển phần mềm & hạ tầng")
                .build();
        departmentRepository.save(engDept);

        Department designDept = Department.builder()
                .name("Design")
                .description("Thiết kế UI/UX & đồ họa")
                .build();
        departmentRepository.save(designDept);

        Department hrDept = Department.builder()
                .name("HR")
                .description("Nhân sự & tuyển dụng")
                .build();
        departmentRepository.save(hrDept);

        User mgrUser = createUser("eng.manager@hr.com", "manager123", "manager", "Minh Tuấn");
        engDept.setManager(mgrUser);
        departmentRepository.save(engDept);

        Employee adminEmp = Employee.builder()
                .user(adminUser)
                .department(hrDept)
                .firstName("Admin")
                .lastName("Hệ thống")
                .position("Quản trị hệ thống")
                .salary(BigDecimal.valueOf(45000000))
                .hireDate(LocalDate.of(2020, 6, 1))
                .contractType("permanent")
                .phone("0988888000")
                .build();
        employeeRepository.save(adminEmp);

        Employee mgrEmp = Employee.builder()
                .user(mgrUser)
                .department(engDept)
                .firstName("Minh")
                .lastName("Tuấn")
                .position("VP of Engineering")
                .salary(BigDecimal.valueOf(50000000))
                .hireDate(LocalDate.of(2021, 3, 10))
                .contractType("permanent")
                .phone("0912345678")
                .build();
        employeeRepository.save(mgrEmp);

        List<Employee> allEmployees = new ArrayList<>(List.of(adminEmp, mgrEmp));
        AtomicInteger empIndex = new AtomicInteger(1);

        Object[][] empData = {
            {"Anh", "Trần", "Senior Frontend Engineer", 35000000, "permanent", "Engineering", "0901234567"},
            {"Bình", "Lê", "Backend Engineer", 32000000, "permanent", "Engineering", "0902345678"},
            {"Chi", "Phạm", "Fullstack Developer", 30000000, "contract", "Engineering", "0903456789"},
            {"Dung", "Hoàng", "UI/UX Designer", 28000000, "permanent", "Design", "0904567890"},
            {"Em", "Nguyễn", "Graphic Designer", 22000000, "contract", "Design", "0905678901"},
            {"Phương", "Vũ", "HR Manager", 25000000, "permanent", "HR", "0906789012"},
            {"Giang", "Đặng", "HR Specialist", 18000000, "permanent", "HR", "0907890123"},
        };

        Map<String, Department> deptMap = Map.of(
            "Engineering", engDept,
            "Design", designDept,
            "HR", hrDept
        );

        for (Object[] data : empData) {
            String email = String.format("emp%02d@hr.com", empIndex.getAndIncrement());
            User empUser = createUser(email, "employee123", "employee", data[1] + " " + data[0]);
            Department dept = deptMap.get(data[5]);
            Employee emp = Employee.builder()
                    .user(empUser)
                    .department(dept)
                    .firstName((String) data[0])
                    .lastName((String) data[1])
                    .position((String) data[2])
                    .salary(BigDecimal.valueOf((int) data[3]))
                    .hireDate(LocalDate.of(2022, 1, 1).plusDays(new Random().nextInt(365)))
                    .contractType((String) data[4])
                    .phone((String) data[6])
                    .build();
            employeeRepository.save(emp);
            allEmployees.add(emp);
        }

        for (int i = 0; i < allEmployees.size(); i++) {
            Employee emp = allEmployees.get(i);
            LeaveBalance balance = LeaveBalance.builder().employee(emp).build();
            switch (i % 4) {
                case 0 -> balance.setAnnualUsed(2);
                case 1 -> { balance.setAnnualUsed(1); balance.setPersonalUsed(1); }
                case 2 -> balance.setSickUsed(1);
                default -> {}
            }
            leaveBalanceRepository.save(balance);
        }

        seedAttendance(allEmployees);
        List<Leave> leaves = seedLeaves(allEmployees);
        seedPayrolls(allEmployees);
        seedNotifications(allEmployees, leaves);

        log.info("Created {} users, {} departments, {} employees, {} attendances, {} leaves, {} payrolls",
                userRepository.count(), departmentRepository.count(), employeeRepository.count(),
                attendanceRepository.count(), leaveRepository.count(), payrollRepository.count());
        log.info("Admin: admin@hr.com / admin123");
        log.info("Manager: eng.manager@hr.com / manager123");
        log.info("Employees: emp01@hr.com - emp07@hr.com (password: employee123)");
    }

    private void seedAttendance(List<Employee> employees) {
        LocalDate today = LocalDate.now();
        Random rnd = new Random(42);

        for (Employee emp : employees) {
            for (int daysAgo = 0; daysAgo < 30; daysAgo++) {
                LocalDate date = today.minusDays(daysAgo);
                if (date.getDayOfWeek().getValue() >= 6) continue;

                double absentRoll = rnd.nextDouble();
                if (absentRoll < 0.05) continue;

                LocalTime checkIn;
                String status;
                double timeRoll = rnd.nextDouble();
                if (timeRoll < 0.6) {
                    checkIn = LocalTime.of(7, 45 + rnd.nextInt(15));
                    status = "present";
                } else if (timeRoll < 0.85) {
                    checkIn = LocalTime.of(8, 15 + rnd.nextInt(15));
                    status = "present";
                } else if (timeRoll < 0.96) {
                    checkIn = LocalTime.of(9, 10 + rnd.nextInt(20));
                    status = "late";
                } else {
                    checkIn = LocalTime.of(7, 50 + rnd.nextInt(10));
                    status = "half-day";
                }

                LocalTime checkOut;
                if ("half-day".equals(status)) {
                    checkOut = checkIn.plusHours(2 + rnd.nextInt(2));
                } else {
                    checkOut = LocalTime.of(17, 0 + rnd.nextInt(60));
                }

                Attendance att = Attendance.builder()
                        .employee(emp)
                        .date(date)
                        .checkIn(LocalDateTime.of(date, checkIn))
                        .checkOut(LocalDateTime.of(date, checkOut))
                        .status(status)
                        .build();
                attendanceRepository.save(att);
            }
        }
    }

    private List<Leave> seedLeaves(List<Employee> employees) {
        LocalDate today = LocalDate.now();
        Random rnd = new Random(42);
        List<Leave> saved = new ArrayList<>();

        for (int i = 0; i < employees.size(); i++) {
            Employee emp = employees.get(i);

            if (i > 4 && rnd.nextDouble() > 0.5) continue;

            String type = switch (i % 3) {
                case 0 -> "annual";
                case 1 -> "personal";
                default -> "sick";
            };
            LocalDate start = today.minusDays(10 + rnd.nextInt(60));
            int days = 1 + rnd.nextInt(3);
            LocalDate end = start.plusDays(days);

            String status;
            if (i == 1 || i == 3 || i == 4) {
                status = "pending";
            } else if (i == 5) {
                status = "rejected";
            } else {
                status = rnd.nextBoolean() ? "approved" : "pending";
            }

            Leave leave = Leave.builder()
                    .employee(emp)
                    .type(type)
                    .startDate(start)
                    .endDate(end)
                    .status(status)
                    .reason(switch (type) {
                        case "annual" -> "Nghỉ phép cá nhân";
                        case "sick" -> "Không khỏe";
                        default -> "Việc gia đình";
                    })
                    .rejectionReason("rejected".equals(status) ? "Thiếu nhân sự trong khoảng thời gian này" : null)
                    .build();
            leaveRepository.save(leave);
            saved.add(leave);
        }

        return saved;
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

    private BigDecimal calculatePIT(BigDecimal taxableIncome) {
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

    private void seedPayrolls(List<Employee> employees) {
        LocalDate prev = LocalDate.now().minusMonths(1);
        int month = prev.getMonthValue();
        int year = prev.getYear();

        for (int i = 0; i < employees.size(); i++) {
            Employee emp = employees.get(i);
            BigDecimal salary = emp.getSalary();

            BigDecimal si = salary.multiply(BHXH_RATE).setScale(0, RoundingMode.DOWN);
            BigDecimal hi = salary.multiply(BHYT_RATE).setScale(0, RoundingMode.DOWN);
            BigDecimal ui = salary.multiply(BHTN_RATE).setScale(0, RoundingMode.DOWN);
            BigDecimal cd = salary.multiply(CONG_DOAN_RATE).setScale(0, RoundingMode.DOWN);
            BigDecimal totalInsurance = si.add(hi).add(ui).add(cd);
            BigDecimal pit = calculatePIT(salary.subtract(PERSONAL_DEDUCTION).subtract(totalInsurance));
            BigDecimal totalDeductions = totalInsurance.add(pit);

            boolean paid = i % 2 == 0;
            Payroll payroll = Payroll.builder()
                    .employee(emp)
                    .month(month)
                    .year(year)
                    .basicSalary(salary)
                    .bonus(BigDecimal.ZERO)
                    .socialInsurance(si)
                    .healthInsurance(hi)
                    .unemploymentInsurance(ui)
                    .unionDues(cd)
                    .pit(pit)
                    .totalDeductions(totalDeductions)
                    .netPay(salary.subtract(totalDeductions))
                    .status(paid ? "paid" : "draft")
                    .paidAt(paid ? Instant.now() : null)
                    .build();
            payrollRepository.save(payroll);
        }
    }

    private void seedNotifications(List<Employee> employees, List<Leave> leaves) {
        for (int i = 0; i < employees.size(); i++) {
            Employee emp = employees.get(i);
            Leave related = leaves.stream()
                    .filter(l -> l.getEmployee().getId().equals(emp.getId()))
                    .findFirst()
                    .orElse(null);
            boolean read = i % 3 == 0;
            String status = related != null ? related.getStatus() : "approved";

            Notification notification = Notification.builder()
                    .user(emp.getUser())
                    .title("Cập nhật đơn nghỉ phép")
                    .message("Đơn nghỉ phép " + (status.equals("rejected") ? "đã bị từ chối" :
                            status.equals("pending") ? "đang chờ phê duyệt" : "đã được phê duyệt"))
                    .type("leave")
                    .relatedId(related != null ? related.getId() : null)
                    .relatedModel("leave")
                    .isRead(read)
                    .build();
            notificationRepository.save(notification);
        }
    }

    private User createUser(String email, String password, String role, String name) {
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(role)
                .name(name)
                .build();
        return userRepository.save(user);
    }
}
