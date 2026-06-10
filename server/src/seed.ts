import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { EmployeesService } from './employees/employees.service';
import { DepartmentsService } from './departments/departments.service';
import { LeaveBalanceService } from './leave-balance/leave-balance.service';
import { EmployeeHistoryService } from './employee-history/employee-history.service';

const DEPARTMENTS = [
  { name: 'Engineering', description: 'Software development & infrastructure' },
  { name: 'Human Resources', description: 'Talent management & culture' },
  { name: 'Sales', description: 'Revenue & client acquisition' },
  { name: 'Marketing', description: 'Brand & demand generation' },
  { name: 'Finance', description: 'Accounting & financial planning' },
  { name: 'Business Analysis', description: 'Customer requirements analysis & solution design' },
];

const MANAGERS: { email: string; name: string; deptIdx: number; position: string }[] = [
  { email: 'eng.manager@hr.com', name: 'Minh Tuấn', deptIdx: 0, position: 'Engineering Director' },
  { email: 'hr.manager@hr.com', name: 'Thu Hương', deptIdx: 1, position: 'HR Director' },
  { email: 'sales.manager@hr.com', name: 'Quốc Bảo', deptIdx: 2, position: 'Sales Director' },
  { email: 'mkt.manager@hr.com', name: 'Lan Chi', deptIdx: 3, position: 'Marketing Director' },
  { email: 'fin.manager@hr.com', name: 'Hoàng Nam', deptIdx: 4, position: 'Finance Director' },
  { email: 'ba.manager@hr.com', name: 'Minh Anh', deptIdx: 5, position: 'BA Director' },
];

