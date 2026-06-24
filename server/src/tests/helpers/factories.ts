import bcrypt from 'bcryptjs';
import { User } from '../../models/user.model.js';
import { Department } from '../../models/department.model.js';
import { Employee } from '../../models/employee.model.js';
import { Leave } from '../../models/leave.model.js';
import { Attendance } from '../../models/attendance.model.js';
import { Payroll } from '../../models/payroll.model.js';
import { LeaveBalance } from '../../models/leave-balance.model.js';
import { EmployeeHistory } from '../../models/employee-history.model.js';
import { Notification } from '../../models/notification.model.js';
import { Types } from 'mongoose';

export async function createUser(overrides: Partial<{
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'employee';
  name: string;
  isActive: boolean;
}> = {}) {
  const passwordHash = await bcrypt.hash(overrides.password || 'Password1', 10);
  return User.create({
    email: overrides.email || `user_${Date.now()}@test.com`,
    passwordHash,
    role: overrides.role || 'employee',
    name: overrides.name || 'Test User',
    isActive: overrides.isActive ?? true,
  });
}

export async function createDepartment(overrides: Partial<{
  name: string;
  description: string;
}> = {}) {
  return Department.create({
    name: overrides.name || `Dept_${Date.now()}`,
    description: overrides.description || 'Test department',
  });
}

export async function createEmployee(userId: Types.ObjectId, departmentId: Types.ObjectId, overrides: Partial<{
  firstName: string;
  lastName: string;
  position: string;
  salary: number;
  hireDate: Date;
  contractType: 'permanent' | 'contract' | 'intern';
  phone: string;
}> = {}) {
  return Employee.create({
    userId,
    departmentId,
    firstName: overrides.firstName || 'John',
    lastName: overrides.lastName || 'Doe',
    position: overrides.position || 'Developer',
    salary: overrides.salary || 50000,
    hireDate: overrides.hireDate || new Date('2024-01-01'),
    contractType: overrides.contractType || 'permanent',
    phone: overrides.phone || '0123456789',
  });
}

export async function createLeave(employeeId: Types.ObjectId, overrides: Partial<{
  type: 'sick' | 'annual' | 'personal';
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  rejectionReason: string;
  approvedBy: Types.ObjectId;
}> = {}) {
  const start = overrides.startDate || new Date('2025-06-01');
  const end = overrides.endDate || new Date('2025-06-03');
  return Leave.create({
    employeeId,
    type: overrides.type || 'annual',
    startDate: start,
    endDate: end,
    status: overrides.status || 'pending',
    reason: overrides.reason || 'Vacation',
    rejectionReason: overrides.rejectionReason,
    approvedBy: overrides.approvedBy,
  });
}

export async function createAttendance(employeeId: Types.ObjectId, date: Date, overrides: Partial<{
  checkIn: Date;
  checkOut: Date;
  status: 'present' | 'late' | 'absent' | 'half-day';
}> = {}) {
  return Attendance.create({
    employeeId,
    date,
    checkIn: overrides.checkIn || new Date(date.setHours(8, 0, 0, 0)),
    checkOut: overrides.checkOut,
    status: overrides.status || 'present',
  });
}

export async function createPayroll(employeeId: Types.ObjectId, month: number, year: number, overrides: Partial<{
  basicSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: 'draft' | 'paid';
}> = {}) {
  return Payroll.create({
    employeeId,
    month,
    year,
    basicSalary: overrides.basicSalary || 50000,
    bonus: overrides.bonus || 0,
    deductions: overrides.deductions || 0,
    netPay: overrides.netPay || 50000,
    status: overrides.status || 'draft',
  });
}

export async function createLeaveBalance(employeeId: Types.ObjectId, overrides: Partial<{
  annualTotal: number;
  annualUsed: number;
  sickTotal: number;
  sickUsed: number;
  personalTotal: number;
  personalUsed: number;
}> = {}) {
  return LeaveBalance.create({
    employeeId,
    annualTotal: overrides.annualTotal ?? 12,
    annualUsed: overrides.annualUsed ?? 0,
    sickTotal: overrides.sickTotal ?? 30,
    sickUsed: overrides.sickUsed ?? 0,
    personalTotal: overrides.personalTotal ?? 3,
    personalUsed: overrides.personalUsed ?? 0,
  });
}

export async function createEmployeeHistory(employeeId: Types.ObjectId, overrides: Partial<{
  type: 'raise' | 'promotion' | 'transfer' | 'other';
  previousValue: string;
  newValue: string;
  effectiveDate: Date;
  note: string;
}> = {}) {
  return EmployeeHistory.create({
    employeeId,
    type: overrides.type || 'raise',
    previousValue: overrides.previousValue,
    newValue: overrides.newValue || 'Senior Developer',
    effectiveDate: overrides.effectiveDate || new Date('2025-01-01'),
    note: overrides.note || 'Promotion',
  });
}

export async function createNotification(userId: Types.ObjectId, overrides: Partial<{
  title: string;
  message: string;
  type: 'leave_request' | 'leave_approved' | 'leave_rejected' | 'payroll_ready' | 'system';
  relatedId: Types.ObjectId;
  relatedModel: string;
  isRead: boolean;
}> = {}) {
  return Notification.create({
    userId,
    title: overrides.title || 'Test notification',
    message: overrides.message || 'This is a test notification',
    type: overrides.type || 'system',
    relatedId: overrides.relatedId,
    relatedModel: overrides.relatedModel,
    isRead: overrides.isRead ?? false,
  });
}
