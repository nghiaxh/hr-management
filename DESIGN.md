# Design — HR Management

## What This Project Does

An HR management web app where companies can manage employees, track attendance, handle leave requests, run payroll, and manage recruitment — all with role-based access control (admin, manager, employee).

---

## System Architecture

```
┌─────────────┐    HTTP/REST    ┌─────────────┐   Mongoose   ┌──────────┐
│   Client     │◄──────────────►│   Server     │◄────────────►│  MongoDB  │
│  (React 18)  │   JWT Bearer   │  (NestJS 11) │              │  (NoSQL)  │
│  Port 5173   │                │  Port 3001   │              │  Local    │
└─────────────┘                └─────────────┘              └──────────┘
       │                              │
   ┌───┴───┐                    ┌─────┴──────┐
   │ Auth  │                    │ JwtAuthGuard│
   │Context│                    │ + RolesGuard│
   └───────┘                    └────────────┘
```

### How auth works

1. User enters email + password on the login page
2. Server validates credentials via bcrypt, returns a **JWT token**
3. Client stores the token in `localStorage` and attaches it as `Authorization: Bearer <token>` on every request
4. Server's `JwtAuthGuard` verifies the token on every protected route
5. `RolesGuard` checks the user's role against the route's `@Roles()` decorator

---

## Request Flow (Example: Employee Creates a Leave)

```
User clicks "Submit Leave"
       │
       ▼
Client POST /api/leaves  { type, startDate, endDate, reason }
       │
       ▼
JwtAuthGuard — extracts & verifies JWT from header
       │
       ▼
RolesGuard — checks user has @Roles('employee')
       │
       ▼
LeavesController.create(dto, userId)
       │
       ▼
LeavesService.create(dto, userId)
  ├── Finds Employee profile by userId
  ├── Validates: endDate >= startDate, max 30 days
  ├── Checks for overlapping approved leaves
  └── Creates leave document with status "pending"
       │
       ▼
Response 201: { _id, type, startDate, endDate, status: "pending", ... }
       │
       ▼
When admin/manager approves via PATCH /api/leaves/:id/status
  ├── LeaveBalanceService.deduct() — subtracts days from balance
  └── NotificationsService.create() — sends in-app notification to employee
```

---

## Data Model

### User (authentication)
```
{ _id, email, passwordHash, role: "admin"|"manager"|"employee", isActive, name? }
```
- Separated from Employee profile for security (auth vs HR data)

### Employee (HR profile)
```
{ _id, userId→User, departmentId→Department, firstName, lastName,
  position, salary, contractType, hireDate, phone, documents[] }
```
- Every User may have zero or one Employee record
- Documents array stores file metadata (name, url, type, uploadedAt)

### Department
```
{ _id, name, description, managerId→User }
```

### Leave
```
{ _id, employeeId→Employee, type: "annual"|"sick"|"personal",
  startDate, endDate, status: "pending"|"approved"|"rejected",
  approvedBy→User?, rejectionReason? }
```

### Attendance
```
{ _id, employeeId→Employee, date, checkIn, checkOut,
  status: "present"|"late"|"half-day"|"absent" }
```
- Auto-calculated: check-in after 9AM → `late`; worked < 4h → `half-day`

### Payroll
```
{ _id, employeeId→Employee, month, year, basicSalary, bonus,
  deductions, netPay, status: "draft"|"paid", paidAt? }
```

### EmployeeHistory
```
{ _id, employeeId→Employee, type: "raise"|"promotion"|"transfer",
  previousValue?, newValue, effectiveDate, note? }
```
- Timeline of salary changes, promotions, department transfers

### LeaveBalance
```
{ _id, employeeId→Employee, annualTotal, annualUsed,
  sickTotal, sickUsed, personalTotal, personalUsed }
```
- Auto-created when first queried; deducted on leave approval

### Notification
```
{ _id, userId→User, title, message, type, relatedId?,
  relatedModel?, isRead: false, createdAt }
```
- Triggered by leave approval/rejection; delivered via Socket.IO in real-time

---

## RBAC Model

| Role | What They Can See | What They Can Do |
|------|-------------------|------------------|
| **admin** | Everything | Full CRUD on all modules, process payroll, manage all settings |
| **manager** | Their department only | Approve/reject leave requests, view department reports, manage their team's history |
| **employee** | Self only | View own profile/leaves/attendance/payroll, create leave requests, check in/out |

Enforcement happens at two layers:
- **Server**: `JwtAuthGuard` + `RolesGuard` with `@Roles()` decorator on every route
- **Client**: `ProtectedRoute` component wraps every route with role check; sidebar hides inaccessible links

---

## Key Flows

### Leave Request Lifecycle
```
Employee submits → status: "pending"
       │
       ▼
Manager sees in approval queue
       │
       ├── Approve → deduct from leave balance → notify employee
       └── Reject  → set rejection reason → notify employee
```

### Daily Attendance Flow
```
Employee clicks "Check In" (before 9AM → "present", after → "late")
Employee clicks "Check Out" (< 4h worked → "half-day")
Monthly attendance report aggregates all days
```

### Payroll Processing Flow
```
Admin selects employees + month/year
Server calculates: netPay = basicSalary + bonus - deductions
Creates payroll records (skips if already exists for that month)
Admin marks each as "paid" when disbursed
```

### Real-time Notifications
```
Server event (leave approved/rejected)
       │
       ▼
NotificationsGateway.sendNotification(userId, data)
       │
       ▼
Socket.IO emits to user:{userId} room
       │
       ▼
Client receives → shows toast + invalidates notification query
```

---

## UI Layout

```
┌─────────────────────────────────────────────┐
│  Sidebar (collapsible)    │  Main Content   │
│                           │                 │
│  ┌─────────────────────┐  │                 │
│  │ User avatar + name  │  │  (Page content  │
│  │ Role badge          │  │   rendered via  │
│  ├─────────────────────┤  │   React Router  │
│  │ Dashboard           │  │   Outlet)       │
│  │ Employees           │  │                 │
│  │ Departments         │  │                 │
│  │ Org Chart           │  │                 │
│  │ Leaves              │  │                 │
│  │ Attendance          │  │                 │
│  │ Payroll             │  │                 │
│  │ Recruitment         │  │                 │
│  │ Performance Reviews │  │                 │
│  ├─────────────────────┤  │                 │
│  │ Notifications       │  │                 │
│  │ Profile             │  │                 │
│  │ Settings            │  │                 │
│  │ Logout              │  │                 │
│  └─────────────────────┘  │                 │
└─────────────────────────────────────────────┘
```

- Sidebar items are filtered by role (employees don't see admin links)
- Mobile: sidebar hidden behind hamburger menu
- Content area: max-width 1280px, responsive padding

---

## Tech Stack Decisions

| Choice | Reason |
|--------|--------|
| **NestJS** over Express | Structured modules, dependency injection, built-in guards/pipes |
| **MongoDB** over SQL | Flexible schema for HR documents array, easy to iterate |
| **Separate User/Employee** | Auth credentials isolated from HR profile data |
| **JWT in localStorage** | Simple SPA auth; httpOnly cookies are more secure but add complexity |
| **Socket.IO** for notifications | Real-time push without polling; auto-reconnect built-in |
| **shadcn/ui** | Copy-paste components, full control over styling, Tailwind integration |
| **TanStack Query** | Automatic caching, refetching, optimistic updates for API data |
