import { http, HttpResponse } from 'msw';

const API_BASE = '*/api';

export const handlers = [
  // Auth
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as any;
    if (body.email === 'admin@test.com' && body.password === 'Password1') {
      return HttpResponse.json({
        token: 'test-token-admin',
        user: { id: '1', email: 'admin@test.com', role: 'admin', name: 'Admin' },
      });
    }
    if (body.email === 'employee@test.com' && body.password === 'Password1') {
      return HttpResponse.json({
        token: 'test-token-employee',
        user: { id: '2', email: 'employee@test.com', role: 'employee', name: 'Employee' },
      });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  http.get(`${API_BASE}/auth/me`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'No token provided' }, { status: 401 });
    }
    return HttpResponse.json({ id: '1', email: 'admin@test.com', role: 'admin', name: 'Admin' });
  }),

  // Dashboard
  http.get(`${API_BASE}/dashboard`, () => {
    return HttpResponse.json({
      totalEmployees: 50,
      totalDepartments: 6,
      pendingLeaves: 5,
      presentToday: 42,
      monthlyPayroll: 250000,
      departmentStats: [
        { name: 'Engineering', count: 20 },
        { name: 'Marketing', count: 10 },
      ],
      recentLeaves: [],
    });
  }),

  // Employees
  http.get(`${API_BASE}/employees`, () => {
    return HttpResponse.json({
      data: [
        {
          _id: '1',
          firstName: 'John',
          lastName: 'Doe',
          position: 'Developer',
          salary: 50000,
          userId: { _id: '1', email: 'john@test.com' },
          departmentId: { _id: 'd1', name: 'Engineering' },
          phone: '0123456789',
          hireDate: '2024-01-01',
          contractType: 'permanent',
          documents: [],
        },
      ],
      meta: { page: 1, limit: 20, total: 1 },
    });
  }),

  http.get(`${API_BASE}/employees/:id`, ({ params }) => {
    return HttpResponse.json({
      _id: params.id,
      firstName: 'John',
      lastName: 'Doe',
      position: 'Developer',
      salary: 50000,
      userId: { _id: '1', email: 'john@test.com' },
      departmentId: { _id: 'd1', name: 'Engineering' },
      hireDate: '2024-01-01',
      documents: [],
    });
  }),

  // Departments
  http.get(`${API_BASE}/departments`, () => {
    return HttpResponse.json({
      data: [
        { _id: 'd1', name: 'Engineering', description: 'Tech dept', managerId: { _id: 'u1', email: 'manager@test.com' } },
        { _id: 'd2', name: 'Marketing', description: 'Mkt dept', managerId: null },
      ],
      meta: { page: 1, limit: 20, total: 2 },
    });
  }),

  // Leaves
  http.get(`${API_BASE}/leaves`, () => {
    return HttpResponse.json({
      data: [
        {
          _id: 'l1',
          type: 'annual',
          startDate: '2025-06-01',
          endDate: '2025-06-03',
          status: 'pending',
          reason: 'Vacation',
          employeeId: { _id: '1', firstName: 'John', lastName: 'Doe' },
        },
      ],
      meta: { page: 1, limit: 20, total: 1 },
    });
  }),

  http.post(`${API_BASE}/leaves`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      _id: 'l2',
      ...body,
      status: 'pending',
    }, { status: 201 });
  }),

  // Leave Balance
  http.get(`${API_BASE}/leave-balance/:employeeId`, () => {
    return HttpResponse.json({
      _id: 'lb1',
      employeeId: '1',
      annualTotal: 12,
      annualUsed: 2,
      sickTotal: 30,
      sickUsed: 0,
      personalTotal: 3,
      personalUsed: 1,
    });
  }),

  // Attendance
  http.get(`${API_BASE}/attendance`, () => {
    return HttpResponse.json([
      { _id: 'a1', date: '2025-06-01', checkIn: '2025-06-01T08:00:00Z', checkOut: '2025-06-01T17:00:00Z', status: 'present', employeeId: { _id: '1', firstName: 'John', lastName: 'Doe' } },
    ]);
  }),

  http.post(`${API_BASE}/attendance/check-in`, () => {
    return HttpResponse.json({ _id: 'a2', date: new Date().toISOString(), checkIn: new Date().toISOString(), status: 'present' }, { status: 201 });
  }),

  // Payroll
  http.get(`${API_BASE}/payroll`, () => {
    return HttpResponse.json({
      data: [
        { _id: 'p1', month: 6, year: 2025, basicSalary: 50000, bonus: 1000, deductions: 5000, netPay: 46000, status: 'paid', paidAt: '2025-06-01', employeeId: { _id: '1', firstName: 'John', lastName: 'Doe' } },
      ],
      meta: { page: 1, limit: 20, total: 1 },
    });
  }),

  // Notifications
  http.get(`${API_BASE}/notifications`, () => {
    return HttpResponse.json([
      { _id: 'n1', title: 'Leave approved', message: 'Your leave has been approved', type: 'leave_approved', isRead: false, createdAt: '2025-06-01T10:00:00Z' },
      { _id: 'n2', title: 'Payroll ready', message: 'Your payroll is ready', type: 'payroll_ready', isRead: true, createdAt: '2025-06-01T09:00:00Z' },
    ]);
  }),

  http.get(`${API_BASE}/notifications/unread-count`, () => {
    return HttpResponse.json(1);
  }),

  // Org chart
  http.get(`${API_BASE}/employees/export`, () => {
    return HttpResponse.text('firstName,lastName\nJohn,Doe\n');
  }),
];
