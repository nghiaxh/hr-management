# Design — HR Management

## System architecture

```
┌─────────────┐         ┌─────────────┐         ┌──────────┐
│   Client     │  HTTP   │   Server    │  Mongoose│ MongoDB  │
│  (React 18)  │◄───────►│  (NestJS 11) │◄────────►│  (NoSQL)  │
│  Port 5173   │  REST   │  Port 3001  │          │  Local   │
└─────────────┘         └─────────────┘         └──────────┘
       │                       │
   JWT token              JWT auth guard
   (localStorage)         passport-jwt + bcrypt
```

## Data model

### User (auth credentials)
- `_id`, `email`, `password` (bcrypt), `role` (admin | manager | employee), `isActive`

### Employee (HR profile)
- `_id`, `userId` (→ User), `fullName`, `position`, `departmentId` (→ Department)
- `salary`, `contractType`, `startDate`, `phone`, `address`, `documents[]`

### Department
- `_id`, `name`, `managerId` (→ Employee), `description`

### Leave
- `_id`, `employeeId` (→ Employee), `type`, `startDate`, `endDate`, `status` (pending | approved | rejected)
- Validations: max 30 consecutive days, no overlapping dates

### Attendance
- `_id`, `employeeId`, `date`, `checkIn`, `checkOut`, `status` (present | late | half-day | absent)

### Payroll
- `_id`, `employeeId`, `month`, `year`, `baseSalary`, `deductions`, `bonuses`, `netPay`

### EmployeeHistory
- `_id`, `employeeId`, `type` (raise | promotion | transfer), `previousValue`, `newValue`, `date`

### LeaveBalance
- `_id`, `employeeId`, `year`, `annual`, `sick`, `personal`, `used`

### Notification
- `_id`, `userId`, `title`, `message`, `isRead`, `createdAt`

## RBAC model

| Role | Access |
|---|---|
| `admin` | Full access: all modules, all employees, all departments |
| `manager` | Department-scoped: own department's employees, leave approvals |
| `employee` | Self only: own profile, own leaves, own attendance |

Guards: `JwtAuthGuard` (all routes except login/register) + `RolesGuard` with `@Roles()` decorator.

## Client routing

| Route | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/dashboard` | Dashboard | All roles |
| `/employees` | Employee list | Admin, Manager |
| `/employees/:id` | Employee detail | Admin, Manager |
| `/departments` | Departments | Admin, Manager |
| `/org-chart` | Org chart | All roles |
| `/leaves` | My leaves | All roles |
| `/leaves/approvals` | Leave approvals | Admin, Manager |
| `/attendance` | My attendance | All roles |
| `/attendance/report` | Attendance report | Admin, Manager |
| `/payroll` | My payroll | All roles |
| `/payroll/manage` | Payroll management | Admin |
| `/notifications` | Notifications | All roles |
| `/profile` | Profile | All roles |

## UI layout

```
┌─────────────────────────────────────────┐
│  Sidebar (nav links)   │  Main content   │
│                        │                 │
│  • Dashboard           │  (page content) │
│  • Employees           │                 │
│  • Departments         │                 │
│  • Leaves              │                 │
│  • Attendance          │                 │
│  • Payroll             │                 │
│  • Notifications       │                 │
│                        │                 │
│  User avatar + logout  │                 │
└─────────────────────────────────────────┘
```

- Sidebar: Fixed left, collapsed on mobile
- Top bar: Breadcrumb + notification bell
- Content: Padding container, responsive

## Design decisions

- **Separate User/Employee schemas**: Auth concerns vs HR profile concerns. A `User` may exist without an `Employee` record (e.g., future expansion).
- **Server CommonJS, Client ESM**: No root workspace; each package standalone.
- **No tests/linter**: Explicit choice to keep scope minimal. Seed script is the only validation gate.
- **API prefix `/api`**: All server routes namespaced for proxy compatibility.
