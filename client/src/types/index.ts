export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  name?: string;
  hasEmployeeProfile?: boolean;
}

export interface AuthResponse {
  user: User;
}

export interface Employee {
  id: string;
  userId: User | string;
  departmentId: Department | string;
  firstName: string;
  lastName: string;
  position: string;
  salary: number;
  hireDate: string;
  phone?: string;
  contractType?: string;
  contractExpiry?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: User | string;
  createdAt: string;
  updatedAt: string;
}

export interface Leave {
  id: string;
  employeeId: Employee | string;
  type: 'sick' | 'annual' | 'personal';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: User | string;
  reason?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  employeeId: Employee | string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'late' | 'absent' | 'half-day';
  note?: string;
}

export interface Payroll {
  id: string;
  employeeId: Employee | string;
  month: number;
  year: number;
  basicSalary: number;
  bonus: number;
  socialInsurance: number;
  healthInsurance: number;
  unemploymentInsurance: number;
  unionDues: number;
  pit: number;
  totalDeductions: number;
  netPay: number;
  status: 'draft' | 'paid';
  paidAt?: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  annualTotal: number;
  annualUsed: number;
  sickTotal: number;
  sickUsed: number;
  personalTotal: number;
  personalUsed: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message?: string;
  type: 'leave_request' | 'leave_approved' | 'leave_rejected' | 'payroll_ready' | 'system';
  relatedId?: string;
  relatedModel?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}

export interface PaginatedQueryParams {
  page?: number;
  limit?: number;
}

export interface AttendanceQueryParams extends PaginatedQueryParams {
  from?: string;
  to?: string;
  employeeId?: string;
  status?: string;
}

export interface DepartmentQueryParams extends PaginatedQueryParams {
  search?: string;
}

export interface EmployeeQueryParams extends PaginatedQueryParams {
  search?: string;
  departmentId?: string;
}

export interface LeaveQueryParams extends PaginatedQueryParams {
  status?: string;
  employeeId?: string;
  type?: string;
}

export interface PayrollQueryParams extends PaginatedQueryParams {
  month?: number;
  year?: number;
  employeeId?: string;
  status?: string;
}

export interface CreateEmployeeRequest {
  userId: string;
  departmentId: string;
  firstName: string;
  lastName: string;
  position: string;
  salary: number;
  hireDate: string;
  phone?: string;
  contractType?: string;
  contractExpiry?: string;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  managerId?: string;
}

export interface CreateLeaveRequest {
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface UpdateLeaveStatusRequest {
  status: string;
  rejectionReason?: string;
}

export interface ProcessPayrollRequest {
  employeeIds: string[];
  month: number;
  year: number;
}
