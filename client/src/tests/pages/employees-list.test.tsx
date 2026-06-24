import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import EmployeesListPage from '@/pages/employees/employees-list';

function createWrapper(initialRoute = '/employees') {
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

describe('EmployeesListPage', () => {
  it('renders employee list title and add button', async () => {
    render(<EmployeesListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Nhân viên')).toBeInTheDocument();
    });

    expect(screen.getByText('Thêm nhân viên')).toBeInTheDocument();
  });

  it('renders search input', async () => {
    render(<EmployeesListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Tìm nhân viên...')).toBeInTheDocument();
    });
  });

  it('renders employee data from MSW', async () => {
    render(<EmployeesListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });
});
