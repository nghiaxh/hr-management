import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/auth-context';
import { AppLayout } from './components/layout/app-layout';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import EmployeesListPage from './pages/employees/employees-list';
import EmployeeDetailPage from './pages/employees/employee-detail';
import DepartmentsListPage from './pages/departments/departments-list';
import MyLeavesPage from './pages/leaves/my-leaves';
import LeaveApprovalsPage from './pages/leaves/leave-approvals';
import MyAttendancePage from './pages/attendance/my-attendance';
import AttendanceReportPage from './pages/attendance/attendance-report';
import MyPayrollPage from './pages/payroll/my-payroll';
import PayrollManagementPage from './pages/payroll/payroll-management';
import NotFoundPage from './pages/not-found';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/employees" element={<EmployeesListPage />} />
              <Route path="/employees/:id" element={<EmployeeDetailPage />} />
              <Route path="/departments" element={<DepartmentsListPage />} />
              <Route path="/leaves" element={<MyLeavesPage />} />
              <Route path="/leaves/approvals" element={<LeaveApprovalsPage />} />
              <Route path="/attendance" element={<MyAttendancePage />} />
              <Route path="/attendance/report" element={<AttendanceReportPage />} />
              <Route path="/payroll" element={<MyPayrollPage />} />
              <Route path="/payroll/manage" element={<PayrollManagementPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
