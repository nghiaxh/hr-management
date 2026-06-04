# HR Management System

A role-based (RBAC) HR management system built with NestJS, MongoDB, React, and shadcn/ui.

## Requirements

- Node.js 18+
- MongoDB 7+ running (default `localhost:27017`)

## Installation & Running

### 1. Server (Backend)

```bash
cd server
npm install
npm run seed    # Create demo data (4 demo accounts)
npm run dev     # API at http://localhost:3001
```

### 2. Client (Frontend)

```bash
cd client
npm install
npm run dev     # UI at http://localhost:5173
```

## Demo Accounts

| Role     | Email              | Password      |
|----------|--------------------|---------------|
| Admin    | admin@hr.com       | admin123      |
| Manager  | manager@hr.com     | manager123    |
| Employee | employee@hr.com    | employee123   |
| Employee | employee2@hr.com   | employee123   |

## Architecture

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
| Method | Path              | Auth | Description          |
|--------|-------------------|------|----------------------|
| POST   | /api/auth/register| No   | Register             |
| POST   | /api/auth/login   | No   | Login                |
| GET    | /api/auth/me      | Yes  | Current user info    |

### Employees
| Method | Path              | Roles         | Description          |
|--------|-------------------|---------------|----------------------|
| GET    | /api/employees    | admin, manager| List                 |
| GET    | /api/employees/:id| all           | Detail               |
| POST   | /api/employees    | admin         | Create               |
| PUT    | /api/employees/:id| admin         | Update               |
| DELETE | /api/employees/:id| admin         | Delete               |

### Departments
| Method | Path                     | Roles         | Description          |
|--------|--------------------------|---------------|----------------------|
| GET    | /api/departments         | admin, manager| List                 |
| GET    | /api/departments/org-chart| admin, manager| Org chart            |
| POST   | /api/departments         | admin         | Create               |
| PUT    | /api/departments/:id     | admin         | Update               |
| DELETE | /api/departments/:id     | admin         | Delete               |

### Leaves
| Method | Path                   | Roles         | Description          |
|--------|------------------------|---------------|----------------------|
| GET    | /api/leaves            | all           | List                 |
| POST   | /api/leaves            | employee      | Create request       |
| PATCH  | /api/leaves/:id/status | admin, manager| Approve/reject       |

### Leave Balance
| Method | Path                         | Roles         | Description          |
|--------|------------------------------|---------------|----------------------|
| GET    | /api/leave-balance/:employeeId| all           | Leave balance        |

### Employee History
| Method | Path                             | Roles         | Description          |
|--------|----------------------------------|---------------|----------------------|
| GET    | /api/employees/:id/history       | all           | Employee history     |
| POST   | /api/employees/:id/history       | admin, manager| Add event            |

### Notifications
| Method | Path                         | Roles | Description              |
|--------|------------------------------|-------|--------------------------|
| GET    | /api/notifications           | all   | Notification list        |
| GET    | /api/notifications/unread-count| all | Unread count             |
| PATCH  | /api/notifications/:id/read  | all   | Mark as read             |
| PATCH  | /api/notifications/read-all  | all   | Mark all as read         |

### Attendance
| Method | Path                      | Roles    | Description          |
|--------|---------------------------|----------|----------------------|
| GET    | /api/attendance           | all      | List                 |
| POST   | /api/attendance/check-in  | employee | Check-in             |
| PATCH  | /api/attendance/:id/check-out | employee | Check-out          |

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

## Client Routes

| Path                 | Roles         | Page                    |
|----------------------|---------------|-------------------------|
| /login               | all           | Login                   |
| /dashboard           | all           | Dashboard               |
| /employees           | admin, manager| Employee list           |
| /employees/:id       | all           | Employee detail         |
| /departments         | admin, manager| Departments             |
| /org-chart           | admin, manager| Organization chart      |
| /leaves              | employee      | My leaves               |
| /leaves/approvals    | admin, manager| Leave approvals         |
| /attendance          | employee      | Attendance              |
| /attendance/report   | admin, manager| Attendance report       |
| /payroll             | employee      | My payroll              |
| /payroll/manage      | admin         | Payroll management      |
| /notifications       | all           | Notifications           |
| /profile             | all           | Profile                 |

## Tech Stack

| Layer         | Technology                               |
|---------------|------------------------------------------|
| Frontend      | React 18, Vite, TypeScript               |
| UI            | shadcn/ui, Tailwind CSS, Radix primitives|
| Backend       | NestJS (Express)                         |
| Database      | MongoDB 7+, Mongoose ODM                 |
| Auth          | JWT (passport-jwt), bcrypt               |
| Client State  | TanStack React Query                     |
| Icons         | lucide-react                             |
| Dates         | date-fns                                 |
