# Hệ thống Quản lý Nhân sự

Hệ thống quản lý nhân sự với phân quyền RBAC, xây dựng bằng Spring Boot, MySQL 8, React và HeroUI.

## Yêu cầu

- Java 25+
- MySQL 8+ chạy tại `localhost:3306`
- Maven (đi kèm `mvnw`)

## Bắt đầu nhanh

### Cách 1: Docker

```powershell
Copy-Item .env.example .env
# Sửa .env, đặt JWT_SECRET bằng giá trị mạnh
docker compose up -d --build
```

- UI: http://localhost:5173
- API: http://localhost:3001
- Sửa code xong chạy lại `docker compose up -d --build`
- Dữ liệu MySQL được giữ qua volume, seed tự bỏ qua nếu DB đã có dữ liệu

### Cách 2: Phát triển thủ công

```bash
cd server
mvn spring-boot:run -D "spring-boot.run.profiles=seed"   # tạo dữ liệu mẫu
mvn spring-boot:run                                      # API tại 3001

cd client
npm install
npm run dev                                              # UI tại 5173
```

### Lệnh Docker thường dùng

| Mục đích | Lệnh |
|----------|------|
| Khởi động hoặc cập nhật | `docker compose up -d --build` |
| Xem log | `docker compose logs -f` |
| Dừng, giữ dữ liệu | `docker compose down` |
| Xóa cả database | `docker compose down -v` |
| Seed lại dữ liệu mẫu | `docker compose run --rm -e SPRING_PROFILES_ACTIVE=seed server` |

## Biến môi trường

Cấu hình tập trung trong file `.env` ở thư mục gốc. Copy mẫu `/.env.example` thành `/.env` rồi điền giá trị.

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| `MYSQL_DATABASE` | `hr_management` | Tên database MySQL |
| `MYSQL_ROOT_PASSWORD` | `root` | Mật khẩu root MySQL |
| `DB_URL` | `jdbc:mysql://localhost:3306/hr_management?...` | Chuỗi kết nối MySQL |
| `DB_USERNAME` | `root` | Tên đăng nhập DB |
| `DB_PASSWORD` | `root` | Mật khẩu DB |
| `SERVER_PORT` | `3001` | Cổng API |
| `JWT_SECRET` | bắt buộc | Khóa bí mật JWT, tối thiểu 32 ký tự |
| `JWT_EXPIRATION` | `86400000` | Thời hạn token (ms) |
| `CORS_ORIGIN` | `http://localhost:5173` | Nguồn CORS được phép |
| `VITE_API_URL` | `http://localhost:3001/api` | URL gốc API (nạp khi build client) |

Server sẽ không khởi động nếu thiếu `JWT_SECRET`.

## Tài khoản dùng thử

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | admin@hr.com | admin123 |
| Quản lý | eng.manager@hr.com | manager123 |
| Nhân viên | emp01@hr.com | employee123 |

## Tính năng

- **Xác thực và phân quyền**: JWT, 3 vai trò admin, quản lý, nhân viên. Kiểm tra vai trò ở service layer và route phía client
- **Dashboard**: thống kê theo vai trò. Admin xem toàn hệ thống, quản lý xem phòng ban mình, nhân viên xem dữ liệu bản thân
- **Nhân viên**: CRUD, tìm kiếm, lọc theo phòng ban, quản lý hợp đồng và tài liệu, lịch sử lương và thăng chức
- **Phòng ban**: CRUD, gán quản lý, sơ đồ tổ chức
- **Nghỉ phép**: tạo đơn, duyệt hoặc từ chối, kiểm tra trùng lịch, tự trừ ngày phép khi duyệt
- **Chấm công**: chấm công vào và ra hàng ngày, tự tính trạng thái. Vào sau 9h là đi muộn, làm dưới 4h là nửa ngày
- **Bảng lương**: xử lý hàng loạt theo tháng, tính khấu trừ BHXH, BHTN, BHTNLD, Công đoàn, thuế TNCN lũy tiến, thưởng Tết và thưởng hiệu suất
- **Thông báo**: gửi trong ứng dụng khi đơn nghỉ phép được duyệt hoặc từ chối

## API Endpoints

### Auth
| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| POST | /api/auth/register | Không | Đăng ký, luôn tạo vai trò employee |
| POST | /api/auth/login | Không | Đăng nhập |
| GET | /api/auth/me | Có | Thông tin người dùng hiện tại |
| PUT | /api/auth/profile | Có | Cập nhật hồ sơ |
| POST | /api/auth/change-password | Có | Đổi mật khẩu |

