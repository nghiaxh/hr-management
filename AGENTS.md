# AGENTS.md — HR Management

## What This Project Does

An HR management web app where companies can manage employees, track attendance, handle leave requests, run payroll, and manage departments — all with role-based access control (admin, manager, employee).

Two independent packages: `server/` (Spring Boot + MySQL) and `client/` (React + Vite). No root workspace config.

---

## Quick Start (Development)

### Docker (recommended)

```powershell
Copy-Item .env.example .env          # root .env drives everything; set JWT_SECRET
docker compose up -d --build         # builds + starts mysql, server, client
```

- UI `http://localhost:5173` · API `http://localhost:3001`
- Re-run `docker compose up -d --build` after code changes
- First run auto-seeds sample data; later runs skip seeding if DB already has data
- Reseed/reset: `docker compose run --rm -e SPRING_PROFILES_ACTIVE=seed server`

### Manual dev

```bash
# Server (port 3001)
cd server
mvn spring-boot:run -D"spring-boot.run.profiles=seed"   # recreate all seed data
mvn spring-boot:run                                      # normal startup (auto-seeds if DB empty)

# Client (port 5173)
cd client
npm install
npm run dev            # Vite
npm run build          # tsc && vite build
```

Config lives in a single root `.env` (copy from `.env.example`). The server imports it via `spring.config.import=optional:file:../.env[.properties],optional:file:.env[.properties]`; Vite reads it via `envDir: '..'`. `JWT_SECRET` is still required at startup (it seeds `jwt.secret`, whose `jwt.expiration` is reused as the session timeout) — the app will not start without it.

---

## System Architecture

```
┌─────────────┐    HTTP/REST    ┌─────────────┐   JPA/Hibernate ┌──────────┐
│   Client     │◄──────────────►│   Server     │◄──────────────►│  MySQL 8 │
│  (React 19)  │  Session       │(Spring Boot) │                │Relational│
│  Port 5173   │  (JSESSIONID)  │  Port 3001   │                │  Local   │
└─────────────┘                └─────────────┘              └──────────┘
       │                              │
   ┌───┴───┐                    ┌─────┴──────┐
   │ Auth  │                    │ authenticate│
   │Context│                    │ + requireRoles│
   └───────┘                    └────────────┘
```

- **Server** (`server/src/...`): Spring Boot 4.1, per-controller `@RequestMapping("/api")` (no `server.servlet.context-path`), CORS from env `cors.origin` (credentials allowed). Config from `server/src/main/resources/application.properties` — values are `${VAR:default}` placeholders resolved from the root `.env` or env vars. Uses Maven + Java 25.
- **Client** (`client/src/main.tsx`): Vite dev server, HeroUI v3 (CSS-only) + Tailwind CSS. Axios at `VITE_API_URL` env var (default `http://localhost:3001/api`), session restored via `GET /api/auth/me` when a `JSESSIONID` cookie exists. Path alias `@/` → `./src/*`.

### How Auth Works

1. User enters email + password on the login page
2. Server validates credentials via bcrypt, stores `userId` + `userRole` in the `HttpSession` and sets the `JSESSIONID` cookie (Spring Session JDBC persists sessions in a `sessions` table)
3. Server's `SessionAuthenticationFilter` (`server/src/.../auth/filter/SessionAuthenticationFilter.java`) reads `userId`/`userRole` from the session on each request and populates the `SecurityContext`
4. `SecurityConfig` permits `/api/auth/login`, `/api/auth/register`, and `OPTIONS /**`; all other routes require authentication. CSRF is enabled with the `X-XSRF-TOKEN` header (`HttpSessionCsrfTokenRepository`)
5. The client restores the logged-in user on page load via `GET /api/auth/me` whenever a `JSESSIONID` cookie exists; logout clears the cookie client-side
6. Role-based access is enforced at the **service layer** — `admin` sees all, `manager` scoped to their department, `employee` sees own data only

