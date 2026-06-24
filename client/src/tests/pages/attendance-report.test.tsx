import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import AttendanceReportPage from '@/pages/attendance/attendance-report';

function createWrapper(initialRoute = '/attendance/report') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <AuthProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

beforeEach(() => {
  localStorage.setItem('token', 'test-token');
});

afterEach(() => {
  localStorage.clear();
});

describe('AttendanceReportPage', () => {
  it('renders report title', async () => {
    render(<AttendanceReportPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Báo cáo chấm công')).toBeInTheDocument();
    });
  });

  it('renders attendance stats cards', async () => {
    render(<AttendanceReportPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getAllByText('Có mặt').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders attendance records data', async () => {
    render(<AttendanceReportPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