const EMPLOYEES_BY_DEPT: { firstName: string; lastName: string; position: string; salary: number; contractType: string }[][] = [
  [
    { firstName: 'Anh', lastName: 'Trần', position: 'Senior Frontend Engineer', salary: 3500, contractType: 'permanent' },
    { firstName: 'Bình', lastName: 'Lê', position: 'Backend Engineer', salary: 3200, contractType: 'permanent' },
    { firstName: 'Chi', lastName: 'Phạm', position: 'Fullstack Developer', salary: 3000, contractType: 'contract' },
    { firstName: 'Dũng', lastName: 'Nguyễn', position: 'DevOps Engineer', salary: 3800, contractType: 'permanent' },
    { firstName: 'Giang', lastName: 'Vũ', position: 'QA Engineer', salary: 2800, contractType: 'permanent' },
    { firstName: 'Hải', lastName: 'Đặng', position: 'Data Engineer', salary: 3600, contractType: 'contract' },
    { firstName: 'Khoa', lastName: 'Bùi', position: 'Mobile Developer', salary: 3100, contractType: 'permanent' },
    { firstName: 'Linh', lastName: 'Hoàng', position: 'Junior Frontend Engineer', salary: 2200, contractType: 'contract' },
    { firstName: 'Mai', lastName: 'Đỗ', position: 'Product Owner', salary: 4000, contractType: 'permanent' },
    { firstName: 'Nam', lastName: 'Trịnh', position: 'Security Engineer', salary: 3700, contractType: 'permanent' },
    { firstName: 'Phúc', lastName: 'Hồ', position: 'Intern Developer', salary: 1000, contractType: 'intern' },
    { firstName: 'Sang', lastName: 'Lý', position: 'Platform Engineer', salary: 3400, contractType: 'contract' },
  ],
  [
    { firstName: 'Diệp', lastName: 'Vương', position: 'HR Business Partner', salary: 2500, contractType: 'permanent' },
    { firstName: 'Hạnh', lastName: 'Tô', position: 'Recruiter', salary: 2200, contractType: 'permanent' },
    { firstName: 'Huyền', lastName: 'Dương', position: 'Compensation & Benefits Specialist', salary: 2600, contractType: 'permanent' },
    { firstName: 'Ngọc', lastName: 'Lâm', position: 'Training Coordinator', salary: 2000, contractType: 'contract' },
    { firstName: 'Yến', lastName: 'Mai', position: 'HR Assistant', salary: 1800, contractType: 'permanent' },
  ],
  [
    { firstName: 'Cường', lastName: 'Đinh', position: 'Senior Account Executive', salary: 4000, contractType: 'permanent' },
    { firstName: 'Đức', lastName: 'Thái', position: 'Account Executive', salary: 3200, contractType: 'permanent' },
    { firstName: 'Hào', lastName: 'Tạ', position: 'Sales Representative', salary: 2800, contractType: 'permanent' },
    { firstName: 'Hùng', lastName: 'Phùng', position: 'Key Account Manager', salary: 4500, contractType: 'permanent' },
    { firstName: 'Khánh', lastName: 'Cao', position: 'Business Development', salary: 3000, contractType: 'contract' },
    { firstName: 'Loan', lastName: 'Trương', position: 'Sales Operations Analyst', salary: 2600, contractType: 'permanent' },
    { firstName: 'Nhi', lastName: 'Lương', position: 'Inside Sales', salary: 2400, contractType: 'contract' },
    { firstName: 'Phương', lastName: 'Đoàn', position: 'Customer Success Manager', salary: 3100, contractType: 'permanent' },
    { firstName: 'Thắng', lastName: 'Quách', position: 'Sales Development Rep', salary: 2200, contractType: 'contract' },
  ],
  [
    { firstName: 'Ánh', lastName: 'Lại', position: 'Brand Manager', salary: 3300, contractType: 'permanent' },
    { firstName: 'Duyên', lastName: 'Trần', position: 'Content Strategist', salary: 2500, contractType: 'permanent' },
    { firstName: 'Hiếu', lastName: 'Văn', position: 'Digital Marketing Specialist', salary: 2700, contractType: 'permanent' },
    { firstName: 'Khôi', lastName: 'Đàm', position: 'SEO Specialist', salary: 2300, contractType: 'contract' },
    { firstName: 'Nhung', lastName: 'Lê', position: 'Social Media Manager', salary: 2600, contractType: 'permanent' },
    { firstName: 'Quân', lastName: 'Ngô', position: 'Performance Marketing', salary: 2900, contractType: 'contract' },
    { firstName: 'Thảo', lastName: 'Kim', position: 'Marketing Coordinator', salary: 2100, contractType: 'permanent' },
    { firstName: 'Vân', lastName: 'Phan', position: 'Graphic Designer', salary: 2400, contractType: 'permanent' },
  ],
  [
    { firstName: 'Hà', lastName: 'Tống', position: 'Senior Accountant', salary: 3000, contractType: 'permanent' },
    { firstName: 'Liên', lastName: 'Hứa', position: 'Financial Analyst', salary: 3200, contractType: 'permanent' },
    { firstName: 'Oanh', lastName: 'Đỗ', position: 'Accounts Payable', salary: 2300, contractType: 'permanent' },
    { firstName: 'Thanh', lastName: 'Tăng', position: 'Tax Specialist', salary: 2700, contractType: 'contract' },
    { firstName: 'Trang', lastName: 'Lục', position: 'Payroll Accountant', salary: 2500, contractType: 'permanent' },
  ],
  [
    { firstName: 'Bảo', lastName: 'Lê', position: 'Senior Business Analyst', salary: 3000, contractType: 'permanent' },
    { firstName: 'Cẩm', lastName: 'Vũ', position: 'Business Analyst', salary: 2600, contractType: 'permanent' },
    { firstName: 'Đạt', lastName: 'Hoàng', position: 'Requirements Analyst', salary: 2400, contractType: 'permanent' },
    { firstName: 'Hương', lastName: 'Phạm', position: 'Solution Analyst', salary: 2800, contractType: 'permanent' },
    { firstName: 'Khải', lastName: 'Đỗ', position: 'Data Analyst', salary: 2700, contractType: 'contract' },
    { firstName: 'My', lastName: 'Trần', position: 'Customer Insights Specialist', salary: 2500, contractType: 'permanent' },
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
  const app = await NestFactory.createApplicationContext(AppModule);

  // Clear all existing data (auto-seed may have run on startup)
  const conn = app.get(getConnectionToken());
  const client = conn.getClient();
  const db = client.db();
  const collections = ['employeehistories', 'leavebalances', 'notifications', 'attendances', 'leaves', 'payrolls', 'employees', 'departments', 'users'];
  for (const col of collections) {
    await db.collection(col).deleteMany({});
  }
  const authService = app.get(AuthService);
  const employeesService = app.get(EmployeesService);
  const departmentsService = app.get(DepartmentsService);
  const leaveBalanceService = app.get(LeaveBalanceService);
  const historyService = app.get(EmployeeHistoryService);

  // 1. Admin
  const admin = await authService.register({ email: 'admin@hr.com', password: 'admin123', role: 'admin' });

  // 2. Managers + departments
  interface DeptInfo { _id: any; name: string; managerEmpId: any }
  const deptInfos: DeptInfo[] = [];

  for (const mgrData of MANAGERS) {
    const mgr = await authService.register({ email: mgrData.email, password: 'manager123', role: 'manager' });
    const dept = DEPARTMENTS[mgrData.deptIdx];
    const createdDept = await departmentsService.create({
      name: dept.name,
      description: dept.description,
      managerId: mgr.user.id.toString(),
    });
    const mgrEmp = await employeesService.create({
      userId: mgr.user.id.toString(),
      departmentId: createdDept._id.toString(),
      firstName: mgrData.name.split(' ')[1] || mgrData.name,
      lastName: mgrData.name.split(' ')[0] || '',
      position: mgrData.position,
      salary: 5000 + Math.floor(rand() * 2000),
      hireDate: new Date(Date.UTC(2022, 0, 1) + Math.floor(rand() * 365 * 86400000)),
      contractType: 'permanent',
    });
    deptInfos.push({ _id: createdDept._id, name: createdDept.name, managerEmpId: mgrEmp._id });
  }

  // 3. Employees
  interface EmpInfo { _id: any; firstName: string; lastName: string }
  const empInfos: EmpInfo[] = [];
  let empIndex = 1;

  for (let d = 0; d < EMPLOYEES_BY_DEPT.length; d++) {
    const deptInfo = deptInfos[d];
    const empList = EMPLOYEES_BY_DEPT[d];
    for (const empData of empList) {
      const email = `emp${String(empIndex++).padStart(2, '0')}@hr.com`;
      const user = await authService.register({ email, password: 'employee123', role: 'employee' });
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

  // 4. Leave balances
  const allEmpIds = [...deptInfos.map(d => d.managerEmpId), ...empInfos.map(e => e._id)];
  for (const empId of allEmpIds) {
    await leaveBalanceService.findByEmployee(empId.toString());
  }

  // 5. Employee history entries
  for (const empInfo of empInfos) {
    await historyService.create(empInfo._id.toString(), {
      type: 'raise',
      newValue: `$${(2 + Math.floor(rand() * 4)).toFixed(1)}k`,
      effectiveDate: new Date(Date.UTC(2023, 6, 1) + Math.floor(rand() * 365 * 86400000)),
      note: 'Annual performance review',
    });
  }
  for (const deptInfo of deptInfos) {
    await historyService.create(deptInfo.managerEmpId.toString(), {
      type: 'raise',
      newValue: `$${(7 + Math.floor(rand() * 3)).toFixed(1)}k`,
      effectiveDate: new Date(Date.UTC(2023, 0, 15) + Math.floor(rand() * 90 * 86400000)),
      note: 'Leadership adjustment',
    });
  }

  console.log('\n=== Seed data created successfully! ===');
  console.log(`Admin:       admin@hr.com / admin123`);
  console.log(`Managers:    ${MANAGERS.map(m => m.email.split('@')[0] + '@hr.com').join(', ')}`);
  console.log(`Employees:   ${empInfos.length} employees (emp01@hr.com .. emp${String(empInfos.length).padStart(2, '0')}@hr.com)`);
  console.log(`Password:    employee123 / manager123`);
  console.log(`Total:       ${1 + MANAGERS.length + empInfos.length} users across ${DEPARTMENTS.length} departments`);
  console.log('========================================\n');

  await app.close();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
