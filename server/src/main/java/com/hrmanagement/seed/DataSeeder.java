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
                      PasswordEncoder passwordEncoder,
                      Environment environment) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRepository = leaveRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(String... args) {
        if (!environment.acceptsProfiles(Profiles.of("seed"))) {
            return;
        }
        seed();
        System.exit(0);
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

        createUser("admin@hr.com", "admin123", "admin", "Admin");

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

        List<Employee> allEmployees = new ArrayList<>(List.of(mgrEmp));
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

        for (Employee emp : allEmployees) {
            leaveBalanceRepository.save(LeaveBalance.builder().employee(emp).build());
        }

        seedAttendance(allEmployees);
        seedLeaves(allEmployees);

        log.info("Created {} users, {} departments, {} employees, {} attendances, {} leaves",
                userRepository.count(), departmentRepository.count(), employeeRepository.count(),
                attendanceRepository.count(), leaveRepository.count());
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

    private void seedLeaves(List<Employee> employees) {
        LocalDate today = LocalDate.now();
        Random rnd = new Random(42);

        for (int i = 1; i < employees.size(); i++) {
            Employee emp = employees.get(i);
            double leaveRoll = rnd.nextDouble();
            if (leaveRoll > 0.5) continue;

            String type = switch (rnd.nextInt(3)) {
                case 0 -> "annual";
                case 1 -> "sick";
                default -> "personal";
            };
            LocalDate start = today.minusDays(15 + rnd.nextInt(60));
            int days = 1 + rnd.nextInt(3);
            LocalDate end = start.plusDays(days);

            String status;
            if (i == 1) {
                status = "pending";
            } else if (i == 2) {
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
