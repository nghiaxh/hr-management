# HR Management System

A role-based (RBAC) HR management system built with NestJS, MongoDB, React, and shadcn/ui.

## Requirements

### Native
- Node.js 18+
- MongoDB 7+ running (default `localhost:27017`)

### Docker
- Docker + Docker Compose

## Quick Start

### 1. Environment Setup

Copy and configure environment files:

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your settings (defaults work for local dev)
```

### 2. Server (Backend)

Choose one:

```bash
# Option A: Docker (MongoDB + server)
docker compose up -d

# Option B: Native
cd server
npm install
npm run seed    # Create demo data (1 admin, 6 managers, ~50 employees)
npm run dev     # API at http://localhost:3001
```

### 3. Client (Frontend)

```bash
cd client
npm install
npm run dev     # UI at http://localhost:5173
```

## Environment Variables

### Server (`server/.env`)

| Variable         | Default                                       | Description                |
|------------------|-----------------------------------------------|----------------------------|
| `MONGODB_URI`    | `mongodb://localhost:27017/hr-management`     | MongoDB connection string  |
| `JWT_SECRET`     | *(required)*                                  | JWT signing secret (min 32 chars, strong random) |
| `JWT_EXPIRES_IN` | `1d`                                          | Token expiry duration      |
| `PORT`           | `3001`                                        | API port                   |
| `CORS_ORIGIN`    | `http://localhost:5173`                       | Allowed CORS origin        |

> **Security**: `JWT_SECRET` is required. The app will refuse to start if not set. Use a strong random value (e.g. `openssl rand -hex 32`).

### Client (`client/.env`)

| Variable       | Default                            | Description         |
|----------------|------------------------------------|---------------------|
| `VITE_API_URL` | `http://localhost:3001/api`        | API base URL        |

## Demo Accounts

| Role     | Email              | Password      |
|----------|--------------------|---------------|
| Admin    | admin@hr.com       | admin123      |
| Manager  | eng.manager@hr.com | manager123    |
| Employee | emp01@hr.com       | employee123   |
| Employee | emp02@hr.com       | employee123   |

## Development

### Project Structure

```
hr-management/
├── server/                    # NestJS API (CommonJS)
│   ├── src/
│   │   ├── auth/              # JWT auth + authorization
│   │   ├── employees/         # Employee CRUD
│   │   ├── departments/       # Department CRUD
│   │   ├── leaves/            # Leave requests
│   │   ├── attendance/        # Check-in/out
│   │   ├── payroll/           # Monthly payroll
│   │   ├── dashboard/         # Role-based stats
│   │   ├── employee-history/  # Raises, promotions
│   │   ├── leave-balance/     # Leave balance tracking
│   │   ├── notifications/     # In-app notifications
│   │   ├── recruitment/       # Job postings + candidates
│   │   ├── performance-reviews/ # Performance reviews
│   │   └── seed.ts            # Full demo data seeder
│   ├── .env                   # Server config (not tracked)
│   └── package.json
│
└── client/                    # React SPA (ESM)
    ├── src/
    │   ├── api/               # Axios client + modules
    │   ├── components/
    │   │   ├── ui/            # shadcn primitives
    │   │   ├── layout/        # Sidebar, AppLayout
    │   │   └── shared/        # StatusBadge, PageHeader
    │   ├── context/           # AuthContext, LanguageContext
    │   ├── hooks/             # useSocket, useTheme
    │   ├── pages/             # Route pages by feature
    │   └── types/             # TypeScript interfaces
    └── package.json
```

### Development Workflow

1. **Start MongoDB** — `docker compose up -d mongodb` or run locally (default port 27017)
2. **Configure `server/.env`** — copy from `.env.example` and set `JWT_SECRET`
3. **Run seed** (`npm run seed` in `server/`) — creates demo data. Safe to re-run (clears & recreates)
4. **Start server** (`npm run dev` in `server/`) — hot-reload via tsx
5. **Start client** (`npm run dev` in `client/`) — Vite dev server with HMR

### Security Notes

- All API routes are protected by `JwtAuthGuard` + `RolesGuard` (except `/api/auth/login`)
- Registration always creates `employee` role users (admin/manager roles are set via seed only)
- Passwords require: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit
- Rate limiting: 60 requests per minute globally (via `@nestjs/throttler`)
- Security headers set via `helmet` middleware
- File uploads restricted to 5MB, image/PDF/DOC types only
- WebSocket connections authenticated via JWT token handshake
- Search inputs are regex-escaped to prevent ReDoS attacks

### Seed Data

The seed script (`server/src/seed.ts`) creates:

- **1 admin** — `admin@hr.com`
- **6 managers** — one per department (Engineering, HR, Sales, Marketing, Finance, BA)
- **~50 employees** — distributed across departments with realistic Vietnamese names
- **Departments** with managers assigned
- **Leave balances** initialized for all employees
- **Employee history** entries (salary raises, promotions)

