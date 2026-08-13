# User Stories

## Hệ thống Quản lý Nhân sự (HR Management)

| Phiên bản | Ngày       | Người soạn | Mô tả                        |
|-----------|------------|------------|------------------------------|
| 1.0       | 17/06/2026 | PO Team    | Phiên bản đầu tiên           |
| 2.0       | 22/06/2026 | PO Team    | Cập nhật cấu trúc chuẩn       |
| 2.1       | 22/06/2026 | Dev Team   | Ghi chú trạng thái triển khai |

> **Tuân theo:** Template User Story chuẩn (Role-Feature-Reason) với Acceptance Criteria, ước lượng Story Point (Fibonacci) và phân loại MoSCoW.
> **Trạng thái triển khai:** Đã triển khai: US-001–US-004 (Auth/Profile), US-010, US-011, US-013 (Employees), US-020, US-021 (Departments/Org-chart), US-030–US-033 (Leaves/Leave Balance), US-040, US-041 (Attendance), US-050–US-052 (Payroll), US-091 (Notifications). Chưa triển khai: US-012 (phần tài liệu & lịch sử nhân viên), US-014 (Documents), US-060, US-061, US-062 (Dashboard), US-070, US-071 (Recruitment), US-080, US-081 (Performance Reviews), US-090 (Socket.IO real-time).

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
   1.1 [Cấu trúc User Story](#11-cấu-trúc-user-story)
   1.2 [Quy ước](#12-quy-ước)
   1.3 [Tài liệu tham khảo](#13-tài-liệu-tham-khảo)
2. [Epic 1: Xác thực & Tài khoản](#2-epic-1-xác-thực--tài-khoản)
3. [Epic 2: Quản lý Nhân viên](#3-epic-2-quản-lý-nhân-viên)
4. [Epic 3: Quản lý Phòng ban](#4-epic-3-quản-lý-phòng-ban)
5. [Epic 4: Quản lý Nghỉ phép](#5-epic-4-quản-lý-nghỉ-phép)
6. [Epic 5: Quản lý Chấm công](#6-epic-5-quản-lý-chấm-công)
7. [Epic 6: Quản lý Bảng lương](#7-epic-6-quản-lý-bảng-lương)
8. [Epic 7: Dashboard & Thống kê](#8-epic-7-dashboard--thống-kê)
9. [Epic 8: Tuyển dụng](#9-epic-8-tuyển-dụng)
10. [Epic 9: Đánh giá Hiệu suất](#10-epic-9-đánh-giá-hiệu-suất)
11. [Epic 10: Thông báo](#11-epic-10-thông-báo)
12. [Epic 11: Giao diện & Trải nghiệm](#12-epic-11-giao-diện--trải-nghiệm)
13. [Phụ lục: Ma trận Ưu tiên](#13-phụ-lục-ma-trận-ưu-tiên)

---

## 1. Giới thiệu

### 1.1 Cấu trúc User Story

Mỗi user story tuân theo template chuẩn:

```
**US-NNN**: Với tư cách là <vai trò>, tôi muốn <mục tiêu> để <lợi ích>.

**Tiêu chí chấp nhận (Acceptance Criteria)**:
- [ ] AC1: ...
- [ ] AC2: ...

**Ước lượng**: X SP
```

### 1.2 Quy ước

| Ký hiệu | Ý nghĩa       |
|:-------:|---------------|
| US      | User Story    |
| SP      | Story Point (Fibonacci: 1, 2, 3, 5, 8, 13) |
| MoSCoW  | M - Must (bắt buộc), S - Should (nên có), C - Could (có thể), W - Won't (không làm) |

### 1.3 Tài liệu tham khảo

| Tài liệu      | Mô tả                                        |
|---------------|----------------------------------------------|
| BRD.md        | Tài liệu Yêu cầu Nghiệp vụ                   |
| SRS.md        | Đặc tả Yêu cầu Phần mềm                      |
| UC.md         | Đặc tả Use Case                             |
| PP.md         | Kế hoạch Dự án                              |

---

## 2. Epic 1: Xác thực & Tài khoản

**Mô tả**: Cho phép người dùng đăng nhập, đăng ký, quản lý tài khoản cá nhân.

---

### US-001: Đăng nhập

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Guest, Employee, Manager, Admin               |
| **Mục tiêu**| Đăng nhập bằng email và mật khẩu              |
| **Lợi ích**| Truy cập vào hệ thống                         |
| **MoSCoW** | Must                                          |
| **SP**     | 3                                             |

**Acceptance Criteria**:
- [ ] Form đăng nhập với email + password
- [ ] Hiển thị/hide mật khẩu
- [ ] Validate: email không rỗng, password không rỗng
- [ ] Gọi API POST /api/auth/login
- [ ] Nếu thành công: tạo phiên đăng nhập (Spring Session JDBC, cookie JSESSIONID), chuyển đến /leaves (không có trang dashboard; `/` redirect về /leaves)
- [ ] Khi có cookie JSESSIONID, client khôi phục phiên qua GET /api/auth/me
- [ ] Nếu thất bại: hiển thị lỗi "Email hoặc mật khẩu không đúng"
- [ ] Nút demo accounts (admin/manager/employee)

---

### US-002: Đăng ký

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Guest                                         |
| **Mục tiêu**| Đăng ký tài khoản mới                        |
| **Lợi ích**| Tạo tài khoản để sử dụng hệ thống             |
| **MoSCoW** | Could                                         |
| **SP**     | 3                                             |

**Acceptance Criteria**:
- [ ] Form đăng ký với email + password + confirm password
- [ ] Validate: email đúng định dạng
- [ ] Validate: password từ 8 đến 128 ký tự, không yêu cầu độ phức tạp (chữ hoa/thường/số)
- [ ] Gọi API POST /api/auth/register
- [ ] Tự động đăng nhập sau khi đăng ký thành công

---

### US-003: Xem và cập nhật profile

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Employee, Manager, Admin                      |
| **Mục tiêu**| Xem và cập nhật thông tin cá nhân            |
| **Lợi ích**| Cập nhật tên, email, đổi mật khẩu             |
| **MoSCoW** | Must                                          |
| **SP**     | 5                                             |

**Acceptance Criteria**:
- [ ] Trang Profile hiển thị: avatar (chữ cái đầu), name, email, role
- [ ] Nút "Edit Profile" mở dialog với form name + email
- [ ] Nút "Change Password" mở dialog với current + new + confirm
- [ ] Validate đổi mật khẩu: mật khẩu mới từ 8 đến 128 ký tự, không yêu cầu độ phức tạp
- [ ] Gọi API PUT /api/auth/profile và POST /api/auth/change-password

---

### US-004: Đăng xuất

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Employee, Manager, Admin                      |
| **Mục tiêu**| Đăng xuất khỏi hệ thống                      |
| **Lợi ích**| Bảo mật tài khoản                             |
| **MoSCoW** | Must                                          |
| **SP**     | 1                                             |

**Acceptance Criteria**:
- [ ] Nút logout ở sidebar
- [ ] Dialog xác nhận trước khi logout
- [ ] Xóa cookie phiên (JSESSIONID) phía client — không có endpoint logout phía server
- [ ] Chuyển hướng đến trang login

---

## 3. Epic 2: Quản lý Nhân viên

**Mô tả**: Admin/Manager quản lý hồ sơ nhân viên toàn diện.

---

### US-010: Xem danh sách nhân viên

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Admin, Manager                                |
| **Mục tiêu**| Xem danh sách nhân viên với tìm kiếm, lọc, phân trang |
| **Lợi ích**| Dễ dàng tra cứu thông tin nhân viên           |
| **MoSCoW** | Must                                          |
| **SP**     | 8                                             |

**Acceptance Criteria**:
- [ ] Bảng hiển thị: checkbox, name (linkable), position, department, salary, actions
- [ ] Search: tìm theo firstName, lastName, position
- [ ] Filter: theo departmentId
- [ ] Pagination: 10/20/30/50 items, first/prev/next/last
- [ ] Skeleton loading
- [ ] Empty state khi không có dữ liệu
- [ ] Manager chỉ thấy nhân viên trong phòng mình
- [ ] Click tên nhân viên -> Employee Detail

---

### US-011: Thêm nhân viên mới

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Admin                                         |
| **Mục tiêu**| Thêm nhân viên mới vào hệ thống              |
| **Lợi ích**| Mở rộng dữ liệu nhân sự                       |
| **MoSCoW** | Must                                          |
| **SP**     | 5                                             |

**Acceptance Criteria**:
- [ ] Dialog với form: firstName, lastName, position, salary, departmentId, hireDate, phone, contractType, contractExpiry, userId
- [ ] Validate: firstName, lastName, position (required), salary (>= 0)
- [ ] Gọi API POST /api/employees
- [ ] Refresh danh sách sau khi thêm

---

### US-012: Xem chi tiết nhân viên

> **Trạng thái: đã triển khai một phần** — trang chi tiết nhân viên đã có; phần tài liệu và lịch sử nhân viên chưa triển khai.

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Admin, Manager, Employee                      |
| **Mục tiêu**| Xem đầy đủ thông tin nhân viên               |
| **Lợi ích**| Tra cứu chi tiết hồ sơ                        |
| **MoSCoW** | Must                                          |
| **SP**     | 8                                             |

**Acceptance Criteria**:
- [ ] Header: ảnh đại diện (chữ cái), tên, vị trí
- [ ] Card Personal: department, salary, hireDate, phone, email (từ User)
- [ ] Card Contract: contractType, expiry (mục documents: chưa triển khai)
- [ ] Card History: timeline các sự kiện raise/promotion/transfer (chưa triển khai — không có module employee history)
- [ ] Nút Edit Employee (Admin)
- [ ] Nút Upload Document (Admin) (chưa triển khai — không có module documents/upload)
- [ ] Nút Delete Document (Admin) (chưa triển khai)
- [ ] Nút Add History (Admin/Manager) (chưa triển khai)
- [ ] Employee chỉ xem được thông tin của mình

---

### US-013: Sửa và Xóa nhân viên

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Admin                                         |
| **Mục tiêu**| Cập nhật hoặc xóa thông tin nhân viên        |
| **Lợi ích**| Duy trì dữ liệu chính xác                     |
| **MoSCoW** | Must                                          |
| **SP**     | 5                                             |

**Acceptance Criteria**:
- [ ] Edit: form giống create (trừ userId)
- [ ] Delete: dialog xác nhận trước khi xóa
- [ ] Bulk delete: chọn nhiều nhân viên, xác nhận, xóa (max 100)
- [ ] Export CSV: tải file danh sách nhân viên

---

### US-014: Quản lý tài liệu nhân viên

> **Trạng thái: chưa triển khai** — không có module documents/upload.

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Admin                                         |
| **Mục tiêu**| Upload và xóa tài liệu cho nhân viên          |
| **Lợi ích**| Lưu trữ hợp đồng, CV, bằng cấp               |
| **MoSCoW** | Should                                        |
| **SP**     | 5                                             |

**Acceptance Criteria**:
- [ ] Upload: chọn file, gửi multipart/form-data
- [ ] Validate: file <= 5MB, định dạng JPEG/PNG/GIF/PDF/DOC/DOCX
- [ ] Danh sách tài liệu hiển thị: name, type, upload date
- [ ] Delete: xác nhận trước khi xóa

---

## 4. Epic 3: Quản lý Phòng ban

**Mô tả**: Quản lý cấu trúc phòng ban và sơ đồ tổ chức.

---

### US-020: Quản lý phòng ban

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Admin                                         |
| **Mục tiêu**| Thêm, sửa, xóa phòng ban                     |
| **Lợi ích**| Cập nhật cấu trúc tổ chức                     |
| **MoSCoW** | Must                                          |
| **SP**     | 5                                             |

**Acceptance Criteria**:
- [ ] Bảng: name, description, manager
- [ ] Create dialog: name, description, managerId (select từ users)
- [ ] Edit dialog: tương tự create
- [ ] Delete: xác nhận

---

### US-021: Xem sơ đồ tổ chức

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Admin, Manager                                |
| **Mục tiêu**| Xem sơ đồ tổ chức dạng card grid             |
| **Lợi ích**| Có cái nhìn tổng quan về công ty              |
| **MoSCoW** | Should                                        |
| **SP**     | 3                                             |

**Acceptance Criteria**:
- [ ] Không có endpoint org-chart — sơ đồ tổ chức render client-side từ API GET /api/departments
- [ ] Hiển thị card cho mỗi phòng ban
- [ ] Card: tên phòng, mô tả, trưởng phòng, danh sách nhân viên
- [ ] Layout 2 cột grid

---

## 5. Epic 4: Quản lý Nghỉ phép

**Mô tả**: Quy trình xin nghỉ, duyệt đơn, quản lý quỹ phép.

---

### US-030: Tạo đơn nghỉ phép

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Employee                                      |
| **Mục tiêu**| Tạo đơn xin nghỉ phép                        |
| **Lợi ích**| Xin nghỉ có quy trình, minh bạch               |
| **MoSCoW** | Must                                          |
| **SP**     | 8                                             |

**Acceptance Criteria**:
- [ ] Form: type (annual/sick/personal), startDate, endDate, reason
- [ ] Validate: endDate >= startDate
- [ ] Validate: duration <= 30 days
- [ ] Gọi API POST /api/leaves
- [ ] Tạo thành công với status "pending"
- [ ] Hiển thị trong danh sách đơn của tôi

---

### US-031: Xem danh sách và quỹ phép

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Employee                                      |
| **Mục tiêu**| Xem danh sách đơn và quỹ phép còn lại        |
| **Lợi ích**| Theo dõi tình trạng đơn và số ngày phép       |
| **MoSCoW** | Must                                          |
| **SP**     | 5                                             |

**Acceptance Criteria**:
- [ ] 3 thẻ quỹ phép: annual, sick, personal với progress bar
- [ ] Bảng danh sách đơn: type, startDate, endDate, status, reason
- [ ] Status badge: pending (andau), approved (xanh), rejected (đỏ)

---

### US-032: Duyệt/Từ chối đơn nghỉ phép

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Admin, Manager                                |
| **Mục tiêu**| Duyệt hoặc từ chối đơn nghỉ phép              |
| **Lợi ích**| Quản lý nhân sự trong phòng                   |
| **MoSCoW** | Must                                          |
| **SP**     | 8                                             |

**Acceptance Criteria**:
- [ ] Bảng các đơn pending: employee name, type, dates, reason
- [ ] Nút Approve: xác nhận, duyệt đơn
- [ ] Nút Reject: nhập lý do, xác nhận, từ chối
- [ ] Khi duyệt: tự động trừ quỹ phép
- [ ] Nếu không đủ quỹ phép: báo lỗi
- [ ] Gửi thông báo trong ứng dụng cho employee (API polling, không dùng Socket.IO)

---

### US-033: Xem quỹ phép nhân viên

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Admin, Manager                                |
| **Mục tiêu**| Xem quỹ phép của nhân viên                   |
| **Lợi ích**| Kiểm tra trước khi duyệt đơn                 |
| **MoSCoW** | Must                                          |
| **SP**     | 3                                             |

**Acceptance Criteria**:
- [ ] Gọi API GET /api/leave-balance/:employeeId
- [ ] Hiển thị annual, sick, personal: used/total

---

## 6. Epic 5: Quản lý Chấm công

**Mô tả**: Check-in/check-out hàng ngày và báo cáo.

---

### US-040: Check-in/Check-out

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Employee                                      |
| **Mục tiêu**| Check-in và check-out hàng ngày              |
| **Lợi ích**| Ghi nhận thời gian làm việc                   |
| **MoSCoW** | Must                                          |
| **SP**     | 8                                             |

**Acceptance Criteria**:
- [ ] Nút "Check In" (chỉ hiện nếu chưa check-in hôm nay)
- [ ] Nút "Check Out" (chỉ hiện nếu đã check-in, chưa check-out)
- [ ] Check-in trước 9AM -> "present", sau 9AM -> "late"
- [ ] Check-out: < 4h làm -> "half-day"
- [ ] Nếu đã check-in: thông báo "Bạn đã check-in hôm nay"
- [ ] Bảng lịch sử: date, checkIn, checkOut, status

---

### US-041: Xem báo cáo chấm công

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Admin, Manager                                |
| **Mục tiêu**| Xem báo cáo chấm công tổng hợp               |
| **Lợi ích**| Theo dõi tình hình đi làm của nhân viên       |
| **MoSCoW** | Should                                        |
| **SP**     | 5                                             |

**Acceptance Criteria**:
- [ ] 4 stat cards: present count, late count, absent count, half-day count
- [ ] Color-coded bar chart
- [ ] Bảng chi tiết: employee, date, checkIn, checkOut, status
- [ ] Manager: chỉ thấy phòng mình

---

## 7. Epic 6: Quản lý Bảng lương

**Mô tả**: Xử lý lương hàng tháng.

---

### US-050: Xử lý bảng lương

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Admin                                         |
| **Mục tiêu**| Xử lý lương hàng tháng cho nhân viên         |
| **Lợi ích**| Tự động hóa tính lương                        |
| **MoSCoW** | Must                                          |
| **SP**     | 8                                             |

**Acceptance Criteria**:
- [ ] Dialog: chọn month, year, employeeIds
- [ ] Gọi API POST /api/payroll/process
- [ ] Tự động tính netPay = basicSalary − deductions (bonus luôn bằng 0). Các khoản khấu trừ: BHXH 8%, BHYT 1.5%, BHTN 1%, Công đoàn 1%, PIT lũy tiến 5 bậc (5/10/20/30/35%, giảm trừ cá nhân 15.500.000 VND)
- [ ] Bỏ qua nếu đã tồn tại (employeeId + month + year)
- [ ] Payroll tạo với status "draft"
- [ ] Danh sách payroll: period, salary, bonus, deductions, netPay, status

---

### US-051: Đánh dấu đã trả lương

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Admin                                         |
| **Mục tiêu**| Đánh dấu bảng lương đã được thanh toán       |
| **Lợi ích**| Theo dõi tình trạng thanh toán                |
| **MoSCoW** | Must                                          |
| **SP**     | 3                                             |

**Acceptance Criteria**:
- [ ] Nút "Mark Paid" trên mỗi bản ghi draft
- [ ] Xác nhận trước khi đánh dấu
- [ ] Cập nhật status = "paid", paidAt = now

---

### US-052: Xem bảng lương

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Employee, Manager, Admin                      |
| **Mục tiêu**| Xem thông tin lương                           |
| **Lợi ích**| Minh bạch về lương                            |
| **MoSCoW** | Must                                          |
| **SP**     | 5                                             |

**Acceptance Criteria**:
- [ ] Employee: chỉ thấy lương của mình
- [ ] Manager: thấy lương nhân viên trong phòng
- [ ] Admin: thấy tất cả
- [ ] Filter: month, year, status

---

## 8. Epic 7: Dashboard & Thống kê

**Mô tả**: Dashboard tổng quan theo từng vai trò.

---

### US-060: Dashboard Admin

> **Trạng thái: chưa triển khai** — không có module/endpoint/UI Dashboard.

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Admin                                         |
| **Mục tiêu**| Xem tổng quan toàn hệ thống                   |
| **Lợi ích**| Nắm bắt tình hình nhân sự                     |
| **MoSCoW** | Must                                          |
| **SP**     | 8                                             |

**Acceptance Criteria**:
- [ ] Stat cards: total employees, pending leaves, present today, monthly payroll
- [ ] Bar chart: employees per department
- [ ] Recent leaves list (5 gần nhất)

---

### US-061: Dashboard Manager

> **Trạng thái: chưa triển khai** — không có module/endpoint/UI Dashboard.

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Manager                                       |
| **Mục tiêu**| Xem tổng quan phòng ban                      |
| **Lợi ích**| Quản lý đội nhóm hiệu quả                    |
| **MoSCoW** | Must                                          |
| **SP**     | 5                                             |

**Acceptance Criteria**:
- [ ] Department name + description
- [ ] Stat cards: team size, pending leaves, present today, department payroll

---

### US-062: Dashboard Employee

> **Trạng thái: chưa triển khai** — không có module/endpoint/UI Dashboard.

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Employee                                      |
| **Mục tiêu**| Xem thông tin cá nhân tổng quan               |
| **Lợi ích**| Theo dõi tình trạng cá nhân                   |
| **MoSCoW** | Must                                          |
| **SP**     | 8                                             |

**Acceptance Criteria**:
- [ ] Stat cards: pending/approved/rejected leaves, present/late/absent count
- [ ] Pie chart: leave type distribution
- [ ] Bar chart: attendance by date
- [ ] Upcoming approved leaves list (next 3)

---

## 9. Epic 8: Tuyển dụng

**Mô tả**: Quản lý tin tuyển dụng và ứng viên.

---

### US-070: Quản lý tin tuyển dụng

> **Trạng thái: chưa triển khai** — không có module Recruitment.

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Admin                                         |
| **Mục tiêu**| Đăng, sửa, đóng tin tuyển dụng               |
| **Lợi ích**| Thu hút ứng viên                              |
| **MoSCoW** | Should                                        |
| **SP**     | 5                                             |

**Acceptance Criteria**:
- [ ] Bảng: title, department, status badge, openings
- [ ] Create dialog: title, department, description, requirements, status, openings
- [ ] Search + filter by status
- [ ] Nút View Candidates -> trang Candidates với filter

---

### US-071: Quản lý ứng viên

> **Trạng thái: chưa triển khai** — không có module Recruitment.

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Admin, Manager                                |
| **Mục tiêu**| Thêm, cập nhật trạng thái ứng viên            |
| **Lợi ích**| Theo dõi quá trình tuyển dụng                 |
| **MoSCoW** | Should                                        |
| **SP**     | 5                                             |

**Acceptance Criteria**:
- [ ] Bảng: name, email, job posting, status badge, applied date
- [ ] Create dialog: firstName, lastName, email, phone, jobPostingId, notes
- [ ] Search + filter by status
- [ ] Cập nhật status: applied -> screening -> interview -> offered -> hired/rejected

---

## 10. Epic 9: Đánh giá Hiệu suất

**Mô tả**: Đánh giá hiệu suất nhân viên định kỳ.

---

### US-080: Quản lý đánh giá hiệu suất

> **Trạng thái: chưa triển khai** — không có module Performance Reviews.

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Admin, Manager                                |
| **Mục tiêu**| Tạo và quản lý đánh giá hiệu suất            |
| **Lợi ích**| Theo dõi hiệu quả làm việc                    |
| **MoSCoW** | Should                                        |
| **SP**     | 5                                             |

**Acceptance Criteria**:
- [ ] Stat cards: total reviews, avg rating, submitted count
- [ ] Bảng: employee, period, rating (1-5), status
- [ ] Create/Edit dialog: employee, period, rating, comments, goals
- [ ] Status: draft -> submitted -> acknowledged

---

### US-081: Xem đánh giá của tôi

> **Trạng thái: chưa triển khai** — không có module Performance Reviews.

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Employee                                      |
| **Mục tiêu**| Xem đánh giá hiệu suất của bản thân          |
| **Lợi ích**| Biết được hiệu quả làm việc                   |
| **MoSCoW** | Could                                         |
| **SP**     | 3                                             |

**Acceptance Criteria**:
- [ ] Card list: period, reviewer, rating, comments, goals, status badge
- [ ] Empty state nếu chưa có đánh giá

---

## 11. Epic 10: Thông báo

**Mô tả**: Thông báo trong ứng dụng, giao qua API polling (không dùng Socket.IO).

---

### US-090: Nhận thông báo thời gian thực

> **Trạng thái: chưa triển khai** — không dùng Socket.IO/WebSocket; thông báo hiện tại chạy bằng API polling.

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Employee, Manager, Admin                      |
| **Mục tiêu**| Nhận thông báo ngay khi có sự kiện            |
| **Lợi ích**| Không bỏ lỡ thông tin quan trọng              |
| **MoSCoW** | Should                                        |
| **SP**     | 5                                             |

**Acceptance Criteria**:
- [ ] Kết nối Socket.IO sau khi đăng nhập
- [ ] Nhận event "notification" -> show toast
- [ ] Badge unread count trên sidebar
- [ ] Toast variant: default (info), destructive (error)

---

### US-091: Xem và quản lý thông báo

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Employee, Manager, Admin                      |
| **Mục tiêu**| Xem danh sách thông báo, đánh dấu đã đọc     |
| **Lợi ích**| Quản lý thông báo hiệu quả                   |
| **MoSCoW** | Must                                          |
| **SP**     | 5                                             |

**Acceptance Criteria**:
- [ ] Trang Notifications: danh sách 20 thông báo gần nhất
- [ ] Click -> mark as read
- [ ] Nút "Mark All Read"
- [ ] Badge unread count cập nhật qua API polling (unread-count mỗi 30s, danh sách mỗi 15s)

---

## 12. Epic 11: Giao diện & Trải nghiệm

**Mô tả**: Cải thiện giao diện và trải nghiệm người dùng.

---

### US-100: Đa ngôn ngữ (EN/VI)

> **Trạng thái: chưa triển khai** - giao diện hiện tại chỉ có tiếng Việt (một locale `vi.ts`), chưa có bộ ngôn ngữ EN và không có bộ chuyển đổi ngôn ngữ.

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Employee, Manager, Admin                      |
| **Mục tiêu**| Chuyển đổi ngôn ngữ giữa Anh và Việt          |
| **Lợi ích**| Phù hợp với người dùng Việt Nam               |
| **MoSCoW** | Should                                        |
| **SP**     | 8                                             |

**Acceptance Criteria**:
- [ ] Settings dialog: chọn ngôn ngữ
- [ ] Tất cả text chuyển sang ngôn ngữ đã chọn
- [ ] Lưu lựa chọn vào localStorage

---

### US-101: Dark Mode

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Employee, Manager, Admin                      |
| **Mục tiêu**| Chuyển đổi giao diện sáng/tối                |
| **Lợi ích**| Giảm mỏi mắt khi làm việc tối                |
| **MoSCoW** | Could                                         |
| **SP**     | 3                                             |

**Acceptance Criteria**:
- [ ] Settings dialog: chọn theme light/dark
- [ ] Chuyển đổi mượt mà
- [ ] Lưu lựa chọn vào localStorage

---

### US-102: Phím tắt

| Trường     | Giá trị                                       |
|------------|-----------------------------------------------|
| **Vai trò**| Employee, Manager, Admin                      |
| **Mục tiêu**| Điều hướng nhanh bằng phím tắt               |
| **Lợi ích**| Tăng năng suất làm việc                       |
| **MoSCoW** | Could                                         |
| **SP**     | 5                                             |

**Acceptance Criteria**:
- [ ] `?` : mở dialog hướng dẫn phím tắt
- [ ] `G + D` : Dashboard (chưa triển khai - không có trang Dashboard)
- [ ] `G + E` : Employees
- [ ] `G + L` : Leaves
- [ ] `G + A` : Attendance
- [ ] `G + P` : Payroll
- [ ] `G + N` : Notifications
- [ ] `G + O` : Org Chart
- [ ] `Escape` : đóng dialog

---

## 13. Phụ lục: Ma trận Ưu tiên

### 13.1 Tổng hợp ưu tiên MoSCoW

| Mức độ | Số lượng | Mô tả                    |
|:------:|:--------:|--------------------------|
| Must   | 18       | Bắt buộc cho MVP         |
| Should | 7        | Nên có sau MVP           |
| Could  | 4        | Có thể có nếu thời gian  |
| Won't  | 0        | Không làm trong phase này |

### 13.2 Phân bổ Story Points

| Epic    | Tên                     | Must | Should | Could | Tổng SP |
|:-------:|-------------------------|:----:|:------:|:-----:|:-------:|
| Epic 1  | Xác thực & Tài khoản    | 9    | 0      | 3     | 12      |
| Epic 2  | Quản lý Nhân viên       | 26   | 5      | 0     | 31      |
| Epic 3  | Quản lý Phòng ban       | 5    | 3      | 0     | 8       |
| Epic 4  | Quản lý Nghỉ phép       | 24   | 0      | 0     | 24      |
| Epic 5  | Quản lý Chấm công       | 8    | 5      | 0     | 13      |
| Epic 6  | Quản lý Bảng lương      | 16   | 0      | 0     | 16      |
| Epic 7  | Dashboard & Thống kê    | 21   | 0      | 0     | 21      |
| Epic 8  | Tuyển dụng              | 0    | 10     | 0     | 10      |
| Epic 9  | Đánh giá Hiệu suất      | 0    | 5      | 3     | 8       |
| Epic 10 | Thông báo               | 5    | 5      | 0     | 10      |
| Epic 11 | Giao diện & UX          | 0    | 8      | 8     | 16      |
| **Tổng**|                         | **114** | **41** | **14** | **169** |

### 13.3 Velocity & Timeline

| Sprint | Duration | Velocity (SP) | Sprint Goal                         |
|:------:|:--------:|:-------------:|-------------------------------------|
| 1      | 2 weeks  | 20            | Auth + Employee CRUD + Departments  |
| 2      | 2 weeks  | 20            | Leave flow + Attendance             |
| 3      | 2 weeks  | 20            | Payroll + Dashboard                 |
| 4      | 2 weeks  | 20            | Notifications + Profile + UI/UX    |
| 5      | 2 weeks  | 20            | Recruitment + Performance Reviews   |
| 6      | 2 weeks  | 20            | Polish + Bug fixing                 |
| 7      | 2 weeks  | 20            | Testing + Deployment                |
| 8      | 2 weeks  | 29            | Buffer + Should/Could features      |