Auth details:
- Session-based (Spring Session JDBC) + bcrypt + Spring Security. Session max-inactive-interval is set from `jwt.expiration` (default `86400000ms` = 1 day). `jwt.secret` is **required** at startup — set via `JWT_SECRET` in the root `.env`.
- CSRF enabled (`X-XSRF-TOKEN` header). No logout endpoint — the client deletes the session cookie.
- Registration always creates `employee` role — admin/manager roles are set via seed or direct DB update.
- Passwords: min 8, max 128 chars (no complexity requirement); registration also validates `@Email` format.

---

## Request Flow (Example: Employee Creates a Leave)

```
User clicks "Submit Leave"
       │
       ▼
Client POST /api/leaves  { type, startDate, endDate, reason }
       │
       ▼
SessionAuthenticationFilter — loads userId/userRole from HttpSession, sets SecurityContext
       │
       ▼
SecurityConfig — permits endpoint (authenticated), assigns SecurityContext
       │
       ▼
LeaveController — calls LeaveService
       │
       ▼
LeaveService.create(dto, userId)
  ├── Finds Employee profile by userId
  ├── Validates: endDate >= startDate, max 30 days
  ├── Checks for overlapping pending or approved leaves
  └── Creates leave record with status "pending"
       │
       ▼
Response 201: { id, type, startDate, endDate, status: "pending", ... }
       │
       ▼
When admin/manager approves via PATCH /api/leaves/:id/status
  ├── LeaveBalanceService.deduct() — subtracts days from balance (rolls back to pending on insufficient balance)
  └── NotificationService.create() — sends in-app notification to employee
```

---

## Data Model

### User (authentication)
```
{ id (UUID), email (unique), passwordHash, role: "admin"|"manager"|"employee", name?, createdAt, updatedAt }
```
- Separated from Employee profile for security (auth vs HR data)

### Employee (HR profile)
```
{ id (UUID), userId→User (unique), departmentId→Department (required), firstName, lastName,
  position, salary (BigDecimal), contractType, contractExpiry, hireDate, phone, createdAt, updatedAt }
```
- Every User may have zero or one Employee record
- Created with an existing `userId` (an account must exist first)

### Department
```
{ id (UUID), name (unique), description, managerId→User? (nullable), createdAt, updatedAt }
```

### Leave
```
{ id (UUID), employeeId→Employee, type: "annual"|"sick"|"personal",
  startDate, endDate, reason, status: "pending"|"approved"|"rejected",
  approvedBy→User?, rejectionReason?, createdAt, updatedAt }
```

### Attendance
```
{ id (UUID), employeeId→Employee, date, checkIn (LocalDateTime), checkOut (LocalDateTime),
  status: "present"|"late"|"half-day"|"absent", note?, createdAt, updatedAt }
  unique(employeeId, date)
```
- Auto-calculated: check-in after 9AM → `late`; worked < 4h → `half-day`; late but ≥ 8h worked → upgraded to `present`
- `absent` is never auto-set by `AttendanceService` — reserved for manual entry

### Payroll
```
{ id (UUID), employeeId→Employee, month, year, basicSalary, bonus (=0),
  socialInsurance (8%), healthInsurance (1.5%), unemploymentInsurance (1%), unionDues (1%),
  pit, totalDeductions, netPay, status: "draft"|"paid", paidAt?, createdAt, updatedAt }
  unique(employeeId, month, year)
```
- PIT: 5 progressive brackets (5% / 10% / 20% / 30% / 35%), personal deduction 15,500,000 VND
- Bonus is always 0 in the current calculation

### LeaveBalance
```
{ id (UUID), employeeId→Employee (OneToOne, unique), annualTotal (12), annualUsed,
  sickTotal (30), sickUsed, personalTotal (3), personalUsed, createdAt, updatedAt }
```
- Auto-created with defaults (12/30/3) when first queried; deducted on leave approval

### Notification
```
{ id (UUID), userId→User, title, message, type, relatedId?,
  relatedModel?, isRead: false, createdAt, updatedAt }
```
- Created on leave approval/rejection; delivered via API polling (the client polls unread-count every 30s, list every 15s)

---

## Server Feature Modules

Domain modules follow `controller/` → `service/` → `repository/` + `entity/`; `common/` and `config/` are cross-cutting.