Run it anytime to reset the database to a known state.

```
hr-management/
├── server/                    # NestJS API
│   ├── src/
│   │   ├── auth/              # JWT auth + authorization
│   │   ├── employees/         # Employee management
│   │   ├── departments/       # Department management
│   │   ├── leaves/            # Leave management
│   │   ├── attendance/        # Attendance tracking
│   │   ├── payroll/           # Payroll processing
│   │   ├── dashboard/         # Statistics & reports
│   │   ├── employee-history/  # Employee history timeline
│   │   ├── leave-balance/     # Leave balance tracking
│   │   ├── notifications/     # In-app notifications
│   │   └── seed.ts            # Demo data seeder
│   ├── .env                   # Config (MongoDB URI, JWT Secret)
│   └── package.json
│
└── client/                    # React SPA
    ├── src/
    │   ├── api/               # Axios client + modules
    │   ├── components/
    │   │   ├── ui/            # shadcn primitives
    │   │   ├── layout/        # Sidebar, AppLayout
    │   │   └── shared/        # StatusBadge, PageHeader
    │   ├── context/           # AuthContext
    │   ├── pages/             # Route pages
    │   └── types/             # TypeScript interfaces
    └── package.json
```

## Features

### Authentication & Authorization (JWT + RBAC)
- JWT token-based login
- 3 roles: **admin**, **manager**, **employee**
- Role guard on every API endpoint
- Protected client-side routes

### Org Chart
- Tree view of departments with employee lists
- View department managers and employee counts

### Dashboard
- **Admin**: total employees, departments, pending leaves, today's attendance, monthly payroll, department statistics
- **Manager**: department employee count, pending approvals, department payroll
- **Employee**: my leave requests, recent attendance, latest payslip

### Employees
- Full CRUD (Admin)
- Search by name, position
- Filter by department
- Contract info (contract type, expiry date, documents)
- Employee history (salary changes, promotions, transfers)
- **Scope**: Admin sees all, Manager sees department only, Employee sees self only

### Departments
- Full CRUD (Admin)
- Assign Manager to department
- Manager can only view their own department

### Leaves
- Employee creates requests (sick/annual/personal)
- Admin/Manager approve or reject
- **Validation**: endDate >= startDate, max 30 days, no overlapping approved leaves
- **Balance tracking**: auto-deduct on approval, display remaining days

### Attendance
- Employee check-in/check-out daily
- **Auto rules**: check-in after 9 AM → late, working < 4h → half-day
- Manager views attendance reports

### Payroll
- Admin batch processing by month
- Calculates netPay = basicSalary + bonus - deductions
- Admin marks as paid
- Employee views salary history

### Notifications
- In-app notifications when leave is approved/rejected
- Bell icon with unread count
- Dedicated notifications page with full list

## API Endpoints

### Auth
| Method | Path               | Auth | Description            |
|--------|--------------------|------|------------------------|
| POST   | /api/auth/register | No   | Register (always employee role) |
| POST   | /api/auth/login    | No   | Login                  |
| GET    | /api/auth/me       | Yes  | Current user info      |
| PUT    | /api/auth/profile  | Yes  | Update profile         |
| POST   | /api/auth/change-password | Yes | Change password    |

### Employees
| Method | Path                         | Roles         | Description          |
|--------|------------------------------|---------------|----------------------|
| GET    | /api/employees               | admin, manager| List                 |
| GET    | /api/employees/export        | admin, manager| CSV export           |
| GET    | /api/employees/:id           | all           | Detail               |
| POST   | /api/employees               | admin         | Create               |
| PUT    | /api/employees/:id           | admin         | Update               |
| DELETE | /api/employees/:id           | admin         | Delete               |
| POST   | /api/employees/bulk-delete   | admin         | Bulk delete          |
| POST   | /api/employees/:id/documents | admin         | Upload document      |
| DELETE | /api/employees/:id/documents/:docId | admin  | Remove document      |

### Departments
| Method | Path                       | Roles         | Description          |
|--------|----------------------------|---------------|----------------------|
| GET    | /api/departments           | admin, manager| List                 |
| GET    | /api/departments/org-chart | admin, manager| Org chart            |
| GET    | /api/departments/:id       | admin, manager| Detail               |
| POST   | /api/departments           | admin         | Create               |
| PUT    | /api/departments/:id       | admin         | Update               |
| DELETE | /api/departments/:id       | admin         | Delete               |

### Leaves
| Method | Path                    | Roles            | Description          |
|--------|-------------------------|------------------|----------------------|
| GET    | /api/leaves             | all              | List                 |
| POST   | /api/leaves             | employee         | Create request       |
| GET    | /api/leaves/:id         | all              | Detail               |
| PATCH  | /api/leaves/:id/status  | admin, manager   | Approve/reject       |

