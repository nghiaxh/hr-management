import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/auth-context';
import { LanguageProvider } from './context/language-context';
import { AppLayout } from './components/layout/app-layout';
import { ProtectedRoute } from './components/layout/protected-route';
import { ErrorBoundary } from './components/shared/error-boundary';
import { PageLoader } from './components/shared/page-loader';
import LoginPage from './pages/login';
import NotFoundPage from './pages/not-found';
import { Toaster } from './components/ui/toaster';

const EmployeesListPage = lazy(() => import('./pages/employees/employees-list'));
const EmployeeDetailPage = lazy(() => import('./pages/employees/employee-detail'));
const ProfilePage = lazy(() => import('./pages/profile'));
const DepartmentsListPage = lazy(() => import('./pages/departments/departments-list'));
const MyLeavesPage = lazy(() => import('./pages/leaves/my-leaves'));
const LeaveApprovalsPage = lazy(() => import('./pages/leaves/leave-approvals'));
const MyAttendancePage = lazy(() => import('./pages/attendance/my-attendance'));
const AttendanceReportPage = lazy(() => import('./pages/attendance/attendance-report'));
const MyPayrollPage = lazy(() => import('./pages/payroll/my-payroll'));
const PayrollManagementPage = lazy(() => import('./pages/payroll/payroll-management'));
const NotificationsListPage = lazy(() => import('./pages/notifications-list'));
const OrgChartPage = lazy(() => import('./pages/org-chart'));
const SettingsPage = lazy(() => import('./pages/settings'));

const queryClient = new QueryClient();

function Suspended({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function AppContent() {
  return (
    <>
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/employees" element={<ProtectedRoute roles={['admin', 'manager']}><Suspended><EmployeesListPage /></Suspended></ProtectedRoute>} />
            <Route path="/employees/:id" element={<ProtectedRoute roles={['admin', 'manager', 'employee']}><Suspended><EmployeeDetailPage /></Suspended></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute roles={['admin', 'manager', 'employee']}><Suspended><ProfilePage /></Suspended></ProtectedRoute>} />
            <Route path="/departments" element={<ProtectedRoute roles={['admin', 'manager']}><Suspended><DepartmentsListPage /></Suspended></ProtectedRoute>} />
            <Route path="/leaves" element={<ProtectedRoute roles={['admin', 'manager', 'employee']}><Suspended><MyLeavesPage /></Suspended></ProtectedRoute>} />
            <Route path="/leaves/approvals" element={<ProtectedRoute roles={['admin', 'manager']}><Suspended><LeaveApprovalsPage /></Suspended></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute roles={['admin', 'manager', 'employee']}><Suspended><MyAttendancePage /></Suspended></ProtectedRoute>} />
            <Route path="/attendance/report" element={<ProtectedRoute roles={['admin', 'manager']}><Suspended><AttendanceReportPage /></Suspended></ProtectedRoute>} />
            <Route path="/payroll" element={<ProtectedRoute roles={['admin', 'manager', 'employee']}><Suspended><MyPayrollPage /></Suspended></ProtectedRoute>} />
            <Route path="/payroll/manage" element={<ProtectedRoute roles={['admin']}><Suspended><PayrollManagementPage /></Suspended></ProtectedRoute>} />
            <Route path="/org-chart" element={<ProtectedRoute roles={['admin', 'manager']}><Suspended><OrgChartPage /></Suspended></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute roles={['admin', 'manager', 'employee']}><Suspended><SettingsPage /></Suspended></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute roles={['admin', 'manager', 'employee']}><Suspended><NotificationsListPage /></Suspended></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/leaves" replace />} />
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