| Module           | Entry file                        | Notes                              |
|------------------|-----------------------------------|------------------------------------|
| Auth             | `server/src/.../auth/` | bcrypt + Spring Security + session auth |
| Employees        | `server/src/.../employee/` | Business logic for employees, CSV export, bulk delete |
| Departments      | `server/src/.../department/` | Department management |
| Leaves           | `server/src/.../leave/` | Leave requests with validation |
| Attendance       | `server/src/.../attendance/` | Check-in/out with auto logic |
| Payroll          | `server/src/.../payroll/` | Monthly batch processing |
| LeaveBalance     | `server/src/.../leavebalance/` | Auto-create + deduct on approval |
| Notifications    | `server/src/.../notification/` | In-app notifications (API polling) |
| Seed            | `server/src/.../seed/` | `DataSeeder` (reset when `seed` profile active) + `FirstRunSeeder` (auto-seeds when DB empty) |
| Common           | `server/src/.../common/` | `PaginatedResponse`, `GlobalExceptionHandler`, `SecurityUtil` + typed exceptions |
| Config           | `server/src/.../config/` | `CorsConfig`, `SecurityConfig` (CORS/CSRF/session policy) |

> Root `AppApplication.java` bootstraps the app. Dashboard, Employee History, Recruitment, and Performance Reviews are **not implemented** (no modules, endpoints, or UI).

---

## RBAC Model

| Role | What They Can See | What They Can Do |
|------|-------------------|------------------|
| **admin** | Everything | Full CRUD on all modules, process payroll |
| **manager** | Their department only | Approve/reject leave requests, view department reports |
| **employee** | Self only | View own profile/leaves/attendance/payroll, create leave requests, check in/out |

Enforcement happens at two layers:
- **Server**: `SecurityUtil` + `requireRoles()` at the service layer on every route (except `/api/auth/login`, `/api/auth/register`, and `OPTIONS /**`). Read-own-data endpoints (e.g. `GET /api/employees/me`, `GET /api/leave-balance/my`) allow all roles and filter by current user instead.
- **Client**: `ProtectedRoute` component wraps every route with role check; sidebar hides inaccessible links; the home route redirects to `/leaves`

---

## Key Flows

### Leave Request Lifecycle
```
Employee submits → status: "pending"
       │
       ▼
Manager sees in approval queue
       │
       ├── Approve → deduct from leave balance (rollback to pending if insufficient) → notify employee
       └── Reject  → set rejection reason → notify employee
```

### Daily Attendance Flow
```
Employee clicks "Check In" (before 9AM → "present", after → "late")
Employee clicks "Check Out" (< 4h worked → "half-day", ≥ 8h late → "present")
Monthly attendance report aggregates all days
```

### Payroll Processing Flow
```
Admin selects month/year
Server calculates per employee: netPay = basicSalary - totalDeductions
Deductions: BHXH (8%), BHYT (1.5%), BHTN (1%), Công đoàn (1%), PIT (5 progressive brackets, 15,500,000 VND personal deduction)
Creates payroll records (skips if already exists for that month/year)
Admin marks each as "paid" when disbursed
```

### Notifications (API polling)
```
Server event (leave approved/rejected)
       │
       ▼
NotificationService.create() — saves notification to DB
       │
       ▼
Client polls GET /api/notifications/unread-count every 30s (sidebar badge)
Client list page polls GET /api/notifications every 15s
       │
       ▼
Client shows toast + increments badge count
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
│  │ Employees           │  │   Outlet)       │
│  │ Departments         │  │                 │
│  │ Org Chart           │  │                 │
│  │ Leaves              │  │                 │
│  │ Leave Approvals     │  │                 │
│  │ Attendance          │  │                 │
│  │ Attendance Report   │  │                 │
│  │ Payroll             │  │                 │
│  │ Payroll Management  │  │                 │
│  ├─────────────────────┤  │                 │
│  │ Notifications       │  │                 │
│  │ Settings            │  │                 │
│  │ Profile / Logout    │  │                 │
│  └─────────────────────┘  │                 │
└─────────────────────────────┘
```

