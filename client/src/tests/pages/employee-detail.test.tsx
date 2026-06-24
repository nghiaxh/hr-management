import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import EmployeeDetailPage from '@/pages/employees/employee-detail';

function createWrapper(initialRoute = '/employees/1') {
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

describe('EmployeeDetailPage', () => {
  it('renders employee name and position', async () => {
    render(<EmployeeDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('Developer')).toBeInTheDocument();
  });

  it('renders edit button', async () => {
    render(<EmployeeDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Chỉnh sửa')).toBeInTheDocument();
    });
  });

  it('renders department info', async () => {
    render(<EmployeeDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });
  });

  it('renders back link to employees list', async () => {
    render(<EmployeeDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Nhân viên')).toBeInTheDocument();
    });
  });
});
