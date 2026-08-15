import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:3001/api';

const mockUser = {
  id: 'user-1',
  email: 'admin@example.com',
  role: 'employee' as const,
  name: 'Admin User',
};

const mockEmployee = {
  id: 'emp-1',
  userId: { id: 'user-1', email: 'admin@example.com', role: 'admin', name: 'Admin User' },
  departmentId: { id: 'dept-1', name: 'Engineering' },
  firstName: 'John',
  lastName: 'Doe',
  position: 'Developer',
  salary: 15000000,
  hireDate: '2024-01-01',
  phone: '0123456789',
  contractType: 'full-time',
  contractExpiry: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockLeaves = [
  {
    id: 'leave-1',
    employeeId: { id: 'emp-1', firstName: 'John', lastName: 'Doe', position: 'Developer' },
    type: 'annual',
    startDate: '2025-06-01',
    endDate: '2025-06-03',
    status: 'pending',
    reason: 'Vacation',
    rejectionReason: null,
    createdAt: '2025-05-01T00:00:00Z',
  },
];

const mockAttendance = [
  {
    id: 'att-1',
    employeeId: { id: 'emp-1', firstName: 'John', lastName: 'Doe', position: 'Developer' },
    date: '2025-06-01',
    checkIn: '2025-06-01T08:30:00Z',
    checkOut: '2025-06-01T17:30:00Z',
    status: 'present',
    note: null,
  },
];

const mockPayroll = [
  {
    id: 'pay-1',
    employeeId: { id: 'emp-1', firstName: 'John', lastName: 'Doe', position: 'Developer', salary: 15000000 },
    month: 6,
    year: 2025,
    basicSalary: 15000000,
    bonus: 0,
    socialInsurance: 1200000,
    healthInsurance: 225000,
    unemploymentInsurance: 150000,
    unionDues: 150000,
    pit: 0,
    totalDeductions: 1725000,
    netPay: 13275000,
    status: 'draft',
    paidAt: null,
    createdAt: '2025-06-30T00:00:00Z',
  },
];

const mockDepartments = [
  {
    id: 'dept-1',
    name: 'Engineering',
    description: 'Engineering department',
    managerId: { id: 'user-1', email: 'admin@example.com', role: 'admin', name: 'Admin User' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockNotifications = [
  {
    id: 'notif-1',
    userId: 'user-1',
    title: 'Leave Approved',
    message: 'Your leave has been approved.',
    type: 'leave_approved',
    relatedId: 'leave-1',
    relatedModel: 'Leave',
    isRead: false,
    createdAt: '2025-06-01T00:00:00Z',
  },
];

const mockLeaveBalance = {
  id: 'lb-1',
  employeeId: 'emp-1',
  annualTotal: 12,
  annualUsed: 2,
  sickTotal: 30,
  sickUsed: 0,
  personalTotal: 5,
  personalUsed: 1,
};

const paginatedWrapper = (data: unknown[]) => ({
  data,
  meta: { page: 1, limit: 10, total: data.length },
});

export const handlers = [
  // Auth
  http.post(`${API_BASE}/auth/login`, () => {
    return HttpResponse.json({ token: 'fake-jwt-token', user: mockUser });
  }),

  http.post(`${API_BASE}/auth/register`, () => {
    return HttpResponse.json({ token: 'fake-jwt-token', user: mockUser });
  }),

  http.get(`${API_BASE}/auth/me`, () => {
    return HttpResponse.json(mockUser);
  }),

  http.put(`${API_BASE}/auth/profile`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockUser, ...body });
  }),

  http.post(`${API_BASE}/auth/change-password`, () => {
    return HttpResponse.json({ message: 'Password changed successfully' });
  }),

  // Employees
  http.get(`${API_BASE}/employees`, () => {
    return HttpResponse.json(paginatedWrapper([mockEmployee]));
  }),

  http.get(`${API_BASE}/employees/me`, () => {
    return HttpResponse.json(mockEmployee);
  }),

  http.get(`${API_BASE}/employees/:id`, ({ params }) => {
    if (params.id === 'not-found') return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(mockEmployee);
  }),

  http.post(`${API_BASE}/employees`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockEmployee, ...body }, { status: 201 });
  }),

  http.put(`${API_BASE}/employees/:id`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockEmployee, ...body });
  }),

  http.delete(`${API_BASE}/employees/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_BASE}/employees/bulk-delete`, () => {
    return HttpResponse.json({ deleted: 2 });
  }),

  http.get(`${API_BASE}/employees/export`, () => {
    return HttpResponse.arrayBuffer(new ArrayBuffer(0), {
      headers: { 'Content-Type': 'text/csv' },
    });
  }),

  // Leaves
  http.get(`${API_BASE}/leaves`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const data = status ? mockLeaves.filter(l => l.status === status) : mockLeaves;
    return HttpResponse.json(paginatedWrapper(data));
  }),

  http.get(`${API_BASE}/leaves/:id`, ({ params }) => {
    const leave = mockLeaves.find(l => l.id === params.id);
    if (!leave) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(leave);
  }),

  http.post(`${API_BASE}/leaves`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: 'leave-new', ...body, status: 'pending' }, { status: 201 });
  }),

  http.patch(`${API_BASE}/leaves/:id/status`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const leave = mockLeaves.find(l => l.id === params.id);
    if (!leave) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ ...leave, status: body.status });
  }),

  // Attendance
  http.get(`${API_BASE}/attendance`, () => {
    return HttpResponse.json(mockAttendance);
  }),

  http.post(`${API_BASE}/attendance/check-in`, () => {
    return HttpResponse.json({
      id: 'att-new',
      employeeId: { id: 'emp-1', firstName: 'John', lastName: 'Doe', position: 'Developer' },
      date: '2025-06-15',
      checkIn: '2025-06-15T08:30:00Z',
      checkOut: null,
      status: 'present',
      note: null,
    }, { status: 201 });
  }),

  http.patch(`${API_BASE}/attendance/:id/check-out`, () => {
    return HttpResponse.json({
      ...mockAttendance[0],
      checkOut: '2025-06-15T17:30:00Z',
    });
  }),

  // Payroll
  http.get(`${API_BASE}/payroll`, () => {
    return HttpResponse.json(paginatedWrapper(mockPayroll));
  }),

  http.post(`${API_BASE}/payroll/process`, () => {
    return HttpResponse.json(mockPayroll);
  }),

  http.patch(`${API_BASE}/payroll/:id/pay`, ({ params }) => {
    const pay = mockPayroll.find(p => p.id === params.id);
    if (!pay) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ ...pay, status: 'paid', paidAt: '2025-07-01T00:00:00Z' });
  }),

  // Departments
  http.get(`${API_BASE}/departments`, () => {
    return HttpResponse.json(mockDepartments);
  }),

  http.get(`${API_BASE}/departments/:id`, ({ params }) => {
    const dept = mockDepartments.find(d => d.id === params.id);
    if (!dept) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(dept);
  }),

  http.post(`${API_BASE}/departments`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: 'dept-new', ...body }, { status: 201 });
  }),

  http.put(`${API_BASE}/departments/:id`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockDepartments[0], ...body });
  }),

  http.delete(`${API_BASE}/departments/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Notifications
  http.get(`${API_BASE}/notifications`, () => {
    return HttpResponse.json(mockNotifications);
  }),

  http.get(`${API_BASE}/notifications/unread-count`, () => {
    return HttpResponse.json({ count: 1 });
  }),

  http.patch(`${API_BASE}/notifications/:id/read`, ({ params }) => {
    const notif = mockNotifications.find(n => n.id === params.id);
    if (!notif) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ ...notif, isRead: true });
  }),

  http.patch(`${API_BASE}/notifications/read-all`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Leave Balance
  http.get(`${API_BASE}/leave-balance/:employeeId`, () => {
    return HttpResponse.json(mockLeaveBalance);
  }),
];
