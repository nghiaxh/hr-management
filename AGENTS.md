# AGENTS.md — HR Management

## What This Project Does

An HR management web app where companies can manage employees, track attendance, handle leave requests, run payroll, and manage recruitment — all with role-based access control (admin, manager, employee).

Two independent packages: `server/` (Spring Boot + PostgreSQL) and `client/` (React + Vite). No root workspace config.

---

## Quick Start (Development)

```bash
# Server (port 3001)
cd server
# edit server/.env to set JWT_SECRET (or use application.properties)
mvn spring-boot:run -Dspring-boot.run.profiles=seed   # recreate all seed data
mvn spring-boot:run                                    # normal startup

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
┌─────────────┐    HTTP/REST    ┌─────────────┐   JPA/Hibernate ┌──────────┐
│   Client     │◄──────────────►│   Server     │◄──────────────►│PostgreSQL│
│  (React 18)  │   JWT Bearer   │(Spring Boot) │                │Relational│
│  Port 5173   │                │  Port 3001   │                │  Local   │
└─────────────┘                └─────────────┘              └──────────┘
       │                              │
   ┌───┴───┐                    ┌─────┴──────┐
   │ Auth  │                    │ authenticate│
   │Context│                    │ + requireRoles│
   └───────┘                    └────────────┘
```

- **Server** (`server/src/...`): Spring Boot, global prefix `/api`, CORS from env `cors.origin`. Config from `server/.env`. Uses Maven + Java 25.
- **Client** (`client/src/main.tsx`): Vite dev server, shadcn/ui + Tailwind + Radix. Axios at `VITE_API_URL` env var (default `http://localhost:3001/api`), JWT from localStorage. Path alias `@/` → `./src/*`.

### How Auth Works

1. User enters email + password on the login page
2. Server validates credentials via bcrypt, returns a **JWT token**
3. Client stores the token in `localStorage` and attaches it as `Authorization: Bearer <token>` on every request
4. Server's `authenticate` middleware (`server/src/middleware/auth.ts`) verifies the JWT
5. `requireRoles()` middleware (`server/src/middleware/roles.ts`) checks role-based access

Auth details:
- JWT (jsonwebtoken), `authenticate` + `requireRoles` middleware. Tokens expire in `JWT_EXPIRES_IN` (default `1d`). `JWT_SECRET` is **required** at startup.
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
authenticate middleware — extracts & verifies JWT from header
       │
       ▼
requireRoles('employee') middleware — checks user role
       │
       ▼
leaves.routes.ts handler — calls service
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
- Deductions: BHXH (8%), BHTN (1%), BHTNLD (0.5%), Công đoàn (2.5%), PIT (7 brackets lũy tiến)
- Bonus: Tết (0.5-2x salary), quarterly performance, regular month

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
- Triggered by leave approval/rejection; delivered via Socket.IO in real-time (planned)

---

## Server Feature Modules

All modules follow the Spring Boot convention: `controller/` → `service/` → `repository/` + `entity/`.

| Module           | Entry file                        | Notes                              |
|------------------|-----------------------------------|------------------------------------|
| Auth             | `server/src/.../auth/` | JWT + bcrypt + Spring Security     |
| Employees        | `server/src/.../employee/` | Business logic for employees |
| Departments      | `server/src/.../department/` | Department management |
| Leaves           | `server/src/.../leave/` | Leave requests with validation |
| Attendance       | `server/src/.../attendance/` | Check-in/out with auto logic |
| Payroll          | `server/src/.../payroll/` | Monthly batch processing |
| Dashboard        | `server/src/.../dashboard/` | Role-based statistics |
| EmployeeHistory  | `server/src/.../employeehistory/` | Timeline of changes |
| LeaveBalance     | `server/src/.../leavebalance/` | Auto-deduct on approval |
| Notifications    | `server/src/.../notification/` | In-app notifications (API-based, Socket.IO planned) |
| Recruitment      | `server/src/.../recruitment/` | *Planned — empty stubs* |
| PerformanceReview| `server/src/.../performance review/` | *Planned — empty stubs* |

---

## RBAC Model

| Role | What They Can See | What They Can Do |
|------|-------------------|------------------|
| **admin** | Everything | Full CRUD on all modules, process payroll, manage all settings |
| **manager** | Their department only | Approve/reject leave requests, view department reports, manage their team's history |
| **employee** | Self only | View own profile/leaves/attendance/payroll, create leave requests, check in/out |

Enforcement happens at two layers:
- **Server**: `authenticate` + `requireRoles()` middleware on every route (except `/api/auth/login` and `/api/auth/register`)
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
Deductions include: BHXH (8%), BHTN (1%), BHTNLD (0.5%), Công đoàn (2.5%), PIT (7 brackets lũy tiến)
Bonus varies by month: Tết (tháng 1/12), quarter-end performance, regular
Creates payroll records (skips if already exists for that month)
Admin marks each as "paid" when disbursed
```

### Notifications (API-based, Socket.IO planned)
```
Server event (leave approved/rejected)
       │
       ▼
NotificationsService.create() — saves notification to DB
       │
       ▼
Client polls GET /api/notifications/unread-count periodically
       │
       ▼
Client shows toast + increments badge count
```

> Socket.IO real-time push is planned but not yet implemented.
> Notifications are currently delivered on page refresh or manual fetch.

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
| **Socket.IO** for notifications *(planned)* | Real-time push without polling; auto-reconnect built-in (API polling for now) |
| **shadcn/ui** | Copy-paste components, full control over styling, Tailwind integration |
| **TanStack Query** | Automatic caching, refetching, optimistic updates for API data |

---

## Key Facts

- **No tests, no linter, no CI, no typecheck script.** No pre-commit hooks.
- Both packages use ES modules (`"type": "module"`). Client uses Vite/TypeScript.
- All API routes are protected by `authenticate` + `requireRoles()` middleware (except `/api/auth/login` and `/api/auth/register`).
- `server/.env` is NOT tracked in git — already exists with dev defaults.
- `employee` role users access their own data enforced server-side; `manager` role is scoped to their department.
- **Security**: Rate limiting (60 req/min via `express-rate-limit`), helmet headers, file uploads limited to 5MB (JPEG/PNG/GIF/PDF/DOC/DOCX), passwords require min 8 chars with uppercase+lowercase+digit, WebSocket auth via JWT handshake, search inputs regex-escaped.

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
