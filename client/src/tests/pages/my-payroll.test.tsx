import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import MyPayrollPage from '@/pages/payroll/my-payroll';

function createWrapper(initialRoute = '/payroll') {
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

describe('MyPayrollPage', () => {
  it('renders payroll title', async () => {
    render(<MyPayrollPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Bảng lương')).toBeInTheDocument();
    });
  });

  it('renders payroll summary cards', async () => {
    render(<MyPayrollPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Tổng đã trả')).toBeInTheDocument();
      expect(screen.getAllByText('Đã trả').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders payroll records table', async () => {
    render(<MyPayrollPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('6/2025')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Đã trả').length).toBeGreaterThanOrEqual(1);
  });
});
