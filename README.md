# HR Management System

Hệ thống quản lý nhân sự phân quyền (RBAC) xây dựng với NestJS, MongoDB, React, shadcn/ui.

## Yêu cầu

- Node.js 18+
- MongoDB 7+ đang chạy (mặc định `localhost:27017`)

## Cài đặt & Chạy

### 1. Server (Backend)

```bash
cd server
npm install
npm run seed    # Tạo dữ liệu mẫu (4 tài khoản demo)
npm run dev     # API tại http://localhost:3001
```

### 2. Client (Frontend)

```bash
cd client
npm install
npm run dev     # UI tại http://localhost:5173
```

## Tài khoản Demo

| Vai trò  | Email              | Mật khẩu      |
|----------|-------------------|---------------|
| Admin    | admin@hr.com      | admin123      |
| Manager  | manager@hr.com    | manager123    |
| Employee | employee@hr.com   | employee123   |
| Employee | employee2@hr.com  | employee123   |

## Kiến trúc

```
hr-management/
├── server/                    # NestJS API
│   ├── src/
│   │   ├── auth/              # Xác thực JWT + phân quyền
│   │   ├── employees/         # Quản lý nhân viên
│   │   ├── departments/       # Quản lý phòng ban
│   │   ├── leaves/            # Quản lý nghỉ phép
│   │   ├── attendance/        # Chấm công
│   │   ├── payroll/           # Bảng lương
│   │   ├── dashboard/         # Thống kê
│   │   ├── employee-history/  # Lịch sử nhân viên
│   │   ├── leave-balance/     # Số dư ngày nghỉ
│   │   ├── notifications/     # Thông báo
│   │   └── seed.ts            # Script tạo dữ liệu mẫu
│   ├── .env                   # Cấu hình (MongoDB URI, JWT Secret)
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
    │   ├── pages/             # Trang theo route
    │   └── types/             # TypeScript interfaces
    └── package.json
```

## Tính năng chi tiết

### Xác thực & Phân quyền (JWT + RBAC)
- Đăng nhập bằng JWT token
- 3 vai trò: **admin**, **manager**, **employee**
- Guard kiểm tra quyền trên từng API
- Route bảo vệ phía client

### Sơ đồ tổ chức (Org Chart)
- Hiển thị cây phòng ban với danh sách nhân viên theo từng phòng
- Xem quản lý phòng ban và số lượng nhân viên

### Dashboard
- **Admin**: tổng nhân viên, phòng ban, đơn nghỉ chờ duyệt, chấm công hôm nay, tổng lương tháng, thống kê theo phòng ban
- **Manager**: số nhân viên trong phòng, đơn chờ duyệt, tổng lương phòng
- **Employee**: đơn nghỉ của tôi, chấm công gần đây, lương gần nhất

### Nhân viên (Employees)
- CRUD đầy đủ (Admin)
- Tìm kiếm theo tên, vị trí
- Lọc theo phòng ban
- Thông tin hợp đồng (loại hợp đồng, ngày hết hạn, tài liệu)
- Lịch sử nhân viên (tăng lương, thăng chức, chuyển phòng)
- **Scope**: Admin xem tất cả, Manager chỉ xem nhân viên trong phòng, Employee chỉ xem hồ sơ của mình

### Phòng ban (Departments)
- CRUD đầy đủ (Admin)
- Gán Manager cho phòng ban
- Manager chỉ xem được phòng ban của mình

### Nghỉ phép (Leaves)
- Employee tạo đơn (sick/annual/personal)
- Admin/Manager duyệt hoặc từ chối
- **Ràng buộc**: endDate >= startDate, tối đa 30 ngày, không trùng lịch approved
- **Theo dõi số dư**: tự động trừ ngày phép khi duyệt, hiển thị ngày còn lại

### Chấm công (Attendance)
- Employee check-in/check-out hàng ngày
- **Tự động**: check-in sau 9h → late, làm dưới 4h → half-day
- Manager xem báo cáo chấm công

### Bảng lương (Payroll)
- Admin process hàng loạt theo tháng
- Tính netPay = basicSalary + bonus - deductions
- Admin đánh dấu đã trả lương
- Employee xem lịch sử lương

### Thông báo (Notifications)
- Thông báo trong ứng dụng khi đơn nghỉ được duyệt/từ chối
- Bell icon hiển thị số thông báo chưa đọc
- Trang thông báo riêng với danh sách đầy đủ

## API Endpoints

### Auth
| Method | Path              | Auth | Mô tả              |
|--------|-------------------|------|--------------------|
| POST   | /api/auth/register| No   | Đăng ký            |
| POST   | /api/auth/login   | No   | Đăng nhập          |
| GET    | /api/auth/me      | Yes  | Thông tin user     |

