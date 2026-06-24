import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import PayrollManagementPage from '@/pages/payroll/payroll-management';

function createWrapper(initialRoute = '/payroll/management') {
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

describe('PayrollManagementPage', () => {
  it('renders payroll management title', async () => {
    render(<PayrollManagementPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Quản lý lương')).toBeInTheDocument();
    });
  });

  it('renders process payroll button', async () => {
    render(<PayrollManagementPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Xử lý lương')).toBeInTheDocument();
    });
  });

  it('renders payroll records data', async () => {
    render(<PayrollManagementPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('6/2025')).toBeInTheDocument();
  });
});