- Routes: `/login`, `/employees`, `/employees/:id`, `/departments`, `/org-chart`, `/leaves`, `/leaves/approvals`, `/attendance`, `/attendance/report`, `/payroll`, `/payroll/manage`, `/notifications`, `/settings`, `/profile`; `/` redirects to `/leaves`
- Org chart is rendered client-side from the departments API (no org-chart endpoint)
- Sidebar items are filtered by role (employees don't see admin links)
- Mobile: sidebar hidden behind hamburger menu
- Content area: max-width 1280px (`max-w-7xl`), responsive padding

---

## Tech Stack Decisions

| Choice | Reason |
|--------|--------|
| **Spring Boot** over Express | Opinionated DI, Spring Security, mature JPA/Hibernate integration |
| **MySQL 8** over PostgreSQL | Standard choice, zero PG-specific features needed, wide hosting support |
| **Separate User/Employee** | Auth credentials isolated from HR profile data |
| **Session-based auth** over JWT | httpOnly session cookie managed by Spring Session JDBC; `jwt.expiration` reused for session timeout |
| **API polling for notifications** | Simple push-less delivery; no WebSocket infrastructure yet |
| **HeroUI v3** | CSS-only (no Provider), design tokens in `index.css`, Tailwind 4 integration |
| **TanStack Query** | Automatic caching, refetching, optimistic updates for API data |

---

## Key Facts

- **Server tests**: 85 unit tests (16 test classes, including `AppApplicationTests`) across all modules using JUnit 5 + Mockito + `@ActiveProfiles("test")`. Run with `mvn test`.
- **Client tests**: 60 tests (17 files) via Vitest + Testing Library + MSW. Run with `npm test`. Build with `npm run build` (tsc && vite build).
- **Client UI conventions**: HeroUI v3 is imported CSS-only (`client/src/index.css`) — no `<HeroUIProvider>` wrapper. Custom design tokens (bone/ink/accent/status colors) live at the `:root` in `index.css` with `.dark` overrides; dark mode is toggled by `use-theme.ts` (`data-theme` attr + `.dark` class on `<html>`). Wrapper components live in `client/src/components/ui/` (`button`, `badge`, `card`, `dialog`, `input`, `select`, `table`, `data-table`, `skeleton-list`, `toaster`, `tooltip`, etc.). Icons come from `@phosphor-icons/react` only — export names are case-sensitive (e.g. `tag`, not `Tag`) and must be verified against the package before use. UI text uses a single Vietnamese locale in `client/src/locales/vi.ts` via `t()`.
- **CI**: GitHub Actions workflow (`.github/workflows/test.yml`) runs 4 jobs — `server-build` (compile), `server-tests` (MySQL 8 service, Java 25), `client-tests`, and `client-build` (Node 24) — on push and pull_request to `main`/`master`/`develop`.
- Client uses ES modules (`"type": "module"`) with Vite 8 + TypeScript; server is Maven + Java 25 (Spring Boot 4.1).
- All API routes are protected by Spring Security + `SessionAuthenticationFilter` (except `/api/auth/login`, `/api/auth/register`, and `OPTIONS /**`). Role enforcement at the service layer via `SecurityUtil` + `requireRoles()` pattern.
- Root `.env` is gitignored (template `.env.example` is committed); `server/.env` fallback is also ignored if created.
- All configuration is env-driven from the single root `.env` (template `.env.example` is committed; real `.env` is gitignored). Docker runs via `docker-compose.yml` (mysql:8.0, maven:3.9-eclipse-temurin-25, node:24-alpine, nginx:1.27-alpine) + `server/Dockerfile` + `client/Dockerfile` (nginx).
- `employee` role users access their own data enforced server-side; `manager` role is scoped to their department.
- **Security**: session-based auth (Spring Session JDBC) via `SessionAuthenticationFilter`, BCrypt password encoding, CSRF enabled (`X-XSRF-TOKEN` header), CORS configured via `cors.origin` property with credentials. Passwords require min 8 chars (max 128), no complexity requirement.

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
