# AGENTS.md — HR Management

## What This Project Does

An HR management web app where companies can manage employees, track attendance, handle leave requests, run payroll, and manage recruitment — all with role-based access control (admin, manager, employee).

Two independent packages: `server/` (NestJS + MongoDB) and `client/` (React + Vite). No root workspace config.

---

## Quick Start (Development)

```bash
# Server (port 3001)
cd server
npm install
# edit server/.env to set JWT_SECRET
npm run seed           # 1 admin, 6 managers, ~50 employees across 6 departments
npm run dev            # tsx (ESM), not NestJS CLI (no nest-cli.json)

# Client (port 5173)
cd client
npm install
npm run dev            # Vite
npm run build          # tsc && vite build
```

Seed is required before first dev run. Drops all data and recreates — safe to re-run.

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

- **Server** (`server/src/index.ts`): Express, global prefix `/api`, CORS from env `CORS_ORIGIN`. Config from `server/.env`. Path alias `@/*` → `src/*`.
- **Client** (`client/src/main.tsx`): Vite dev server, shadcn/ui + Tailwind + Radix. Axios at `VITE_API_URL` env var (default `http://localhost:3001/api`), JWT from localStorage. Path alias `@/` → `./src/*`.

### How Auth Works

1. User enters email + password on the login page
2. Server validates credentials via bcrypt, returns a **JWT token**
3. Client stores the token in `localStorage` and attaches it as `Authorization: Bearer <token>` on every request
4. Server's `JwtAuthGuard` verifies the token on every protected route
5. `RolesGuard` checks the user's role against the route's `@Roles()` decorator

Auth details:
- JWT (passport-jwt), `@Roles()` decorator + `RolesGuard`. Tokens expire in `JWT_EXPIRES_IN` (default `1d`). `JWT_SECRET` is **required** at startup.
- Registration always creates `employee` role — admin/manager roles are set via seed or direct DB update.

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

## Server Feature Modules

All modules follow the Express convention: `routes/` → `services/` → `models/` + `schemas/`.

| Module           | Entry file                        | Notes                              |
|------------------|-----------------------------------|------------------------------------|
| Auth             | `server/src/routes/auth.routes.ts` | JWT + bcrypt + middleware          |
| Employees        | `server/src/services/employees.service.ts` | Business logic for employees |
| Departments      | `server/src/services/departments.service.ts` | Department management |
| Leaves           | `server/src/services/leaves.service.ts` | Leave requests with validation |
| Attendance       | `server/src/services/attendance.service.ts` | Check-in/out with auto logic |
| Payroll          | `server/src/services/payroll.service.ts` | Monthly batch processing |
| Dashboard        | `server/src/services/dashboard.service.ts` | Role-based statistics |
| EmployeeHistory  | `server/src/services/employee-history.service.ts` | Timeline of changes |
| LeaveBalance     | `server/src/services/leave-balance.service.ts` | Auto-deduct on approval |
| Notifications    | `server/src/services/notifications.service.ts` | In-app notifications |
| Recruitment      | `server/src/services/recruitment.service.ts` | Job postings + candidates |
| PerformanceReview| `server/src/services/performance-review.service.ts` | Performance reviews |

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
└─────────────────────────────┘
```

- Sidebar items are filtered by role (employees don't see admin links)
- Mobile: sidebar hidden behind hamburger menu
- Content area: max-width 1280px, responsive padding

---

## Tech Stack Decisions

| Choice | Reason |
|--------|--------|
| **Express** over NestJS | Simpler, more flexible architecture with explicit route handling |
| **MongoDB** over SQL | Flexible schema for HR documents array, easy to iterate |
| **Separate User/Employee** | Auth credentials isolated from HR profile data |
| **JWT in localStorage** | Simple SPA auth; httpOnly cookies are more secure but add complexity |
| **Socket.IO** for notifications | Real-time push without polling; auto-reconnect built-in |
| **shadcn/ui** | Copy-paste components, full control over styling, Tailwind integration |
| **TanStack Query** | Automatic caching, refetching, optimistic updates for API data |

---

## Key Facts

- **No tests, no linter, no CI, no typecheck script.** No pre-commit hooks.
- Both packages use ES modules (`"type": "module"`). Server uses `NodeNext` module resolution with `.js` extensions in relative imports.
- All API routes are protected by `JwtAuthGuard` + `RolesGuard` (except `/api/auth/login` and `/api/auth/register`).
- `server/.env` is NOT tracked in git — already exists with dev defaults.
- `employee` role users access their own data enforced server-side; `manager` role is scoped to their department.
- **Security**: Rate limiting (60 req/min via `@nestjs/throttler`), helmet headers, file uploads limited to 5MB (JPEG/PNG/GIF/PDF/DOC/DOCX), passwords require min 8 chars with uppercase+lowercase+digit, WebSocket auth via JWT handshake, search inputs regex-escaped.

---

## Git Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `style`, `perf`, `test`, `ci`, `build`.

| Type       | Description                                       |
|------------|---------------------------------------------------|
| `feat`     | New feature                                       |
| `fix`      | Bug fix                                           |
| `docs`     | Documentation changes                             |
| `refactor` | Code refactoring (no behavior change)             |
| `chore`    | Maintenance, dependencies, config                 |
| `style`    | Code formatting, CSS                              |
| `ci`       | CI/CD                                             |
| `build`    | Build system                                      |

Scope (optional) is the affected module/directory, e.g. `feat(auth):`, `fix(leaves):`, `chore(deps):`.

Write descriptions in English, present tense, lowercase, no trailing period.
