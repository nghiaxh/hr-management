import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/auth-context';
import { LanguageProvider } from './context/language-context';
import { AppLayout } from './components/layout/app-layout';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import EmployeesListPage from './pages/employees/employees-list';
import EmployeeDetailPage from './pages/employees/employee-detail';
import ProfilePage from './pages/profile';
import DepartmentsListPage from './pages/departments/departments-list';
import OrgChartPage from './pages/org-chart';
import MyLeavesPage from './pages/leaves/my-leaves';
import LeaveApprovalsPage from './pages/leaves/leave-approvals';
import MyAttendancePage from './pages/attendance/my-attendance';
import AttendanceReportPage from './pages/attendance/attendance-report';
import MyPayrollPage from './pages/payroll/my-payroll';
import PayrollManagementPage from './pages/payroll/payroll-management';
import NotificationsListPage from './pages/notifications-list';
import NotFoundPage from './pages/not-found';
import JobPostingsPage from './pages/recruitment/job-postings';
import CandidatesPage from './pages/recruitment/candidates';
import MyReviewsPage from './pages/performance-reviews/my-reviews';
import ReviewManagementPage from './pages/performance-reviews/review-management';
import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient();

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesListPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/departments" element={<DepartmentsListPage />} />
          <Route path="/org-chart" element={<OrgChartPage />} />
          <Route path="/leaves" element={<MyLeavesPage />} />
          <Route path="/leaves/approvals" element={<LeaveApprovalsPage />} />
          <Route path="/attendance" element={<MyAttendancePage />} />
          <Route path="/attendance/report" element={<AttendanceReportPage />} />
          <Route path="/payroll" element={<MyPayrollPage />} />
          <Route path="/payroll/manage" element={<PayrollManagementPage />} />
          <Route path="/notifications" element={<NotificationsListPage />} />
          <Route path="/recruitment/job-postings" element={<JobPostingsPage />} />
          <Route path="/recruitment/candidates" element={<CandidatesPage />} />
          <Route path="/performance-reviews" element={<MyReviewsPage />} />
          <Route path="/performance-reviews/manage" element={<ReviewManagementPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </AuthProvider>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
