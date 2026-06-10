# AGENTS.md — HR Management

Two independent packages: `server/` (NestJS + MongoDB) and `client/` (React + Vite). No root workspace config.

## Commands

```bash
# Server (port 3001)
cd server
npm install
cp .env.example .env   # then edit JWT_SECRET
npm run seed           # 1 admin, 6 managers, ~50 employees across 6 departments
npm run dev            # ts-node, not NestJS CLI (no nest-cli.json)

# Client (port 5173)
cd client
npm install
npm run dev            # Vite
npm run build          # tsc && vite build
```

## Server feature modules

All modules follow the NestJS convention: `module` → `controller` → `service` → `schemas/` + `dto/`.

| Module           | Entry file                        | Notes                              |
|------------------|-----------------------------------|------------------------------------|
| Auth             | `server/src/auth/`                | JWT + passport-jwt + bcryptjs      |
| Employees        | `server/src/employees/`           | Scoped by role via `findAll` query |
| Departments      | `server/src/departments/`         | Manager assignment                 |
| Leaves           | `server/src/leaves/`              | Validation: max 30d, no overlap    |
| Attendance       | `server/src/attendance/`          | Auto late/half-day logic           |
| Payroll          | `server/src/payroll/`             | Monthly batch processing           |
| Dashboard        | `server/src/dashboard/`           | Stats vary by user role            |
| EmployeeHistory  | `server/src/employee-history/`    | Raise/promotion/transfer timeline  |
| LeaveBalance     | `server/src/leave-balance/`       | Auto-deduct on leave approval      |
| Notifications    | `server/src/notifications/`       | In-app notifications + mark-read   |
| Recruitment      | `server/src/recruitment/`         | Job postings + candidates          |
| PerformanceReview| `server/src/performance-reviews/` | Employee performance reviews       |

## Architecture

- **Server** (`server/src/main.ts`): NestJS, global prefix `/api`, CORS from env `CORS_ORIGIN`. Config from `server/.env`. Path alias `@/*` → `src/*`.
- **Client** (`client/src/main.tsx`): Vite dev server, shadcn/ui + Tailwind + Radix. Axios at `VITE_API_URL` env var (default `http://localhost:3001/api`), JWT from localStorage. Path alias `@/` → `./src/*`.
- **Auth**: JWT (passport-jwt), `@Roles()` decorator + `RolesGuard`. Tokens expire in `JWT_EXPIRES_IN` (default `1d`). `JWT_SECRET` is **required** at startup.
- **RBAC roles**: `admin` (full access), `manager` (department-scoped), `employee` (self only).
- **Data model**: `User` (auth credentials + role) and `Employee` (HR profile + salary + department + contractType + documents) are separate schemas linked by `userId`. Additional models: `EmployeeHistory`, `LeaveBalance`, `Notification`, `JobPosting`, `Candidate`, `PerformanceReview`.
- **Security**: Rate limiting (60 req/min via `@nestjs/throttler`), helmet headers, file uploads limited to 5MB (JPEG/PNG/GIF/PDF/DOC/DOCX), passwords require min 8 chars with uppercase+lowercase+digit, WebSocket auth via JWT handshake, search inputs regex-escaped.
- **Registration**: Always creates `employee` role — admin/manager roles are set via seed or direct DB update.

## Key facts

- **No tests, no linter, no CI, no typecheck script.** No pre-commit hooks.
- Seed is required before first dev run. Drops all data and recreates — safe to re-run.
- Client uses `"type": "module"`; server uses CommonJS.
- All API routes are protected by `JwtAuthGuard` + `RolesGuard` (except `/api/auth/login` and `/api/auth/register`).
- `server/.env` is NOT tracked in git — copy from `.env.example`.
- `employee` role users access their own data enforced server-side; `manager` role is scoped to their department.

## Git commit convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `style`, `perf`, `test`, `ci`, `build`.

- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation changes
- `refactor` — code refactoring (no behavior change)
- `chore` — maintenance, dependencies, config
- `style` — code formatting, CSS
- `ci` — CI/CD
- `build` — build system

Scope (optional) is the affected module/directory. E.g. `feat(auth):`, `fix(leaves):`, `chore(deps):`.

Write descriptions in English, present tense, lowercase, no trailing period.