### Leave Balance
| Method | Path                         | Roles            | Description          |
|--------|------------------------------|------------------|----------------------|
| GET    | /api/leave-balance/my        | all              | My leave balance     |
| GET    | /api/leave-balance/:employeeId | admin, manager  | Employee's balance   |

### Employee History
| Method | Path                             | Roles         | Description          |
|--------|----------------------------------|---------------|----------------------|
| GET    | /api/employees/:id/history       | all           | Employee history     |
| POST   | /api/employees/:id/history       | admin, manager| Add event            |

### Notifications
| Method | Path                           | Roles | Description              |
|--------|--------------------------------|-------|--------------------------|
| GET    | /api/notifications             | all   | Notification list        |
| GET    | /api/notifications/unread-count| all   | Unread count             |
| PATCH  | /api/notifications/:id/read    | all   | Mark as read             |
| PATCH  | /api/notifications/read-all    | all   | Mark all as read         |

### Attendance
| Method | Path                         | Roles    | Description          |
|--------|------------------------------|----------|----------------------|
| GET    | /api/attendance              | all      | List                 |
| POST   | /api/attendance/check-in     | employee | Check-in             |
| PATCH  | /api/attendance/:id/check-out| employee | Check-out            |

### Payroll
| Method | Path                  | Roles | Description          |
|--------|-----------------------|-------|----------------------|
| GET    | /api/payroll          | all   | List                 |
| POST   | /api/payroll/process  | admin | Batch process        |
| PATCH  | /api/payroll/:id/pay  | admin | Mark as paid         |

### Dashboard
| Method | Path            | Roles | Description          |
|--------|-----------------|-------|----------------------|
| GET    | /api/dashboard  | all   | Role-based stats     |

### Recruitment
| Method | Path                         | Roles         | Description          |
|--------|------------------------------|---------------|----------------------|
| GET    | /api/job-postings            | admin, manager| List job postings    |
| GET    | /api/job-postings/:id        | admin, manager| Job posting detail   |
| POST   | /api/job-postings            | admin         | Create job posting   |
| PUT    | /api/job-postings/:id        | admin         | Update job posting   |
| DELETE | /api/job-postings/:id        | admin         | Delete job posting   |
| GET    | /api/candidates              | admin, manager| List candidates      |
| GET    | /api/candidates/:id          | admin, manager| Candidate detail     |
| POST   | /api/candidates              | admin, manager| Create candidate     |
| PUT    | /api/candidates/:id          | admin, manager| Update candidate     |
| DELETE | /api/candidates/:id          | admin         | Delete candidate     |

### Performance Reviews
| Method | Path                              | Roles         | Description              |
|--------|-----------------------------------|---------------|--------------------------|
| GET    | /api/performance-reviews          | all           | List reviews             |
| GET    | /api/performance-reviews/:id      | all           | Review detail            |
| POST   | /api/performance-reviews          | admin, manager| Create review            |
| PUT    | /api/performance-reviews/:id      | admin, manager| Update review            |
| DELETE | /api/performance-reviews/:id      | admin         | Delete review            |

## Client Routes

| Path                          | Roles            | Page                       |
|-------------------------------|------------------|----------------------------|
| /login                        | public           | Login                      |
| /dashboard                    | all              | Dashboard                  |
| /employees                    | admin, manager   | Employee list              |
| /employees/:id                | all              | Employee detail            |
| /departments                  | admin, manager   | Departments                |
| /org-chart                    | admin, manager   | Organization chart         |
| /leaves                       | all              | My leaves                  |
| /leaves/approvals             | admin, manager   | Leave approvals            |
| /attendance                   | all              | My attendance              |
| /attendance/report            | admin, manager   | Attendance report          |
| /payroll                      | all              | My payroll                 |
| /payroll/manage               | admin            | Payroll management         |
| /notifications                | all              | Notifications              |
| /profile                      | all              | Profile                    |
| /recruitment/job-postings     | admin, manager   | Job postings               |
| /recruitment/candidates       | admin, manager   | Candidates                 |
| /performance-reviews          | all              | My reviews                 |
| /performance-reviews/manage   | admin, manager   | Review management          |

## Tech Stack

| Layer         | Technology                               |
|---------------|------------------------------------------|
| Frontend      | React 18, Vite, TypeScript               |
| UI            | shadcn/ui, Tailwind CSS, Radix primitives|
| Backend       | NestJS (Express)                         |
| Database      | MongoDB 8+, Mongoose ODM                  |
| Auth          | JWT (passport-jwt), bcrypt               |
| Client State  | TanStack React Query                     |
| Icons         | lucide-react                             |
| Dates         | date-fns                                 |
