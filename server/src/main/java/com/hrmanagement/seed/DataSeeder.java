package com.hrmanagement.seed;

import com.hrmanagement.attendance.entity.Attendance;
import com.hrmanagement.attendance.repository.AttendanceRepository;
import com.hrmanagement.auth.entity.User;
import com.hrmanagement.auth.repository.UserRepository;
import com.hrmanagement.department.entity.Department;
import com.hrmanagement.department.repository.DepartmentRepository;
import com.hrmanagement.employee.entity.Employee;
import com.hrmanagement.employee.repository.EmployeeRepository;
import com.hrmanagement.employeehistory.entity.EmployeeHistory;
import com.hrmanagement.employeehistory.repository.EmployeeHistoryRepository;
import com.hrmanagement.leave.entity.Leave;
import com.hrmanagement.leave.repository.LeaveRepository;
import com.hrmanagement.leavebalance.entity.LeaveBalance;
import com.hrmanagement.leavebalance.repository.LeaveBalanceRepository;
import com.hrmanagement.notification.repository.NotificationRepository;
import com.hrmanagement.payroll.entity.Payroll;
import com.hrmanagement.payroll.repository.PayrollRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Profile("seed")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final PayrollRepository payrollRepository;
    private final LeaveRepository leaveRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeHistoryRepository employeeHistoryRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationContext applicationContext;

    public DataSeeder(UserRepository userRepository,
                      DepartmentRepository departmentRepository,
                      EmployeeRepository employeeRepository,
                      AttendanceRepository attendanceRepository,
                      PayrollRepository payrollRepository,
                      LeaveRepository leaveRepository,
                      LeaveBalanceRepository leaveBalanceRepository,
                      EmployeeHistoryRepository employeeHistoryRepository,
                      NotificationRepository notificationRepository,
                      PasswordEncoder passwordEncoder,
                      ApplicationContext applicationContext) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.payrollRepository = payrollRepository;
        this.leaveRepository = leaveRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.employeeHistoryRepository = employeeHistoryRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.applicationContext = applicationContext;
    }

    @Override
    public void run(String... args) {
        seed();
        SpringApplication.exit(applicationContext, () -> 0);
    }

    @Transactional
    public void seed() {
        log.info("Seeding database...");

        // Clear all tables in FK order
        notificationRepository.deleteAllInBatch();
        employeeHistoryRepository.deleteAllInBatch();
        leaveBalanceRepository.deleteAllInBatch();
        payrollRepository.deleteAllInBatch();
        attendanceRepository.deleteAllInBatch();
        leaveRepository.deleteAllInBatch();
        employeeRepository.deleteAllInBatch();
        departmentRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        // Create admin user
        createUser("admin@hr.com", "admin123", "admin", "Admin");

        // Department data
        String[][] DEPT_DATA = {
            {"Engineering", "Phát triển phần mềm & hạ tầng"},
            {"Human Resources", "Quản lý nhân tài & văn hóa"},
            {"Sales", "Doanh thu & phát triển khách hàng"},
            {"Marketing", "Thương hiệu & tạo nhu cầu"},
            {"Finance", "Kế toán & hoạch định tài chính"},
            {"Business Analysis", "Phân tích yêu cầu khách hàng & thiết kế giải pháp"}
        };

        // Manager data
        String[][] MANAGER_DATA = {
            {"eng.manager@hr.com", "Minh Tuấn", "VP of Engineering"},
            {"hr.manager@hr.com", "Thu Hương", "VP of People"},
            {"sales.manager@hr.com", "Quốc Bảo", "VP of Sales"},
            {"mkt.manager@hr.com", "Lan Chi", "VP of Marketing"},
            {"fin.manager@hr.com", "Hoàng Nam", "VP of Finance"},
            {"ba.manager@hr.com", "Minh Anh", "VP of Business Analysis"}
        };

        // Employee data per department: {firstName, lastName, position, salary, contractType}
        Object[][][] EMPLOYEES_BY_DEPT = {
            // Engineering
            {
                {"Anh", "Trần", "Senior Frontend Engineer", 35000000, "permanent"},
                {"Bình", "Lê", "Backend Engineer", 32000000, "permanent"},
                {"Chi", "Phạm", "Fullstack Developer", 30000000, "contract"},
                {"Dũng", "Nguyễn", "DevOps Engineer", 38000000, "permanent"},
                {"Giang", "Vũ", "QA Engineer", 28000000, "permanent"},
                {"Hải", "Đặng", "Data Engineer", 36000000, "contract"},
                {"Khoa", "Bùi", "Mobile Developer", 31000000, "permanent"},
                {"Linh", "Hoàng", "Junior Frontend Developer", 22000000, "contract"},
                {"Mai", "Đỗ", "Product Owner", 40000000, "permanent"},
                {"Nam", "Trịnh", "Security Engineer", 37000000, "permanent"},
                {"Phúc", "Hồ", "Software Engineering Intern", 5000000, "intern"},
                {"Sang", "Lý", "Platform Engineer", 34000000, "contract"}
            },
            // HR
            {
                {"Diệp", "Vương", "HR Business Partner", 25000000, "permanent"},
                {"Hạnh", "Tô", "Talent Acquisition Specialist", 22000000, "permanent"},
                {"Huyền", "Dương", "Compensation & Benefits Specialist", 26000000, "permanent"},
                {"Ngọc", "Lâm", "Training Coordinator", 20000000, "contract"},
                {"Yến", "Mai", "HR Assistant", 18000000, "permanent"}
            },
            // Sales
            {
                {"Cường", "Đinh", "Senior Account Executive", 40000000, "permanent"},
                {"Đức", "Thái", "Account Executive", 32000000, "permanent"},
                {"Hào", "Tạ", "Sales Representative", 28000000, "permanent"},
                {"Hùng", "Phùng", "Strategic Account Manager", 45000000, "permanent"},
                {"Khánh", "Cao", "Business Development Executive", 30000000, "contract"},
                {"Loan", "Trương", "Business Analyst", 26000000, "permanent"},
                {"Nhi", "Lương", "Inside Sales Specialist", 24000000, "contract"},
                {"Phương", "Đoàn", "Customer Success Manager", 31000000, "permanent"},
                {"Thắng", "Quách", "Business Development Representative", 22000000, "contract"}
            },
            // Marketing
            {
                {"Ánh", "Lại", "Brand Manager", 33000000, "permanent"},
                {"Duyên", "Trần", "Content Strategist", 25000000, "permanent"},
                {"Hiếu", "Văn", "Digital Marketing Specialist", 27000000, "permanent"},
                {"Khôi", "Đàm", "SEO Specialist", 23000000, "contract"},
                {"Nhung", "Lê", "Social Media Manager", 26000000, "permanent"},
                {"Quân", "Ngô", "Performance Marketing Specialist", 29000000, "contract"},
                {"Thảo", "Kim", "Marketing Coordinator", 21000000, "permanent"},
                {"Vân", "Phan", "Graphic Designer", 24000000, "permanent"}
            },
            // Finance
            {
                {"Hà", "Tống", "Senior Accountant", 30000000, "permanent"},
                {"Liên", "Hứa", "Financial Analyst", 32000000, "permanent"},
                {"Oanh", "Đỗ", "Accounts Payable Specialist", 23000000, "permanent"},
                {"Thanh", "Tăng", "Tax Specialist", 27000000, "contract"},
                {"Trang", "Lục", "Payroll Accountant", 25000000, "permanent"}
            },
            // Business Analysis
            {
                {"Bảo", "Lê", "Senior Business Analyst", 30000000, "permanent"},
                {"Cẩm", "Vũ", "Business Systems Analyst", 26000000, "permanent"},
                {"Đạt", "Hoàng", "Requirements Analyst", 24000000, "permanent"},
                {"Hương", "Phạm", "Solutions Architect", 28000000, "permanent"},
                {"Khải", "Đỗ", "Data Analyst", 27000000, "contract"},
                {"My", "Trần", "Customer Insights Analyst", 25000000, "permanent"}
            }
        };

        Random rand = new Random(42);

        // --- Create Managers + Departments ---
        List<Department> departments = new ArrayList<>();
        List<Employee> managerEmployees = new ArrayList<>();

        for (int i = 0; i < MANAGER_DATA.length; i++) {
            User mgrUser = createUser(MANAGER_DATA[i][0], "manager123", "manager", MANAGER_DATA[i][1]);
            Department dept = Department.builder()
                    .name(DEPT_DATA[i][0])
                    .description(DEPT_DATA[i][1])
                    .managerId(mgrUser)
                    .build();
            departmentRepository.save(dept);
            departments.add(dept);

            String[] nameParts = MANAGER_DATA[i][1].split(" ");
            String firstName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : MANAGER_DATA[i][1];
            String lastName = nameParts.length > 1 ? nameParts[0] : "";
            int mgrSalary = 50000000 + rand.nextInt(20000000);
            LocalDate hireDate = LocalDate.of(2022, 1, 1).plusDays(rand.nextInt(365 * 2));

            Employee mgrEmp = Employee.builder()
                    .userId(mgrUser)
                    .departmentId(dept)
                    .firstName(firstName)
                    .lastName(lastName)
                    .position(MANAGER_DATA[i][2])
                    .salary(BigDecimal.valueOf(mgrSalary))
                    .hireDate(hireDate)
                    .contractType("permanent")
                    .build();
            employeeRepository.save(mgrEmp);
            managerEmployees.add(mgrEmp);
        }

        // --- Create Employees ---
        List<Employee> allEmployees = new ArrayList<>(managerEmployees);
        AtomicInteger empIndex = new AtomicInteger(1);

        for (int d = 0; d < EMPLOYEES_BY_DEPT.length; d++) {
            Department dept = departments.get(d);
            for (Object[] empData : EMPLOYEES_BY_DEPT[d]) {
                String email = String.format("emp%02d@hr.com", empIndex.getAndIncrement());
                User empUser = createUser(email, "employee123", "employee", null);
                LocalDate hireDate = LocalDate.of(2022, 6, 1).plusDays(rand.nextInt(700));

                Employee emp = Employee.builder()
                        .userId(empUser)
                        .departmentId(dept)
                        .firstName((String) empData[0])
                        .lastName((String) empData[1])
                        .position((String) empData[2])
                        .salary(BigDecimal.valueOf((int) empData[3]))
                        .hireDate(hireDate)
                        .contractType((String) empData[4])
                        .build();
                employeeRepository.save(emp);
                allEmployees.add(emp);
            }
        }

        log.info("Created {} users, {} departments, {} employees",
                userRepository.count(), departmentRepository.count(), employeeRepository.count());

        // --- Create Leave Balances ---
        for (Employee emp : allEmployees) {
            LeaveBalance balance = LeaveBalance.builder()
                    .employeeId(emp)
                    .build();
            leaveBalanceRepository.save(balance);
        }

        // --- Create Employee History (raise records) ---
        for (int i = 6; i < allEmployees.size(); i++) {
            Employee emp = allEmployees.get(i);
            int raiseAmount = (2 + rand.nextInt(4)) * 10;
            EmployeeHistory history = EmployeeHistory.builder()
                    .employeeId(emp)
                    .type("raise")
                    .newValue(raiseAmount + "tr")
                    .effectiveDate(LocalDate.of(2023, 7, 1).plusDays(rand.nextInt(365)))
                    .note("Đánh giá hiệu suất năm")
                    .build();
            employeeHistoryRepository.save(history);
        }
        for (Employee mgr : managerEmployees) {
            int raiseAmount = (7 + rand.nextInt(3)) * 10;
            EmployeeHistory history = EmployeeHistory.builder()
                    .employeeId(mgr)
                    .type("raise")
                    .newValue(raiseAmount + "tr")
                    .effectiveDate(LocalDate.of(2023, 1, 15).plusDays(rand.nextInt(90)))
                    .note("Điều chỉnh lương quản lý")
                    .build();
            employeeHistoryRepository.save(history);
        }

        // --- Attendance (2 months) ---
        LocalDate today = LocalDate.now();
        int currentYear = today.getYear();
        int currentMonth = today.getMonthValue();

        int[][] attMonths = {
            {currentYear, currentMonth, today.getDayOfMonth()},
            {currentYear, currentMonth == 1 ? 12 : currentMonth - 1, currentMonth == 1 ? 31 : LocalDate.of(currentYear, currentMonth - 1, 1).lengthOfMonth()}
        };

        double[] absentThresholds = {0.02, 0.04, 0.06, 0.10, 0.20};
        double[] halfDayThresholds = {0.04, 0.08, 0.14, 0.23, 0.38};
        double[] lateThresholds = {0.08, 0.18, 0.30, 0.45, 0.60};

        int attendanceCount = 0;
        for (int[] attMonth : attMonths) {
            int year = attMonth[0];
            int month = attMonth[1];
            int maxDay = attMonth[2];

            for (int day = 1; day <= maxDay; day++) {
                LocalDate date = LocalDate.of(year, month, day);
                DayOfWeek dow = date.getDayOfWeek();
                if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) continue;

                for (int ei = 0; ei < allEmployees.size(); ei++) {
                    Employee emp = allEmployees.get(ei);
                    int profileIdx = Math.min(ei / 10, 4);
                    double roll = rand.nextDouble();

                    String status;
                    LocalTime checkInTime = null;
                    LocalTime checkOutTime = null;

                    if (roll < absentThresholds[profileIdx]) {
                        status = "absent";
                    } else if (roll < halfDayThresholds[profileIdx]) {
                        status = "half-day";
                        if (rand.nextBoolean()) {
                            checkInTime = LocalTime.of(8, rand.nextInt(60));
                            checkOutTime = LocalTime.of(12, rand.nextInt(60));
                        } else {
                            checkInTime = LocalTime.of(7, rand.nextInt(60));
                            checkOutTime = LocalTime.of(11, rand.nextInt(60));
                        }
                    } else if (roll < lateThresholds[profileIdx]) {
                        status = "late";
                        checkInTime = LocalTime.of(9, rand.nextInt(60));
                        checkOutTime = LocalTime.of(17, rand.nextInt(60));
                    } else {
                        status = "present";
                        checkInTime = LocalTime.of(7, rand.nextInt(60));
                        checkOutTime = LocalTime.of(17, rand.nextInt(60));
                    }

                    Attendance att = Attendance.builder()
                            .employeeId(emp)
                            .date(date)
                            .checkIn(checkInTime != null ? date.atTime(checkInTime) : null)
                            .checkOut(checkOutTime != null ? date.atTime(checkOutTime) : null)
                            .status(status)
                            .build();
                    attendanceRepository.save(att);
                    attendanceCount++;
                }
            }
        }
        log.info("Attendance: {} records", attendanceCount);

        // --- Payroll (3 months) ---
        int payrollCount = 0;
        for (int offset = 0; offset < 3; offset++) {
            int m = currentMonth - offset;
            int y = currentYear;
            if (m <= 0) { m += 12; y -= 1; }

            for (Employee emp : allEmployees) {
                BigDecimal salary = emp.getSalary();
                double bonus = calcBonus(salary.doubleValue(), rand, m, y);
                int dependents = rand.nextInt(3);
                double deductions = calcTotalDeductions(salary.doubleValue(), dependents);
                double netPay = salary.doubleValue() + bonus - deductions;

                Payroll payroll = Payroll.builder()
                        .employeeId(emp)
                        .month(m)
                        .year(y)
                        .basicSalary(salary)
                        .bonus(BigDecimal.valueOf(roundMoney(bonus)))
                        .deductions(BigDecimal.valueOf(roundMoney(deductions)))
                        .netPay(BigDecimal.valueOf(roundMoney(Math.max(0, netPay))))
                        .status(offset == 0 ? "draft" : "paid")
                        .paidAt(offset == 0 ? null : Instant.now())
                        .build();
                payrollRepository.save(payroll);
                payrollCount++;
            }
        }

        // Historical payrolls (1-2 random months from previous year)
        for (Employee emp : allEmployees) {
            int numRecords = 1 + rand.nextInt(2);
            for (int r = 0; r < numRecords; r++) {
                int m = 1 + rand.nextInt(12);
                int y = currentYear - 1;
                double bonus = calcBonus(emp.getSalary().doubleValue(), rand, m, y);
                int dependents = rand.nextInt(3);
                double deductions = calcTotalDeductions(emp.getSalary().doubleValue(), dependents);
                double netPay = emp.getSalary().doubleValue() + bonus - deductions;

                Payroll payroll = Payroll.builder()
                        .employeeId(emp)
                        .month(m)
                        .year(y)
                        .basicSalary(emp.getSalary())
                        .bonus(BigDecimal.valueOf(roundMoney(bonus)))
                        .deductions(BigDecimal.valueOf(roundMoney(deductions)))
                        .netPay(BigDecimal.valueOf(roundMoney(Math.max(0, netPay))))
                        .status("paid")
                        .paidAt(Instant.now())
                        .build();
                payrollRepository.save(payroll);
                payrollCount++;
            }
        }
        log.info("Payroll: {} records", payrollCount);

        // --- Leaves ---
        String[] leaveTypes = {"annual", "sick", "personal"};
        String[][] leaveReasons = {
            {"Du lịch gia đình", "Du lịch cá nhân", "Nghỉ cuối năm", "Nghỉ tại nhà"},
            {"Cảm thấy không khỏe", "Hẹn khám bệnh", "Hồi phục sau cúm", "Phẫu thuật răng"},
            {"Sự kiện gia đình", "Việc cá nhân", "Sửa chữa nhà cửa", "Ngày lễ tôn giáo"}
        };

        Map<String, int[]> balanceUpdates = new HashMap<>();
        int leaveCount = 0;

        for (Employee emp : allEmployees) {
            int numLeaves = 1 + rand.nextInt(3);
            for (int l = 0; l < numLeaves; l++) {
                int typeIdx = rand.nextInt(3);
                String type = leaveTypes[typeIdx];
                int daysCount = 1 + rand.nextInt(5);
                int startDay = 1 + rand.nextInt(20);
                int leaveMonth = 1 + rand.nextInt(12);
                int leaveYear = leaveMonth > currentMonth ? currentYear - 1 : currentYear;
                LocalDate startDate = LocalDate.of(leaveYear, leaveMonth, startDay);
                LocalDate endDate = LocalDate.of(leaveYear, leaveMonth, Math.min(startDay + daysCount - 1, 28));

                double statusRoll = rand.nextDouble();
                String status = statusRoll < 0.5 ? "approved" : statusRoll < 0.75 ? "pending" : "rejected";

                Leave leave = Leave.builder()
                        .employeeId(emp)
                        .type(type)
                        .startDate(startDate)
                        .endDate(endDate)
                        .status(status)
                        .reason(leaveReasons[typeIdx][rand.nextInt(leaveReasons[typeIdx].length)])
                        .rejectionReason("rejected".equals(status) ? "Không đủ ngày phép" : null)
                        .build();
                leaveRepository.save(leave);
                leaveCount++;

                if ("approved".equals(status)) {
                    long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
                    balanceUpdates.computeIfAbsent(emp.getId(), k -> new int[]{0, 0, 0});
                    int[] used = balanceUpdates.get(emp.getId());
                    switch (type) {
                        case "annual" -> used[0] += (int) days;
                        case "sick" -> used[1] += (int) days;
                        case "personal" -> used[2] += (int) days;
                    }
                }
            }
        }

        // Update leave balances
        for (Map.Entry<String, int[]> entry : balanceUpdates.entrySet()) {
            leaveBalanceRepository.findByEmployeeId(entry.getKey()).ifPresent(balance -> {
                balance.setAnnualUsed(balance.getAnnualUsed() + entry.getValue()[0]);
                balance.setSickUsed(balance.getSickUsed() + entry.getValue()[1]);
                balance.setPersonalUsed(balance.getPersonalUsed() + entry.getValue()[2]);
                leaveBalanceRepository.save(balance);
            });
        }

        log.info("Leaves: {} records", leaveCount);
        log.info("Seed complete! Admin: admin@hr.com / admin123");
        log.info("Managers: eng.manager@hr.com, hr.manager@hr.com, sales.manager@hr.com, mkt.manager@hr.com, fin.manager@hr.com, ba.manager@hr.com (password: manager123)");
        log.info("Employees: emp01@hr.com - emp45@hr.com (password: employee123)");
    }

    private User createUser(String email, String password, String role, String name) {
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(role)
                .name(name)
                .isActive(true)
                .build();
        return userRepository.save(user);
    }

    private double roundMoney(double amount) {
        return Math.round(amount / 10000.0) * 10000.0;
    }

    private double calcBonus(double salary, Random rand, int month, int year) {
        if (month == 1 || month == 12) {
            if (rand.nextDouble() < 0.15) return 0;
            return roundMoney(salary * (0.5 + rand.nextDouble() * 1.5));
        }
        if (month % 3 == 0) {
            if (rand.nextDouble() < 0.10) return 0;
            return roundMoney(salary * rand.nextDouble() * 0.4);
        }
        if (rand.nextDouble() < 0.10) return 0;
        return roundMoney(salary * rand.nextDouble() * 0.16);
    }

    private static final double PERSONAL_DEDUCTION = 11_000_000;
    private static final double DEPENDENT_DEDUCTION = 4_400_000;

    private double calcTotalDeductions(double salary, int dependents) {
        double bhxh = roundMoney(Math.min(salary, 29_800_000) * 0.08);
        double bhtn = roundMoney(Math.min(salary, 9_920_000) * 0.01);
        double bhtnld = roundMoney(Math.min(salary, 29_800_000) * 0.005);
        double unionFee = roundMoney(salary * 0.025);
        double totalInsurance = bhxh + bhtn + bhtnld + unionFee;
        double taxableIncome = salary - totalInsurance - PERSONAL_DEDUCTION - dependents * DEPENDENT_DEDUCTION;
        double pit = calcPIT(Math.max(0, taxableIncome));
        return bhxh + bhtn + bhtnld + unionFee + pit;
    }

    private double calcPIT(double taxableIncome) {
        if (taxableIncome <= 0) return 0;
        double[][] brackets = {
            {5_000_000, 0.05},
            {10_000_000, 0.10},
            {18_000_000, 0.15},
            {32_000_000, 0.20},
            {52_000_000, 0.25},
            {80_000_000, 0.30},
            {Double.MAX_VALUE, 0.35}
        };
        double tax = 0;
        double prev = 0;
        for (double[] bracket : brackets) {
            if (taxableIncome <= prev) break;
            double taxable = Math.min(taxableIncome, bracket[0]) - prev;
            tax += taxable * bracket[1];
            prev = bracket[0];
        }
        return roundMoney(tax);
    }
}
