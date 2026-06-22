import "dotenv/config";
import mongoose, { connect } from "mongoose";
import { User } from "./models/user.model.js";
import { Department } from "./models/department.model.js";
import { Employee } from "./models/employee.model.js";
import { LeaveBalance } from "./models/leave-balance.model.js";
import { EmployeeHistory } from "./models/employee-history.model.js";
import { Leave } from "./models/leave.model.js";
import { Attendance } from "./models/attendance.model.js";
import { Payroll } from "./models/payroll.model.js";
import { AuthService } from "./services/auth.service.js";
import { EmployeesService } from "./services/employees.service.js";
import { DepartmentsService } from "./services/departments.service.js";
import { LeaveBalanceService } from "./services/leave-balance.service.js";
import { EmployeeHistoryService } from "./services/employee-history.service.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hr-management";

const DEPARTMENTS = [
  { name: "Engineering", description: "Phát triển phần mềm & hạ tầng" },
  { name: "Human Resources", description: "Quản lý nhân tài & văn hóa" },
  { name: "Sales", description: "Doanh thu & phát triển khách hàng" },
  { name: "Marketing", description: "Thương hiệu & tạo nhu cầu" },
  { name: "Finance", description: "Kế toán & hoạch định tài chính" },
  { name: "Business Analysis", description: "Phân tích yêu cầu khách hàng & thiết kế giải pháp" },
];

const MANAGERS: { email: string; name: string; deptIdx: number; position: string }[] = [
  { email: "eng.manager@hr.com", name: "Minh Tuấn", deptIdx: 0, position: "VP of Engineering" },
  { email: "hr.manager@hr.com", name: "Thu Hương", deptIdx: 1, position: "VP of People" },
  { email: "sales.manager@hr.com", name: "Quốc Bảo", deptIdx: 2, position: "VP of Sales" },
  { email: "mkt.manager@hr.com", name: "Lan Chi", deptIdx: 3, position: "VP of Marketing" },
  { email: "fin.manager@hr.com", name: "Hoàng Nam", deptIdx: 4, position: "VP of Finance" },
  { email: "ba.manager@hr.com", name: "Minh Anh", deptIdx: 5, position: "VP of Business Analysis" },
];

