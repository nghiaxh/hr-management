# AGENTS.md — HR Management

Two independent packages: `server/` (NestJS + MongoDB) and `client/` (React + Vite). No root workspace config.

## Commands

```bash
# Server (port 3001)
cd server
npm install
npm run seed    # 4 demo accounts, 2 departments, 4 employees
npm run dev     # ts-node, not NestJS CLI (no nest-cli.json)

# Client (port 5173)
cd client
npm install
npm run dev     # Vite
npm run build   # tsc && vite build
```

## Server feature modules

All modules follow the NestJS convention: `module` → `controller` → `service` → `schemas/` + `dto/`.

| Module       | Entry file                  | Notes                              |
|--------------|-----------------------------|------------------------------------|
| Auth         | `server/src/auth/`          | JWT + passport-jwt + bcryptjs      |
| Employees    | `server/src/employees/`     | Scoped by role via `findAll` query |
| Departments  | `server/src/departments/`   | Manager assignment                 |
| Leaves       | `server/src/leaves/`        | Validation: max 30d, no overlap    |
| Attendance   | `server/src/attendance/`    | Auto late/half-day logic           |
| Payroll      | `server/src/payroll/`       | Monthly batch processing           |
| Dashboard    | `server/src/dashboard/`     | Stats vary by user role            |

## Architecture

- **Server** (`server/src/main.ts`): NestJS, global prefix `/api`, CORS to `http://localhost:5173`. Config from `server/.env` (loaded by `dotenv/config`). Default MongoDB at `mongodb://localhost:27017/hr-management`, JWT secret `hr-management-secret-key-2026`. Path alias `@/*` → `src/*`.
- **Client** (`client/src/main.tsx`): Vite dev server, shadcn/ui + Tailwind + Radix. Axios at `http://localhost:3001/api`, JWT from localStorage. Path alias `@/` → `./src/*`.
- **Auth**: JWT (passport-jwt), `@Roles()` decorator + `RolesGuard`. Tokens expire in 7d by default.
- **RBAC roles**: `admin` (full access), `manager` (department-scoped), `employee` (self only).
- **Data model**: `User` (auth credentials + role) and `Employee` (HR profile + salary + department) are separate schemas linked by `userId`.
- **Client routes** (App.tsx): `/login`, `/dashboard`, `/employees`, `/employees/:id`, `/departments`, `/leaves`, `/leaves/approvals`, `/attendance`, `/attendance/report`, `/payroll`, `/payroll/manage`.

## Key facts

- **No tests, no linter, no CI, no typecheck script.** No pre-commit hooks.
- Seed is required before first dev run. Drops no data — safe to re-run.
- Client uses `"type": "module"`; server uses CommonJS.
- All API routes are protected by `JwtAuthGuard` + `RolesGuard` (except `/api/auth/login` and `/api/auth/register`).
- `server/.env` is NOT tracked in git — if missing, copy defaults from `server/src/main.ts` and `server/src/auth/auth.module.ts`.
