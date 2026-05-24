export interface User {
  id: string;
  _id?: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Employee {
  _id: string;
  userId: User | string;
  departmentId: Department | string;
  firstName: string;
  lastName: string;
  position: string;
  salary: number;
  hireDate: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  _id: string;
  name: string;
  description?: string;
  managerId?: User | string;
  createdAt: string;
  updatedAt: string;
}

export interface Leave {
  _id: string;
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
  _id: string;
  employeeId: Employee | string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'late' | 'absent' | 'half-day';
  note?: string;
}

export interface Payroll {
  _id: string;
  employeeId: Employee | string;
  month: number;
  year: number;
  basicSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: 'draft' | 'paid';
  paidAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}