### Employees
| Method | Path              | Roles         | Mô tả              |
|--------|-------------------|---------------|--------------------|
| GET    | /api/employees    | admin, manager| Danh sách          |
| GET    | /api/employees/:id| all           | Chi tiết           |
| POST   | /api/employees    | admin         | Tạo mới            |
| PUT    | /api/employees/:id| admin         | Cập nhật           |
| DELETE | /api/employees/:id| admin         | Xóa                |

### Departments
| Method | Path                     | Roles         | Mô tả              |
|--------|--------------------------|---------------|--------------------|
| GET    | /api/departments         | admin, manager| Danh sách          |
| GET    | /api/departments/org-chart| admin, manager| Sơ đồ tổ chức     |
| POST   | /api/departments         | admin         | Tạo mới            |
| PUT    | /api/departments/:id     | admin         | Cập nhật           |
| DELETE | /api/departments/:id     | admin         | Xóa                |

### Leaves
| Method | Path                   | Roles         | Mô tả              |
|--------|------------------------|---------------|--------------------|
| GET    | /api/leaves            | all           | Danh sách          |
| POST   | /api/leaves            | employee      | Tạo đơn            |
| PATCH  | /api/leaves/:id/status | admin, manager| Duyệt/từ chối      |

### Leave Balance
| Method | Path                         | Roles         | Mô tả              |
|--------|------------------------------|---------------|--------------------|
| GET    | /api/leave-balance/:employeeId| all           | Số dư ngày nghỉ   |

### Employee History
| Method | Path                             | Roles         | Mô tả              |
|--------|----------------------------------|---------------|--------------------|
| GET    | /api/employees/:id/history       | all           | Lịch sử nhân viên  |
| POST   | /api/employees/:id/history       | admin, manager| Thêm sự kiện       |

### Notifications
| Method | Path                         | Roles | Mô tả                    |
|--------|------------------------------|-------|--------------------------|
| GET    | /api/notifications           | all   | Danh sách thông báo      |
| GET    | /api/notifications/unread-count| all | Số thông báo chưa đọc    |
| PATCH  | /api/notifications/:id/read  | all   | Đánh dấu đã đọc          |
| PATCH  | /api/notifications/read-all  | all   | Đánh dấu tất cả đã đọc   |

### Attendance
| Method | Path                      | Roles    | Mô tả              |
|--------|---------------------------|----------|--------------------|
| GET    | /api/attendance           | all      | Danh sách          |
| POST   | /api/attendance/check-in  | employee | Check-in           |
| PATCH  | /api/attendance/:id/check-out | employee | Check-out       |

### Payroll
| Method | Path                  | Roles | Mô tả              |
|--------|-----------------------|-------|--------------------|
| GET    | /api/payroll          | all   | Danh sách          |
| POST   | /api/payroll/process  | admin | Process hàng loạt  |
| PATCH  | /api/payroll/:id/pay  | admin | Đánh dấu đã trả    |

### Dashboard
| Method | Path            | Roles | Mô tả              |
|--------|-----------------|-------|--------------------|
| GET    | /api/dashboard  | all   | Thống kê theo role |

## Client Routes

| Path                 | Roles         | Trang                  |
|----------------------|---------------|------------------------|
| /login               | all           | Đăng nhập              |
| /dashboard           | all           | Tổng quan              |
| /employees           | admin, manager| Danh sách nhân viên    |
| /employees/:id       | all           | Chi tiết nhân viên     |
| /departments         | admin, manager| Phòng ban              |
| /org-chart           | admin, manager| Sơ đồ tổ chức          |
| /leaves              | employee      | Đơn nghỉ của tôi       |
| /leaves/approvals    | admin, manager| Phê duyệt đơn          |
| /attendance          | employee      | Chấm công              |
| /attendance/report   | admin, manager| Báo cáo chấm công      |
| /payroll             | employee      | Lương của tôi          |
| /payroll/manage      | admin         | Quản lý lương          |
| /notifications       | all           | Thông báo              |
| /profile             | all           | Hồ sơ cá nhân          |

## Tech Stack

| Layer      | Công nghệ                                |
|------------|------------------------------------------|
| Frontend   | React 18, Vite, TypeScript               |
| UI         | shadcn/ui, Tailwind CSS, Radix primitives|
| Backend    | NestJS (Express)                         |
| Database   | MongoDB 7+, Mongoose ODM                 |
| Auth       | JWT (passport-jwt), bcrypt               |
| Client State | TanStack React Query                   |
| Icons      | lucide-react                             |
| Dates      | date-fns                                 |
