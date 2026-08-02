# Hệ thống Quản lý Nhân sự

Hệ thống quản lý nhân sự (HR Management) với phân quyền RBAC được xây dựng bằng Spring Boot, MySQL 8, React và HeroUI.

## Yêu cầu

### Hệ thống
- Java 25+
- MySQL 8+ đang chạy (mặc định `localhost:3306`)
- Maven (đi kèm `mvnw` trong dự án)

## Bắt đầu nhanh

### Cách 1 — Docker (khuyên dùng)

Chạy toàn bộ hệ thống (MySQL + server + client) chỉ với một lệnh:

```powershell
Copy-Item .env.example .env      # Tạo file .env từ mẫu (đã bị gitignore)
# Sửa .env: đặt JWT_SECRET bằng giá trị mạnh (ví dụ: openssl rand -hex 32)
docker compose up -d --build     # Lần đầu: tạo image + khởi động + tự seed dữ liệu mẫu
```

- UI: http://localhost:5173
- API: http://localhost:3001
- Khi sửa code: chạy lại `docker compose up -d --build` để rebuild và cập nhật.
- Lần chạy sau: dữ liệu MySQL được giữ (volume), seed tự bỏ qua nếu DB đã có dữ liệu.
- Chi tiết xem mục [Docker](#docker).

### Cách 2 — Phát triển thủ công

#### 1. Tạo database (nếu không dùng Docker)

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS hr_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### 2. Server (Backend)

```bash
cd server
mvn spring-boot:run -D "spring-boot.run.profiles=seed"   # Tạo dữ liệu mẫu (seed xong tự thoát)
mvn spring-boot:run                                     # API tại http://localhost:3001
```

#### 3. Client (Frontend)

```bash
cd client
npm install
npm run dev     # UI tại http://localhost:5173
```

> Lưu ý: khi phát triển thủ công, server đọc cấu hình từ file `.env` ở thư mục gốc, client (Vite) cũng đọc từ `.env` gốc (qua `envDir`).

## Biến môi trường

Mọi cấu hình đều tập trung trong một file `.env` ở **thư mục gốc** dự án. Copy mẫu `/.env.example` thành `/.env` rồi điền giá trị. Docker Compose đọc file này trực tiếp; Spring Boot import qua `spring.config.import`; Vite đọc qua `envDir`.

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| `MYSQL_DATABASE` | `hr_management` | Tên database MySQL |
| `MYSQL_ROOT_PASSWORD` | `root` | Mật khẩu root MySQL |
| `DB_URL` | `jdbc:mysql://localhost:3306/hr_management?...` | Chuỗi kết nối MySQL (dev thủ công) |
| `DB_USERNAME` | `root` | Tên đăng nhập DB |
| `DB_PASSWORD` | `root` | Mật khẩu DB |
| `SERVER_PORT` | `3001` | Cổng API (server + host mapping của Compose) |
| `JWT_SECRET` | *(bắt buộc)* | Khóa bí mật JWT (tối thiểu 32 ký tự) |
| `JWT_EXPIRATION` | `86400000` | Thời hạn token (ms) |
| `CORS_ORIGIN` | `http://localhost:5173` | Nguồn CORS được phép |
| `VITE_API_URL` | `http://localhost:3001/api` | URL gốc API (Vite, được nạp khi build client) |

> **Bảo mật**: `JWT_SECRET` là bắt buộc — server sẽ không khởi động nếu thiếu. Sử dụng giá trị ngẫu nhiên mạnh (ví dụ: `openssl rand -hex 32`). Không đặt trực tiếp giá trị bí mật trong `application.properties`. Trong Docker, Compose trả về lỗi nếu `JWT_SECRET` chưa được khai báo trong `.env`.

## Docker

Có 3 service trong `docker-compose.yml`:

| Service  | Image/Base      | Cổng    | Vai trò                        |
|----------|-----------------|---------|--------------------------------|
| `database` | `mysql:8`       | `3306`  | Database (volume `database_data`) |
| `server` | Maven build → `eclipse-temurin:25-jre` | `3001` | Spring Boot API        |
| `client` | Node build → `nginx:alpine` | `5173` | React SPA (nginx phục vụ `dist/`) |

### Lệnh thường dùng

| Mục đích | Lệnh |
|----------|------|
| Khởi động lần đầu / cập nhật sau khi sửa code | `docker compose up -d --build` |
| Xem log | `docker compose logs -f` |
| Dừng (giữ dữ liệu MySQL) | `docker compose down` |
| Xóa hoàn toàn kể cả database | `docker compose down -v` |
| Seed lại dữ liệu mẫu (xóa + tạo mới) | `docker compose run --rm -e SPRING_PROFILES_ACTIVE=seed server` |

### Hoạt động seed tự động

- Lần đầu `up` với database rỗng: server tự seed dữ liệu mẫu (`FirstRunSeeder`).
- Các lần `up` sau: nếu DB đã có dữ liệu, seed được **bỏ qua** — dữ liệu không bị xóa.
- Muốn reset dữ liệu về mặc định: dùng lệnh seed lại ở trên hoặc `docker compose down -v`.

### Lưu ý

- `VITE_API_URL` được nạp vào lúc **build** image client — đổi biến này cần chạy lại `docker compose up -d --build`.
- Trong Docker, server kết nối MySQL qua hostname `database` (mạng nội bộ Compose), không phải `localhost`.

## Tài khoản dùng thử

| Vai trò    | Email              | Mật khẩu      |
|------------|--------------------|---------------|
| Admin      | admin@hr.com       | admin123      |
| Quản lý    | eng.manager@hr.com | manager123    |
| Nhân viên  | emp01@hr.com       | employee123   |

## Phát triển

### Cấu trúc dự án

```
hr-management/
├── server/                    # Spring Boot + Maven
│   ├── src/main/java/com/hrmanagement/
│   │   ├── auth/             # Xác thực, JWT, filter
│   │   ├── employee/         # Entity, repository, service, controller
│   │   ├── department/       # Phòng ban
│   │   ├── leave/            # Nghỉ phép
│   │   ├── attendance/       # Chấm công
│   │   ├── payroll/          # Bảng lương
│   │   ├── notification/     # Thông báo
│   │   ├── employeehistory/  # Lịch sử nhân viên
│   │   ├── leavebalance/     # Ngày phép tồn
│   │   ├── dashboard/        # Thống kê
│   │   ├── seed/             # Seed dữ liệu mẫu (DataSeeder)
│   │   ├── config/           # Security, CORS config
│   │   └── common/util/      # Tiện ích
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   └── mvnw
│
└── client/                    # React SPA (ESM)
    ├── src/
    │   ├── api/               # Axios client + modules
    │   ├── components/
    │   │   ├── ui/            # HeroUI wrapper components
    │   │   ├── layout/        # Sidebar, AppLayout
    │   │   └── shared/        # StatusBadge, PageHeader
    │   ├── context/           # AuthContext, LanguageContext
    │   ├── hooks/             # useTheme, useDebounce, v.v.
    │   ├── pages/             # Trang theo tính năng
    │   └── types/             # TypeScript interfaces
    └── package.json
```

### Quy trình phát triển

1. **Khởi động MySQL** — chạy Docker (`docker compose up -d` tại thư mục gốc) hoặc local (cổng mặc định 3306), tạo database `hr_management`
2. **Cấu hình `.env`** — copy `/.env.example` thành `/.env` ở thư mục gốc, đặt `JWT_SECRET` (server đọc qua `spring.config.import`, client qua `envDir`)
3. **Chạy seed** (`mvn spring-boot:run -D spring-boot.run.profiles=seed` trong `server/`) — tạo dữ liệu mẫu (1 admin, 6 quản lý, ~50 nhân viên). An toàn khi chạy lại (xóa và tạo mới)
4. **Khởi động server** (`mvn spring-boot:run` trong `server/`) — Spring Boot API tại port 3001
5. **Khởi động client** (`npm run dev` trong `client/`) — Vite dev server với HMR

### Ghi chú bảo mật

- Tất cả API route đều được bảo vệ bởi `JwtAuthenticationFilter` + Spring Security (ngoại trừ `/api/auth/login` và `/api/auth/register`)
- Đăng ký luôn tạo tài khoản với vai trò `employee` (vai trò admin/manager chỉ được đặt qua seed)
- Mật khẩu yêu cầu: tối thiểu 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số
- Upload file giới hạn 5MB, chỉ chấp nhận ảnh/PDF/DOC

### Dữ liệu mẫu

Có 2 cơ chế seed:

1. **Tự động khi khởi động lần đầu** — `FirstRunSeeder.java` chạy mỗi lần start server, chỉ seed nếu bảng `users` đang rỗng (bỏ qua nếu DB đã có dữ liệu). Đây là cơ chế mặc định khi `docker compose up` lần đầu.
2. **Seed thủ công (reset)** — Maven profile `seed` — `DataSeeder.java` xóa toàn bộ rồi tạo lại:

```bash
cd server
mvn spring-boot:run -D "spring-boot.run.profiles=seed"
# hoặc với Docker:
docker compose run --rm -e SPRING_PROFILES_ACTIVE=seed server
```

Dữ liệu mẫu gồm:

- **1 admin** — `admin@hr.com` / `admin123`
- **6 quản lý** — mỗi phòng ban một người (Engineering, HR, Sales, Marketing, Finance, BA)
- **45 nhân viên** — phân bố đều các phòng ban với tên tiếng Việt
- **6 phòng ban** với quản lý được phân công
- **Ngày phép** được khởi tạo cho tất cả nhân viên
- **Lịch sử nhân viên** (tăng lương, thăng chức)
- **Chấm công thực tế** — 2 tháng hiện tại và trước, với hồ sơ punctuality (đúng giờ, hay đi muộn, nghỉ nhiều) theo từng nhân viên
- **Bảng lương thực tế** — tính BHXH (8%), BHTN (1%), BHTNLD (0.5%), phí Công đoàn (2.5%), thuế TNCN lũy tiến 7 bậc, thưởng Tết (tháng 1/12), thưởng quý, thưởng hiệu suất

Chạy bất kỳ lúc nào để đặt lại cơ sở dữ liệu về trạng thái ban đầu.

## Tính năng

### Xác thực & Phân quyền (JWT + RBAC)
- Đăng nhập dựa trên JWT token
- 3 vai trò: **admin**, **quản lý**, **nhân viên**
- Kiểm tra vai trò trên mọi API endpoint
- Route được bảo vệ phía client

### Tổng quan (Dashboard)
- **Admin**: tổng nhân viên, phòng ban, đơn chờ duyệt, chấm công hôm nay, lương tháng, thống kê phòng ban
- **Quản lý**: số nhân viên trong phòng, đơn chờ duyệt, lương phòng
- **Nhân viên**: đơn nghỉ phép, chấm công gần đây, bảng lương mới nhất

### Nhân viên
- CRUD đầy đủ (Admin)
- Tìm kiếm theo tên, chức vụ
- Lọc theo phòng ban
- Thông tin hợp đồng (loại, ngày hết hạn, tài liệu)
- Lịch sử nhân viên (thay đổi lương, thăng chức, chuyển phòng)
- **Phạm vi**: Admin xem tất cả, Quản lý xem phòng mình, Nhân viên chỉ xem bản thân

### Phòng ban
- CRUD đầy đủ (Admin)
- Gán quản lý cho phòng ban
- Quản lý chỉ xem được phòng ban của mình

### Nghỉ phép
- Nhân viên tạo đơn (ốm/năm/cá nhân)
- Admin/Quản lý duyệt hoặc từ chối
- **Xác thực**: ngày kết thúc >= ngày bắt đầu, tối đa 30 ngày, không trùng lịch
- **Theo dõi ngày phép**: tự động trừ khi duyệt, hiển thị số ngày còn lại

### Chấm công
- Nhân viên check-in/check-out hàng ngày
- **Quy tắc tự động**: check-in sau 9h sáng → đi muộn, làm < 4h → nửa ngày
- Quản lý xem báo cáo chấm công

### Bảng lương
- Admin xử lý hàng loạt theo tháng
- Tính lương thực nhận = lương cơ bản + thưởng - khấu trừ (BHSS, BHTN, BHTNLD, Công đoàn, thuế TNCN)
- Thưởng theo hiệu suất và dịp Tết (tháng 1, 12)
- Admin đánh dấu đã trả
- Nhân viên xem lịch sử lương

### Thông báo
- Thông báo trong ứng dụng khi đơn nghỉ phép được duyệt/từ chối
- Biểu tượng chuông với số chưa đọc (dựa trên polling, Socket.IO dự kiến)
- Trang thông báo riêng với danh sách đầy đủ

## API Endpoints

### Auth
| Method | Path               | Auth | Mô tả                          |
|--------|--------------------|------|--------------------------------|
| POST   | /api/auth/register | Không| Đăng ký (luôn tạo vai trò employee) |
| POST   | /api/auth/login    | Không| Đăng nhập                      |
| GET    | /api/auth/me       | Có   | Thông tin người dùng hiện tại  |
| PUT    | /api/auth/profile  | Có   | Cập nhật hồ sơ                 |
| POST   | /api/auth/change-password | Có | Đổi mật khẩu                |

### Employees
| Method | Path                         | Vai trò       | Mô tả                |
|--------|------------------------------|---------------|----------------------|
| GET    | /api/employees               | admin, manager| Danh sách            |
| GET    | /api/employees/export        | admin, manager| Xuất CSV             |
| GET    | /api/employees/:id           | tất cả        | Chi tiết             |
| POST   | /api/employees               | admin         | Tạo                  |
| PUT    | /api/employees/:id           | admin         | Cập nhật             |
| DELETE | /api/employees/:id           | admin         | Xóa                  |
| POST   | /api/employees/bulk-delete   | admin         | Xóa hàng loạt        |
| POST   | /api/employees/:id/documents | admin         | Tải tài liệu         |
| DELETE | /api/employees/:id/documents/:docId | admin  | Xóa tài liệu        |

### Departments
| Method | Path                       | Vai trò       | Mô tả                |
|--------|----------------------------|---------------|----------------------|
| GET    | /api/departments           | admin, manager| Danh sách            |
| GET    | /api/departments/org-chart | admin, manager| Sơ đồ tổ chức        |
| GET    | /api/departments/:id       | admin, manager| Chi tiết             |
| POST   | /api/departments           | admin         | Tạo                  |
| PUT    | /api/departments/:id       | admin         | Cập nhật             |
| DELETE | /api/departments/:id       | admin         | Xóa                  |

### Leaves
| Method | Path                    | Vai trò            | Mô tả                |
|--------|-------------------------|--------------------|----------------------|
| GET    | /api/leaves             | tất cả            | Danh sách            |
| POST   | /api/leaves             | employee           | Tạo đơn              |
| GET    | /api/leaves/:id         | tất cả            | Chi tiết             |
| PATCH  | /api/leaves/:id/status  | admin, manager     | Duyệt/từ chối        |

### Leave Balance
| Method | Path                         | Vai trò            | Mô tả                |
|--------|------------------------------|--------------------|----------------------|
| GET    | /api/leave-balance/my        | tất cả            | Ngày phép của tôi    |
| GET    | /api/leave-balance/:employeeId | admin, manager   | Ngày phép nhân viên  |

### Employee History
| Method | Path                             | Vai trò       | Mô tả                |
|--------|----------------------------------|---------------|----------------------|
| GET    | /api/employees/:id/history       | tất cả        | Lịch sử nhân viên    |
| POST   | /api/employees/:id/history       | admin, manager| Thêm sự kiện         |

### Notifications
| Method | Path                           | Vai trò | Mô tả                    |
|--------|--------------------------------|---------|--------------------------|
| GET    | /api/notifications             | tất cả | Danh sách thông báo      |
| GET    | /api/notifications/unread-count| tất cả | Số chưa đọc              |
| PATCH  | /api/notifications/:id/read    | tất cả | Đánh dấu đã đọc          |
| PATCH  | /api/notifications/read-all    | tất cả | Đánh dấu tất cả đã đọc   |

### Attendance
| Method | Path                         | Vai trò    | Mô tả                |
|--------|------------------------------|------------|----------------------|
| GET    | /api/attendance              | tất cả    | Danh sách            |
| POST   | /api/attendance/check-in     | employee   | Check-in             |
| PATCH  | /api/attendance/:id/check-out| employee   | Check-out            |

### Payroll
| Method | Path                  | Vai trò | Mô tả                |
|--------|-----------------------|---------|----------------------|
| GET    | /api/payroll          | tất cả | Danh sách            |
| POST   | /api/payroll/process  | admin   | Xử lý hàng loạt      |
| PATCH  | /api/payroll/:id/pay  | admin   | Đánh dấu đã trả      |

### Dashboard
| Method | Path            | Vai trò | Mô tả                |
|--------|-----------------|---------|----------------------|
| GET    | /api/dashboard  | tất cả | Thống kê theo vai trò |

### Tuyển dụng *(dự kiến)*
| Method | Path                         | Vai trò        | Mô tả                |
|--------|------------------------------|----------------|----------------------|
| GET    | /api/job-postings            | admin, manager | Danh sách tin        |
| GET    | /api/job-postings/:id        | admin, manager | Chi tiết tin         |
| POST   | /api/job-postings            | admin          | Tạo tin              |
| PUT    | /api/job-postings/:id        | admin          | Cập nhật tin         |
| DELETE | /api/job-postings/:id        | admin          | Xóa tin              |
| GET    | /api/candidates              | admin, manager | Danh sách ứng viên   |
| GET    | /api/candidates/:id          | admin, manager | Chi tiết ứng viên    |
| POST   | /api/candidates              | admin, manager | Tạo ứng viên         |
| PUT    | /api/candidates/:id          | admin, manager | Cập nhật ứng viên    |
| DELETE | /api/candidates/:id          | admin          | Xóa ứng viên         |

### Đánh giá hiệu suất *(dự kiến)*
| Method | Path                              | Vai trò        | Mô tả                    |
|--------|-----------------------------------|----------------|--------------------------|
| GET    | /api/performance-reviews          | tất cả        | Danh sách đánh giá       |
| GET    | /api/performance-reviews/:id      | tất cả        | Chi tiết đánh giá        |
| POST   | /api/performance-reviews          | admin, manager | Tạo đánh giá             |
| PUT    | /api/performance-reviews/:id      | admin, manager | Cập nhật đánh giá        |
| DELETE | /api/performance-reviews/:id      | admin          | Xóa đánh giá             |

## Client Routes

| Path                          | Vai trò            | Trang                        |
|-------------------------------|--------------------|------------------------------|
| /login                        | Công khai          | Đăng nhập                    |
| /dashboard                    | tất cả            | Tổng quan                    |
| /employees                    | admin, manager     | Danh sách nhân viên          |
| /employees/:id                | tất cả            | Chi tiết nhân viên           |
| /departments                  | admin, manager     | Phòng ban                    |
| /org-chart                    | admin, manager     | Sơ đồ tổ chức                |
| /leaves                       | tất cả            | Đơn của tôi                  |
| /leaves/approvals             | admin, manager     | Phê duyệt đơn                |
| /attendance                   | tất cả            | Chấm công                    |
| /attendance/report            | admin, manager     | Báo cáo chấm công            |
| /payroll                      | tất cả            | Bảng lương                   |
| /payroll/manage               | admin              | Quản lý lương                |
| /notifications                | tất cả            | Thông báo                    |
| /profile                      | tất cả            | Hồ sơ                        |
| /recruitment/job-postings     | admin, manager     | Tin tuyển dụng *(dự kiến)*   |
| /recruitment/candidates       | admin, manager     | Ứng viên *(dự kiến)*         |
| /performance-reviews          | tất cả            | Đánh giá của tôi *(dự kiến)* |
| /performance-reviews/manage   | admin, manager     | Quản lý đánh giá *(dự kiến)* |

## Kiểm thử

| Package | Framework                         | Số lượng | Chạy              |
|---------|-----------------------------------|----------|-------------------|
| Server  | JUnit 5 + Mockito + `@ActiveProfiles("test")` | 85 tests (16 class) | `mvn test`       |
| Client  | Vitest + Testing Library + MSW    | 61 tests (17 files) | `npm test`        |

CI/CD tự động qua GitHub Actions (`.github/workflows/test.yml`) — chạy server tests (MySQL 8 container), client tests, và client build khi push.

## Công nghệ sử dụng

| Lớp            | Công nghệ                                |
|----------------|-------------------------------------------|
| Frontend       | React 19, Vite, TypeScript                |
| UI             | HeroUI v3, Tailwind CSS |
| Backend        | Spring Boot 4.1 (Java 25)                 |
| Database       | MySQL 8+, JPA/Hibernate                   |
| Auth           | JWT (jjwt 0.12.6), bcrypt, Spring Security|
| Client State   | TanStack React Query                      |
| Icons          | @phosphor-icons/react                     |
| Dates          | date-fns                                  |
