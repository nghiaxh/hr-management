import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/auth-context';
import { LanguageProvider } from './context/language-context';
import { AppLayout } from './components/layout/app-layout';
import { ProtectedRoute } from './components/layout/protected-route';
import { ErrorBoundary } from './components/shared/error-boundary';
import { RouteLoadingIndicator } from './components/shared/route-loading';
import { KeyboardShortcuts } from './components/shared/keyboard-shortcuts';
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
import { SocketInit } from './hooks/use-socket';

const queryClient = new QueryClient();

function AppContent() {
  return (
    <>
      <RouteLoadingIndicator />
      <KeyboardShortcuts />
      <SocketInit />
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<ProtectedRoute roles={['admin', 'manager', 'employee']}><DashboardPage /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute roles={['admin', 'manager']}><EmployeesListPage /></ProtectedRoute>} />
            <Route path="/employees/:id" element={<ProtectedRoute roles={['admin', 'manager', 'employee']}><EmployeeDetailPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute roles={['admin', 'manager', 'employee']}><ProfilePage /></ProtectedRoute>} />
            <Route path="/departments" element={<ProtectedRoute roles={['admin', 'manager']}><DepartmentsListPage /></ProtectedRoute>} />
            <Route path="/org-chart" element={<ProtectedRoute roles={['admin', 'manager']}><OrgChartPage /></ProtectedRoute>} />
            <Route path="/leaves" element={<ProtectedRoute roles={['admin', 'manager', 'employee']}><MyLeavesPage /></ProtectedRoute>} />
            <Route path="/leaves/approvals" element={<ProtectedRoute roles={['admin', 'manager']}><LeaveApprovalsPage /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute roles={['admin', 'manager', 'employee']}><MyAttendancePage /></ProtectedRoute>} />
            <Route path="/attendance/report" element={<ProtectedRoute roles={['admin', 'manager']}><AttendanceReportPage /></ProtectedRoute>} />
            <Route path="/payroll" element={<ProtectedRoute roles={['admin', 'manager', 'employee']}><MyPayrollPage /></ProtectedRoute>} />
            <Route path="/payroll/manage" element={<ProtectedRoute roles={['admin']}><PayrollManagementPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute roles={['admin', 'manager', 'employee']}><NotificationsListPage /></ProtectedRoute>} />
            <Route path="/recruitment/job-postings" element={<ProtectedRoute roles={['admin', 'manager']}><JobPostingsPage /></ProtectedRoute>} />
            <Route path="/recruitment/candidates" element={<ProtectedRoute roles={['admin', 'manager']}><CandidatesPage /></ProtectedRoute>} />
            <Route path="/performance-reviews" element={<ProtectedRoute roles={['admin', 'manager', 'employee']}><MyReviewsPage /></ProtectedRoute>} />
            <Route path="/performance-reviews/manage" element={<ProtectedRoute roles={['admin', 'manager']}><ReviewManagementPage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
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
