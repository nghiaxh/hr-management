# Architecture — HR Management

System reference for how the app is built. User-facing setup lives in `README.md`; agent development guidance in `AGENTS.md`.

## 1. Overview

An HR management web app (employees, attendance, leave, payroll, departments) with role-based access control (`admin`, `manager`, `employee`). Two independent packages:

- **`server/`** — Spring Boot 4.1 (Java 25) + MySQL 8. REST API on port `3001`.
- **`client/`** — React 19 + Vite 8 + TypeScript + HeroUI v3 (CSS-only) + Tailwind 4. UI on port `5173`.

No root workspace config. Everything is driven by a single root `.env`.

## 2. Diagram

```
┌─────────────┐   HTTP/REST   ┌─────────────┐  JPA/Hibernate ┌──────────┐
│   Client     │◄────────────►│   Server     │◄──────────────►│  MySQL 8 │
│  (React 19)  │  Session     │(Spring Boot) │                │Relational│
│  Port 5173   │  (JSESSIONID)│  Port 3001   │                │  Local   │
└─────────────┘              └─────────────┘                └──────────┘
       │                             │
   ┌───┴───┐                   ┌─────┴──────┐
   │ Auth  │                   │ authenticate│
   │Context│                   │ + requireRoles│
   └───────┘                   └────────────┘
```

Docker Compose runs three services from `docker-compose.yml`: `mysql:8.0`, a Maven `maven:3.9-eclipse-temurin-25` build for the API, and `node:24` + `nginx:1.27-alpine` for the client.

## 3. Client

Entry points: `client/src/main.tsx`, `client/src/App.tsx` (routes), `client/src/index.css` (design tokens).

- **HTTP** — single Axios instance `api/client.ts` (`withCredentials`, CSRF `XSRF-TOKEN` → `X-XSRF-TOKEN` header). Per-domain modules in `api/*` expose ~33 endpoints.
- **State** — TanStack Query for server state (keys like `['employees', search, page]`); `context/auth-context.tsx` + `context/language-context.tsx` for global client state.
- **UI** — shared primitives in `components/ui/*` (button, card, dialog, input, select, table, data-table, ...) + `components/shared/*` (page-header, status-badge, empty-state). Pages in `pages/*` use these; no page-local reimplementations. `page-header` renders **actions only** — pages no longer show a title/description row.
- **Design** — single blue accent (`#2563EB` light / `#60A5FA` dark) from `index.css` tokens for actions, active nav, and focus. Status colors are muted.
- **i18n** — single Vietnamese locale `locales/vi.ts` via `t()`.

## 4. Server

Entry: `server/src/main/java/com/hrmanagement/AppApplication.java`. Domain modules follow `controller/ → service/ → repository/ + entity/`.

| Module        | Entry file                         | Notes                                        |
|---------------|------------------------------------|----------------------------------------------|
| Auth          | `com/hrmanagement/auth/`           | bcrypt + Spring Security + session auth      |
| Employees     | `com/hrmanagement/employee/`       | CRUD, CSV export, bulk delete                |
| Departments   | `com/hrmanagement/department/`     | Department CRUD                              |
| Leaves        | `com/hrmanagement/leave/`          | Leave requests with validation               |
| Attendance    | `com/hrmanagement/attendance/`     | Check-in/out with auto logic                 |
| Payroll       | `com/hrmanagement/payroll/`        | Monthly batch processing                     |
| LeaveBalance  | `com/hrmanagement/leavebalance/`   | Auto-create + deduct on approval             |
| Notifications | `com/hrmanagement/notification/`   | In-app notifications (API polling)           |
| Seed          | `com/hrmanagement/seed/`           | `DataSeeder` (seed profile) + `FirstRunSeeder`; seeds 3 departments, 9 users, 8 employee profiles (admin included), leaves for all employees, previous-month payroll, notifications |
| Common        | `com/hrmanagement/common/`         | `PaginatedResponse`, `GlobalExceptionHandler`, `SecurityUtil` + typed exceptions |
| Config        | `com/hrmanagement/config/`         | `CorsConfig`, `SecurityConfig` (CORS/CSRF/session) |

Config resolves `${VAR:default}` placeholders from `application.properties`, sourced from the root `.env`.

## 5. Data Model