### Employees
| Method | Path | Vai trò | Mô tả |
|--------|------|---------|-------|
| GET | /api/employees | admin, manager | Danh sách |
| GET | /api/employees/export | admin, manager | Xuất CSV |
| GET | /api/employees/:id | tất cả | Chi tiết |
| POST | /api/employees | admin | Tạo |
| PUT | /api/employees/:id | admin | Cập nhật |
| DELETE | /api/employees/:id | admin | Xóa |
| POST | /api/employees/bulk-delete | admin | Xóa hàng loạt |
| POST | /api/employees/:id/documents | admin | Tải tài liệu |
| DELETE | /api/employees/:id/documents/:docId | admin | Xóa tài liệu |

### Departments
| Method | Path | Vai trò | Mô tả |
|--------|------|---------|-------|
| GET | /api/departments | admin, manager | Danh sách |
| GET | /api/departments/org-chart | admin, manager | Sơ đồ tổ chức |
| GET | /api/departments/:id | admin, manager | Chi tiết |
| POST | /api/departments | admin | Tạo |
| PUT | /api/departments/:id | admin | Cập nhật |
| DELETE | /api/departments/:id | admin | Xóa |

### Leaves
| Method | Path | Vai trò | Mô tả |
|--------|------|---------|-------|
| GET | /api/leaves | tất cả | Danh sách |
| POST | /api/leaves | employee | Tạo đơn |
| GET | /api/leaves/:id | tất cả | Chi tiết |
| PATCH | /api/leaves/:id/status | admin, manager | Duyệt hoặc từ chối |

### Leave Balance
| Method | Path | Vai trò | Mô tả |
|--------|------|---------|-------|
| GET | /api/leave-balance/my | tất cả | Ngày phép của tôi |
| GET | /api/leave-balance/:employeeId | admin, manager | Ngày phép nhân viên |

### Employee History
| Method | Path | Vai trò | Mô tả |
|--------|------|---------|-------|
| GET | /api/employees/:id/history | tất cả | Lịch sử nhân viên |
| POST | /api/employees/:id/history | admin, manager | Thêm sự kiện |

### Notifications
| Method | Path | Vai trò | Mô tả |
|--------|------|---------|-------|
| GET | /api/notifications | tất cả | Danh sách thông báo |
| GET | /api/notifications/unread-count | tất cả | Số chưa đọc |
| PATCH | /api/notifications/:id/read | tất cả | Đánh dấu đã đọc |
| PATCH | /api/notifications/read-all | tất cả | Đánh dấu tất cả đã đọc |

### Attendance
| Method | Path | Vai trò | Mô tả |
|--------|------|---------|-------|
| GET | /api/attendance | tất cả | Danh sách |
| POST | /api/attendance/check-in | employee | Chấm công vào |
| PATCH | /api/attendance/:id/check-out | employee | Chấm công ra |

### Payroll
| Method | Path | Vai trò | Mô tả |
|--------|------|---------|-------|
| GET | /api/payroll | tất cả | Danh sách |
| POST | /api/payroll/process | admin | Xử lý hàng loạt |
| PATCH | /api/payroll/:id/pay | admin | Đánh dấu đã trả |

### Dashboard
| Method | Path | Vai trò | Mô tả |
|--------|------|---------|-------|
| GET | /api/dashboard | tất cả | Thống kê theo vai trò |

## Kiểm thử

| Package | Framework | Số lượng | Chạy |
|---------|-----------|----------|------|
| Server | JUnit 5 + Mockito | 85 tests, 16 class | `mvn test` |
| Client | Vitest + Testing Library + MSW | 61 tests, 17 files | `npm test` |

CI tự động qua GitHub Actions, chạy server tests, client tests và client build khi push.

## Công nghệ sử dụng

| Lớp | Công nghệ |
|-----|-----------|
| Frontend | React 19, Vite, TypeScript |
| UI | HeroUI v3, Tailwind CSS |
| Backend | Spring Boot 4.1, Java 25 |
| Database | MySQL 8+, JPA/Hibernate |
| Auth | JWT (jjwt 0.12.6), bcrypt, Spring Security |
| Client State | TanStack React Query |
| Icons | @phosphor-icons/react |
| Dates | date-fns |