const EMPLOYEES_BY_DEPT: { firstName: string; lastName: string; position: string; salary: number; contractType: string }[][] = [
  [
    { firstName: "Anh", lastName: "Trần", position: "Senior Frontend Engineer", salary: 35000000, contractType: "permanent" },
    { firstName: "Bình", lastName: "Lê", position: "Backend Engineer", salary: 32000000, contractType: "permanent" },
    { firstName: "Chi", lastName: "Phạm", position: "Fullstack Developer", salary: 30000000, contractType: "contract" },
    { firstName: "Dũng", lastName: "Nguyễn", position: "DevOps Engineer", salary: 38000000, contractType: "permanent" },
    { firstName: "Giang", lastName: "Vũ", position: "QA Engineer", salary: 28000000, contractType: "permanent" },
    { firstName: "Hải", lastName: "Đặng", position: "Data Engineer", salary: 36000000, contractType: "contract" },
    { firstName: "Khoa", lastName: "Bùi", position: "Mobile Developer", salary: 31000000, contractType: "permanent" },
    { firstName: "Linh", lastName: "Hoàng", position: "Junior Frontend Developer", salary: 22000000, contractType: "contract" },
    { firstName: "Mai", lastName: "Đỗ", position: "Product Owner", salary: 40000000, contractType: "permanent" },
    { firstName: "Nam", lastName: "Trịnh", position: "Security Engineer", salary: 37000000, contractType: "permanent" },
    { firstName: "Phúc", lastName: "Hồ", position: "Software Engineering Intern", salary: 5000000, contractType: "intern" },
    { firstName: "Sang", lastName: "Lý", position: "Platform Engineer", salary: 34000000, contractType: "contract" },
  ],
  [
    { firstName: "Diệp", lastName: "Vương", position: "HR Business Partner", salary: 25000000, contractType: "permanent" },
    { firstName: "Hạnh", lastName: "Tô", position: "Talent Acquisition Specialist", salary: 22000000, contractType: "permanent" },
    { firstName: "Huyền", lastName: "Dương", position: "Compensation & Benefits Specialist", salary: 26000000, contractType: "permanent" },
    { firstName: "Ngọc", lastName: "Lâm", position: "Training Coordinator", salary: 20000000, contractType: "contract" },
    { firstName: "Yến", lastName: "Mai", position: "HR Assistant", salary: 18000000, contractType: "permanent" },
  ],
  [
    { firstName: "Cường", lastName: "Đinh", position: "Senior Account Executive", salary: 40000000, contractType: "permanent" },
    { firstName: "Đức", lastName: "Thái", position: "Account Executive", salary: 32000000, contractType: "permanent" },
    { firstName: "Hào", lastName: "Tạ", position: "Sales Representative", salary: 28000000, contractType: "permanent" },
    { firstName: "Hùng", lastName: "Phùng", position: "Strategic Account Manager", salary: 45000000, contractType: "permanent" },
    { firstName: "Khánh", lastName: "Cao", position: "Business Development Executive", salary: 30000000, contractType: "contract" },
    { firstName: "Loan", lastName: "Trương", position: "Business Analyst", salary: 26000000, contractType: "permanent" },
    { firstName: "Nhi", lastName: "Lương", position: "Inside Sales Specialist", salary: 24000000, contractType: "contract" },
    { firstName: "Phương", lastName: "Đoàn", position: "Customer Success Manager", salary: 31000000, contractType: "permanent" },
    { firstName: "Thắng", lastName: "Quách", position: "Business Development Representative", salary: 22000000, contractType: "contract" },
  ],
  [
    { firstName: "Ánh", lastName: "Lại", position: "Brand Manager", salary: 33000000, contractType: "permanent" },
    { firstName: "Duyên", lastName: "Trần", position: "Content Strategist", salary: 25000000, contractType: "permanent" },
    { firstName: "Hiếu", lastName: "Văn", position: "Digital Marketing Specialist", salary: 27000000, contractType: "permanent" },
    { firstName: "Khôi", lastName: "Đàm", position: "SEO Specialist", salary: 23000000, contractType: "contract" },
    { firstName: "Nhung", lastName: "Lê", position: "Social Media Manager", salary: 26000000, contractType: "permanent" },
    { firstName: "Quân", lastName: "Ngô", position: "Performance Marketing Specialist", salary: 29000000, contractType: "contract" },
    { firstName: "Thảo", lastName: "Kim", position: "Marketing Coordinator", salary: 21000000, contractType: "permanent" },
    { firstName: "Vân", lastName: "Phan", position: "Graphic Designer", salary: 24000000, contractType: "permanent" },
  ],
  [
    { firstName: "Hà", lastName: "Tống", position: "Senior Accountant", salary: 30000000, contractType: "permanent" },
    { firstName: "Liên", lastName: "Hứa", position: "Financial Analyst", salary: 32000000, contractType: "permanent" },
    { firstName: "Oanh", lastName: "Đỗ", position: "Accounts Payable Specialist", salary: 23000000, contractType: "permanent" },
    { firstName: "Thanh", lastName: "Tăng", position: "Tax Specialist", salary: 27000000, contractType: "contract" },
    { firstName: "Trang", lastName: "Lục", position: "Payroll Accountant", salary: 25000000, contractType: "permanent" },
  ],
  [
    { firstName: "Bảo", lastName: "Lê", position: "Senior Business Analyst", salary: 30000000, contractType: "permanent" },
    { firstName: "Cẩm", lastName: "Vũ", position: "Business Systems Analyst", salary: 26000000, contractType: "permanent" },
    { firstName: "Đạt", lastName: "Hoàng", position: "Requirements Analyst", salary: 24000000, contractType: "permanent" },
    { firstName: "Hương", lastName: "Phạm", position: "Solutions Architect", salary: 28000000, contractType: "permanent" },
    { firstName: "Khải", lastName: "Đỗ", position: "Data Analyst", salary: 27000000, contractType: "contract" },
    { firstName: "My", lastName: "Trần", position: "Customer Insights Analyst", salary: 25000000, contractType: "permanent" },
  ],
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const rand = seededRandom(42);

async function seed() {
  await connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const collections = ["employeehistories", "leavebalances", "notifications", "attendances", "leaves", "payrolls", "employees", "departments", "users"];
  for (const col of collections) {
    await mongoose.connection.collection(col).deleteMany({});
  }

  const authService = new AuthService();
  const employeesService = new EmployeesService();
  const departmentsService = new DepartmentsService();
  const leaveBalanceService = new LeaveBalanceService();
  const historyService = new EmployeeHistoryService();

  const userModel = User;

  const admin = await authService.register({ email: "admin@hr.com", password: "admin123" });
  await userModel.findByIdAndUpdate(admin.user.id, { role: "admin" });

  const deptInfos: { _id: any; name: string; managerEmpId: any }[] = [];

  for (const mgrData of MANAGERS) {
    const mgr = await authService.register({ email: mgrData.email, password: "manager123" });
    await userModel.findByIdAndUpdate(mgr.user.id, { role: "manager" });
    const dept = DEPARTMENTS[mgrData.deptIdx];
    const createdDept = await departmentsService.create({
      name: dept.name,
      description: dept.description,
      managerId: mgr.user.id.toString(),
    });
    const mgrEmp = await employeesService.create({
      userId: mgr.user.id.toString(),
      departmentId: createdDept._id.toString(),
      firstName: mgrData.name.split(" ")[1] || mgrData.name,
      lastName: mgrData.name.split(" ")[0] || "",
      position: mgrData.position,
      salary: 50000000 + Math.floor(rand() * 20000000),
      hireDate: new Date(Date.UTC(2022, 0, 1) + Math.floor(rand() * 365 * 86400000)),
      contractType: "permanent",
    });
    deptInfos.push({ _id: createdDept._id, name: createdDept.name, managerEmpId: mgrEmp._id });
  }

  const empInfos: { _id: any; firstName: string; lastName: string }[] = [];
  let empIndex = 1;

  for (let d = 0; d < EMPLOYEES_BY_DEPT.length; d++) {
    const deptInfo = deptInfos[d];
    const empList = EMPLOYEES_BY_DEPT[d];
    for (const empData of empList) {
      const email = `emp${String(empIndex++).padStart(2, "0")}@hr.com`;
      const user = await authService.register({ email, password: "employee123" });
      const hireDate = new Date(Date.UTC(2022, 5, 1) + Math.floor(rand() * 700 * 86400000));
      const emp = await employeesService.create({
        userId: user.user.id.toString(),
        departmentId: deptInfo._id.toString(),
        firstName: empData.firstName,
        lastName: empData.lastName,
        position: empData.position,
        salary: empData.salary,
        hireDate,
        contractType: empData.contractType,
      });
      empInfos.push({ _id: emp._id, firstName: empData.firstName, lastName: empData.lastName });
    }
  }

  const allEmpIds = [...deptInfos.map((d) => d.managerEmpId), ...empInfos.map((e) => e._id)];
  for (const empId of allEmpIds) {
    await leaveBalanceService.findByEmployee(empId.toString());
  }

  for (const empInfo of empInfos) {
    await historyService.create(empInfo._id.toString(), {
      type: "raise",
      newValue: `${((2 + Math.floor(rand() * 4)) * 10).toFixed(0)}tr`,
      effectiveDate: new Date(Date.UTC(2023, 6, 1) + Math.floor(rand() * 365 * 86400000)),
      note: "Đánh giá hiệu suất năm",
    });
  }
  for (const deptInfo of deptInfos) {
    await historyService.create(deptInfo.managerEmpId.toString(), {
      type: "raise",
      newValue: `${((7 + Math.floor(rand() * 3)) * 10).toFixed(0)}tr`,
      effectiveDate: new Date(Date.UTC(2023, 0, 15) + Math.floor(rand() * 90 * 86400000)),
      note: "Điều chỉnh lương quản lý",
    });
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  function getWeekdays(year: number, month: number, maxDay?: number): number[] {
    const days: number[] = [];
    const lastDay = maxDay ?? new Date(year, month, 0).getDate();
    for (let d = 1; d <= lastDay; d++) {
      const dayOfWeek = new Date(year, month - 1, d).getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) days.push(d);
    }
    return days;
  }

  function daysBetween(start: Date, end: Date): number {
    return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  }

  function formatDate(year: number, month: number, day: number, hour: number, minute: number): Date {
    return new Date(Date.UTC(year, month - 1, day, hour, minute));
  }

  const allManagerUsers = await User.find({ role: "manager" });
  const allEmployees = await Employee.find();

  // ----- Attendance: current & previous month -----
  // Map employee -> department index and punctuality profile (0=excellent, 4=unreliable)
  const empProfileMap = new Map<string, number>();
  const empDeptMap = new Map<string, number>();
  for (const emp of allEmployees) {
    const empId = emp._id.toString();
    const deptIdx = deptInfos.findIndex(d => d._id.toString() === (emp as any).departmentId?.toString());
    empDeptMap.set(empId, deptIdx >= 0 ? deptIdx : 0);
    const isManager = deptInfos.some(d => d.managerEmpId.toString() === empId);
    const r = rand();
    if (isManager) {
      empProfileMap.set(empId, r < 0.5 ? 0 : r < 0.85 ? 1 : 2);
    } else {
      empProfileMap.set(empId, r < 0.1 ? 0 : r < 0.35 ? 1 : r < 0.6 ? 2 : r < 0.8 ? 3 : 4);
    }
  }

  // Cumulative thresholds per profile: [absent, halfDay, late]
  const PROFILE_WEIGHTS = [
    [0.02, 0.04, 0.08],
    [0.04, 0.08, 0.18],
    [0.06, 0.14, 0.30],
    [0.10, 0.23, 0.45],
    [0.20, 0.38, 0.60],
  ];

  // Check-in/out hour ranges per profile: [presentCiStart, presentCiEnd, presentCoStart, presentCoEnd, lateCiStart, lateCiEnd, lateCoStart, lateCoEnd]
  const PROFILE_TIMES = [
    [7.0, 7.75, 17.0, 17.5, 9.0, 9.5, 17.0, 17.5],
    [7.25, 8.0, 17.0, 18.0, 9.0, 9.75, 17.0, 18.0],
    [7.5, 8.25, 17.0, 18.0, 9.25, 10.0, 17.0, 18.0],
    [7.75, 8.5, 17.0, 18.0, 9.5, 10.25, 17.0, 18.0],
    [8.0, 8.5, 16.5, 17.5, 9.5, 10.5, 17.0, 18.0],
  ];

  // Day-of-week roll adjustments (negative = worse attendance)
  const DOW_ADJ: Record<number, number> = { 1: -0.04, 2: -0.01, 4: 0.01, 5: -0.02 };

  function randMinutes(startHour: number, endHour: number): number {
    return Math.floor(startHour * 60) + Math.floor(rand() * ((endHour - startHour) * 60));
  }

  const attMonths = [
    { year: currentYear, month: currentMonth, maxDay: now.getDate() },
    { year: currentYear, month: currentMonth - 1 || 12, maxDay: undefined },
  ];
  if (currentMonth === 1) attMonths[1] = { year: currentYear - 1, month: 12, maxDay: undefined };

  const attendanceDocs: any[] = [];
  for (const { year, month, maxDay } of attMonths) {
    const weekdays = getWeekdays(year, month, maxDay);
    for (const emp of allEmployees) {
      const empId = emp._id.toString();
      const profileIdx = empProfileMap.get(empId) ?? 2;
      const thresholds = PROFILE_WEIGHTS[profileIdx];
      const times = PROFILE_TIMES[profileIdx];
      const deptIdx = empDeptMap.get(empId) ?? 0;
      const coExtra = deptIdx === 2 ? 0.5 : deptIdx === 0 ? 0.25 : 0;

      for (const day of weekdays) {
        const dow = new Date(year, month - 1, day).getDay();
        const roll = Math.max(0, Math.min(1, rand() + (DOW_ADJ[dow] ?? 0)));

        let status: string;
        let checkIn: Date | undefined;
        let checkOut: Date | undefined;

        if (roll < thresholds[0]) {
          status = "absent";
        } else if (roll < thresholds[1]) {
          status = "half-day";
          const morningHalf = rand() < 0.5;
          if (morningHalf) {
            const mins = randMinutes(8, 9.5);
            checkIn = formatDate(year, month, day, Math.floor(mins / 60), mins % 60);
            const outMins = randMinutes(12, 13);
            checkOut = formatDate(year, month, day, Math.floor(outMins / 60), outMins % 60);
          } else {
            const mins = randMinutes(7, 8);
            checkIn = formatDate(year, month, day, Math.floor(mins / 60), mins % 60);
            const outMins = randMinutes(11, 12);
            checkOut = formatDate(year, month, day, Math.floor(outMins / 60), outMins % 60);
          }
        } else if (roll < thresholds[2]) {
          status = "late";
          const ci = randMinutes(times[4], times[5]);
          checkIn = formatDate(year, month, day, Math.floor(ci / 60), ci % 60);
          const co = randMinutes(times[6], times[7]) + Math.round(coExtra * 60);
          checkOut = formatDate(year, month, day, Math.floor(co / 60), co % 60);
        } else {
          status = "present";
          const ci = randMinutes(times[0], times[1]);
          checkIn = formatDate(year, month, day, Math.floor(ci / 60), ci % 60);
          const co = randMinutes(times[2], times[3]) + Math.round(coExtra * 60);
          checkOut = formatDate(year, month, day, Math.floor(co / 60), co % 60);
        }
        attendanceDocs.push({
          employeeId: emp._id,
          date: new Date(Date.UTC(year, month - 1, day)),
          checkIn,
          checkOut,
          status,
        });
      }
    }
  }
  await Attendance.insertMany(attendanceDocs);
  console.log(`Attendance: ${attendanceDocs.length} records (${attMonths.length} months)`);

  // ----- Payroll: last 3 months (+ historical) -----
  // Bonus config per department: [minBonus%, maxBonus%, zeroChance]
  const DEPT_BONUS_CFG = [
    { minPct: 0, maxPct: 12, zeroChance: 0.05 },
    { minPct: 0, maxPct: 8, zeroChance: 0.10 },
    { minPct: 5, maxPct: 40, zeroChance: 0.15 },
    { minPct: 0, maxPct: 10, zeroChance: 0.08 },
    { minPct: 0, maxPct: 8, zeroChance: 0.05 },
    { minPct: 0, maxPct: 10, zeroChance: 0.08 },
  ];
  const MGR_BONUS_CFG = { minPct: 0, maxPct: 15, zeroChance: 0.03 };

  function roundMoney(amount: number): number {
    return Math.round(amount / 10000) * 10000;
  }

  // ----- Realistic Vietnamese payroll deductions -----
  const PERSONAL_DEDUCTION = 11000000;
  const DEPENDENT_DEDUCTION = 4400000;

  function calcSocialInsurance(salary: number): number {
    const base = Math.min(salary, 29800000);
    return roundMoney(base * 0.08);
  }

  function calcUnemploymentInsurance(salary: number): number {
    const base = Math.min(salary, 9920000);
    return roundMoney(base * 0.01);
  }

  function calcAccidentInsurance(salary: number): number {
    const base = Math.min(salary, 29800000);
    return roundMoney(base * 0.005);
  }

  function calcUnionFee(salary: number): number {
    return roundMoney(salary * 0.025);
  }

  function calcPIT(taxableIncome: number): number {
    if (taxableIncome <= 0) return 0;
    const brackets = [
      { limit: 5000000, rate: 0.05 },
      { limit: 10000000, rate: 0.10 },
      { limit: 18000000, rate: 0.15 },
      { limit: 32000000, rate: 0.20 },
      { limit: 52000000, rate: 0.25 },
      { limit: 80000000, rate: 0.30 },
      { limit: Infinity, rate: 0.35 },
    ];
    let tax = 0;
    let prev = 0;
    for (const b of brackets) {
      if (taxableIncome <= prev) break;
      const taxable = Math.min(taxableIncome, b.limit) - prev;
      tax += taxable * b.rate;
      prev = b.limit;
    }
    return roundMoney(tax);
  }

  function calcTotalDeductions(salary: number, dependents: number): number {
    const bhxh = calcSocialInsurance(salary);
    const bhtn = calcUnemploymentInsurance(salary);
    const bhtnld = calcAccidentInsurance(salary);
    const unionFee = calcUnionFee(salary);
    const totalInsurance = bhxh + bhtn + bhtnld + unionFee;
    const taxableIncome = salary - totalInsurance - PERSONAL_DEDUCTION - dependents * DEPENDENT_DEDUCTION;
    const pit = calcPIT(Math.max(0, taxableIncome));
    return bhxh + bhtn + bhtnld + unionFee + pit;
  }

  function calcBonus(salary: number, deptIdx: number, isManager: boolean, month: number, year: number): number {
    const cfg = isManager ? MGR_BONUS_CFG : DEPT_BONUS_CFG[deptIdx] ?? DEPT_BONUS_CFG[0];

    // Tet bonus (month 1 or 12): most employees get 1 month salary
    if (month === 1 || month === 12) {
      if (rand() < 0.15) return 0;
      const tetMult = 0.5 + rand() * 1.5;
      return roundMoney(salary * tetMult);
    }

    // Performance bonus (quarter-end months: 3, 6, 9)
    if (month % 3 === 0) {
      if (rand() < 0.10) return 0;
      const pct = cfg.minPct + rand() * (cfg.maxPct - cfg.minPct);
      return roundMoney(salary * pct / 100);
    }

    // Regular month: smaller bonus
    if (rand() < cfg.zeroChance * 2) return 0;
    const pct = cfg.minPct * 0.5 + rand() * (cfg.maxPct * 0.4);
    return roundMoney(salary * pct / 100);
  }

  const payrollDocs: any[] = [];
  for (let offset = 0; offset < 3; offset++) {
    let m = currentMonth - offset;
    let y = currentYear;
    if (m <= 0) {
      m += 12;
      y -= 1;
    }
    for (const emp of allEmployees) {
      const basicSalary = (emp as any).salary ?? 3000;
      const empId = emp._id.toString();
      const deptIdx = empDeptMap.get(empId) ?? 0;
      const isManager = deptInfos.some(d => d.managerEmpId.toString() === empId);
      const isDraft = offset === 0;

      const bonus = calcBonus(basicSalary, deptIdx, isManager, m, y);
      const dependents = Math.floor(rand() * 3);
      const deductions = calcTotalDeductions(basicSalary, dependents);
      const netPay = roundMoney(basicSalary + bonus - deductions);

      payrollDocs.push({
        employeeId: emp._id,
        month: m,
        year: y,
        basicSalary,
        bonus,
        deductions,
        netPay,
        status: isDraft ? "draft" : "paid",
        paidAt: isDraft ? undefined : new Date(Date.UTC(y, m - 1, Math.floor(rand() * 25) + 1)),
      });
    }
  }

  // Historical payrolls: one record per employee for previous year months (no overlap with current 3 months)
  const usedCombos = new Set<string>();
  for (let offset = 0; offset < 3; offset++) {
    let m = currentMonth - offset;
    let y = currentYear;
    if (m <= 0) { m += 12; y -= 1; }
    for (const emp of allEmployees) {
      usedCombos.add(`${emp._id}-${m}-${y}`);
    }
  }

  for (const emp of allEmployees) {
    const empId = emp._id.toString();
    const deptIdx = empDeptMap.get(empId) ?? deptInfos.findIndex(d => d._id.toString() === (emp as any).departmentId?.toString());
    const actualDeptIdx = deptIdx >= 0 ? deptIdx : 0;
    const isManager = deptInfos.some(d => d.managerEmpId.toString() === empId);
    const basicSalary = (emp as any).salary ?? 3000;

    // Pick 1-2 random months from previous year that don't overlap
    const candidateMonths = Array.from({ length: 12 }, (_, i) => i + 1).filter(m => !usedCombos.has(`${empId}-${m}-${currentYear - 1}`));
    const numRecords = Math.min(1 + Math.floor(rand() * 2), candidateMonths.length);

    for (let r = 0; r < numRecords; r++) {
      const mIdx = Math.floor(rand() * candidateMonths.length);
      const m = candidateMonths.splice(mIdx, 1)[0];
      if (m === undefined) break;
      const y = currentYear - 1;

      const bonus = calcBonus(basicSalary, actualDeptIdx, isManager, m, y);
      const dependents = Math.floor(rand() * 3);
      const deductions = calcTotalDeductions(basicSalary, dependents);
      const netPay = roundMoney(basicSalary + bonus - deductions);

      payrollDocs.push({
        employeeId: emp._id,
        month: m,
        year: y,
        basicSalary,
        bonus,
        deductions,
        netPay,
        status: "paid",
        paidAt: new Date(Date.UTC(y, m - 1, Math.floor(rand() * 25) + 1)),
      });
    }
  }
  await Payroll.insertMany(payrollDocs);
  console.log(`Payroll: ${payrollDocs.length} records`);

  // ----- Leaves -----
  const leaveTypes: ("annual" | "sick" | "personal")[] = ["annual", "sick", "personal"];
  const leaveReasons: Record<string, string[]> = {
    annual: ["Du lịch gia đình", "Du lịch cá nhân", "Nghỉ cuối năm", "Nghỉ tại nhà"],
    sick: ["Cảm thấy không khỏe", "Hẹn khám bệnh", "Hồi phục sau cúm", "Phẫu thuật răng"],
    personal: ["Sự kiện gia đình", "Việc cá nhân", "Sửa chữa nhà cửa", "Ngày lễ tôn giáo"],
  };
  const leaveDocs: any[] = [];
  const balanceUpdates: Map<string, { annualUsed: number; sickUsed: number; personalUsed: number }> = new Map();

  for (const emp of allEmployees) {
    const numLeaves = 1 + Math.floor(rand() * 3);
    for (let l = 0; l < numLeaves; l++) {
      const type = leaveTypes[Math.floor(rand() * leaveTypes.length)];
      const reasons = leaveReasons[type];
      const daysCount = 1 + Math.floor(rand() * 5);
      const startDay = 1 + Math.floor(rand() * 20);
      const leaveMonth = 1 + Math.floor(rand() * 12);
      let leaveYear = currentYear;
      if (leaveMonth > currentMonth) leaveYear = currentYear - 1;
      const startDate = new Date(Date.UTC(leaveYear, leaveMonth - 1, startDay));
      const endDate = new Date(Date.UTC(leaveYear, leaveMonth - 1, Math.min(startDay + daysCount - 1, 28)));

      const statusRoll = rand();
      let status: string;
      if (statusRoll < 0.5) {
        status = "approved";
      } else if (statusRoll < 0.75) {
        status = "pending";
      } else {
        status = "rejected";
      }

      const doc: any = {
        employeeId: emp._id,
        type,
        startDate,
        endDate,
        status,
        reason: reasons[Math.floor(rand() * reasons.length)],
      };

      if (status === "approved") {
        const mgr = allManagerUsers[Math.floor(rand() * allManagerUsers.length)];
        doc.approvedBy = mgr._id;
        // Track balance usage
        const empKey = emp._id.toString();
        if (!balanceUpdates.has(empKey)) {
          balanceUpdates.set(empKey, { annualUsed: 0, sickUsed: 0, personalUsed: 0 });
        }
        const used = daysBetween(startDate, endDate);
        const bal = balanceUpdates.get(empKey)!;
        if (type === "annual") bal.annualUsed += used;
        else if (type === "sick") bal.sickUsed += used;
        else bal.personalUsed += used;
      }
      if (status === "rejected") {
        doc.rejectionReason = "Không đủ ngày phép";
      }

      leaveDocs.push(doc);
    }
  }
  await Leave.insertMany(leaveDocs);

  // Update leave balances to reflect approved leaves
  for (const [empIdStr, used] of balanceUpdates) {
    await LeaveBalance.findOneAndUpdate(
      { employeeId: new mongoose.Types.ObjectId(empIdStr) },
      {
        $inc: {
          annualUsed: used.annualUsed,
          sickUsed: used.sickUsed,
          personalUsed: used.personalUsed,
        },
      },
    );
  }

  // Also give some extra used days to managers
  for (const deptInfo of deptInfos) {
    const usedDays = Math.floor(rand() * 6);
    await LeaveBalance.findOneAndUpdate({ employeeId: deptInfo.managerEmpId }, { $inc: { annualUsed: usedDays } });
  }

  console.log(`Leaves: ${leaveDocs.length} records across ${allEmployees.length} employees`);
  console.log(`Leave balances updated for approved leaves`);

  console.log("\nSeed data created successfully!");
  console.log(`Admin:       admin@hr.com / admin123`);
  console.log(`Managers:    ${MANAGERS.map((m) => m.email.split("@")[0] + "@hr.com").join(", ")}`);
  console.log(`Employees:   ${empInfos.length} employees (emp01@hr.com .. emp${String(empInfos.length).padStart(2, "0")}@hr.com)`);
  console.log(`Password:    employee123 / manager123`);
  console.log(`Total:       ${1 + MANAGERS.length + empInfos.length} users across ${DEPARTMENTS.length} departments`);
  console.log(`Attendance:  ${attendanceDocs.length} records`);
  console.log(`Payroll:     ${payrollDocs.length} records`);
  console.log(`Leaves:      ${leaveDocs.length} records`);
  console.log("\n");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