| Entity     | Key fields |
|------------|------------|
| User       | `id`, `email` (unique), `passwordHash`, `role` (`admin/manager/employee`), `name` |
| Employee   | `id`, `userId→User` (unique), `departmentId→Department`, `firstName`, `lastName`, `position`, `salary`, `contractType`, `contractExpiry`, `hireDate`, `phone` |
| Department | `id`, `name` (unique), `description`, `managerId→User?` |
| Leave      | `id`, `employeeId→Employee`, `type` (`annual/sick/personal`), `startDate`, `endDate`, `reason`, `status` (`pending/approved/rejected`), `approvedBy→User?`, `rejectionReason?` |
| Attendance | `id`, `employeeId→Employee`, `date`, `checkIn`, `checkOut`, `status` (`present/late/half-day/absent`), `note?` — `unique(employeeId, date)` |
| Payroll    | `id`, `employeeId→Employee`, `month`, `year`, `basicSalary`, `bonus`, `socialInsurance`, `healthInsurance`, `unemploymentInsurance`, `unionDues`, `pit`, `totalDeductions`, `netPay`, `status` (`draft/paid`), `paidAt?` — `unique(employeeId, month, year)` |
| LeaveBalance | `id`, `employeeId→Employee` (OneToOne), `annualTotal/Used`, `sickTotal/Used`, `personalTotal/Used` |
| Notification | `id`, `userId→User`, `title`, `message`, `type`, `relatedId?`, `relatedModel?`, `isRead`, `createdAt` |

`User` is kept separate from `Employee` to isolate auth credentials from HR data.

## 6. Auth & RBAC

Session-based (Spring Session JDBC) + bcrypt + Spring Security.

1. Login validates via bcrypt, stores `userId` + `userRole` in `HttpSession`, sets `JSESSIONID`.
2. `SessionAuthenticationFilter` reads `userId`/`userRole` each request → populates `SecurityContext`.
3. `SecurityConfig` permits `/api/auth/login`, `OPTIONS /**`; others require auth. CSRF via `X-XSRF-TOKEN` (`HttpSessionCsrfTokenRepository`).
4. Client restores the user via `GET /api/auth/me` **only when a `JSESSIONID` cookie exists** (no cookie → no request); logout clears the cookie, and the Axios layer drops `JSESSIONID`/`XSRF-TOKEN` cookies on 401/403 responses.
5. Role checks at the **service layer** (`SecurityUtil` + `requireRoles()`): `admin` sees all, `manager` scoped to department, `employee` own data only.
6. Session timeout = `session.expiration` (default `86400000ms`). No secret required at startup.

Login/`/me`/profile payloads include `hasEmployeeProfile` (user has an Employee record). The `/leaves` page hides balance cards and the "Create Leave" button for accounts without a profile (`/api/leave-balance/my` 404s without one).

`ProtectedRoute` + role-filtered sidebar enforce the same contraints client-side.

## 7. Key Flows

**Leave lifecycle** — employee submits (`pending`) → manager approves (deducts balance, rollback on insufficient) or rejects (with reason) → notification created.

**Daily attendance** — check-in before 9AM → `present`, after → `late`; check-out < 4h worked → `half-day`, ≥ 8h late → upgraded to `present`. `absent` is manual only.

**Payroll** — admin selects month/year → per-employee `netPay = basicSalary - totalDeductions` (BHXH 8%, BHYT 1.5%, BHTN 1%, Công đoàn 1%, PIT via 5 progressive brackets + 15,500,000 VND personal deduction); skips existing records; admin marks `paid`.

**Notifications** — created on leave events, delivered by polling: unread-count every 30s (sidebar badge), list every 15s.

## 8. Config & Deploy

Single root `.env` (copy `.env.example`; gitignored). Server imports via `spring.config.import=optional:file:../.env[.properties]`; Vite reads via `envDir: '..'`. No required secrets at startup.

Key vars: `MYSQL_DATABASE`, `MYSQL_ROOT_PASSWORD`, `DB_URL`, `DB_USERNAME`, `SERVER_PORT` (3001), `SESSION_EXPIRATION` (86400000), `CORS_ORIGIN`, `VITE_API_URL`.

Run with `docker compose up -d --build` or manually (`mvn spring-boot:run`, `npm run dev`). Reseed with `docker compose run --rm -e SPRING_PROFILES_ACTIVE=seed server`.

CI runs via GitHub Actions (`.github/workflows/test.yml`): 4 jobs (server build, server tests w/ MySQL 8, client tests, client build).

## 9. Decisions

| Choice | Reason |
|--------|--------|
| Spring Boot over Express | Opinionated DI, Spring Security, mature JPA/Hibernate |
| MySQL 8 over PostgreSQL | Standard, no PG-specific features, wide hosting support |
| Separate User/Employee | Auth isolated from HR profile data |
| Session auth over JWT | httpOnly session cookie via Spring Session JDBC |
| API polling for notifications | Simple push-less delivery, no WebSocket infra |
| HeroUI v3 (CSS-only) | Design tokens in `index.css`, Tailwind 4 integration |
| TanStack Query | Caching, refetching, optimistic updates |
| Primary blue accent | Single trustworthy blue for actions/focus, muted status colors |
