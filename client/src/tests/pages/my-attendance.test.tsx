import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import MyAttendancePage from '@/pages/attendance/my-attendance';

function createWrapper(initialRoute = '/attendance') {
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

describe('MyAttendancePage', () => {
  it('renders attendance title', async () => {
    render(<MyAttendancePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Chấm công')).toBeInTheDocument();
    });
  });

  it('renders attendance records table', async () => {
    render(<MyAttendancePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Có mặt')).toBeInTheDocument();
    });
  });

  it('renders check in button when no check-in exists', async () => {
    render(<MyAttendancePage />, { wrapper: createWrapper() });

    await waitFor(() => {
      const checkInBtns = screen.getAllByRole('button', { name: /Vào/ });
      expect(checkInBtns.length).toBeGreaterThanOrEqual(1);
    });
  });
});
