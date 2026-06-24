import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import DepartmentsListPage from '@/pages/departments/departments-list';

function createWrapper(initialRoute = '/departments') {
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

describe('DepartmentsListPage', () => {
  it('renders department list title', async () => {
    render(<DepartmentsListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Phòng ban')).toBeInTheDocument();
    });
  });

  it('renders add department button', async () => {
    render(<DepartmentsListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Thêm phòng ban')).toBeInTheDocument();
    });
  });

  it('renders department data from MSW', async () => {
    render(<DepartmentsListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    expect(screen.getByText('Tech dept')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Mkt dept')).toBeInTheDocument();
  });

  it('renders search input', async () => {
    render(<DepartmentsListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Tìm phòng ban...')).toBeInTheDocument();
    });
  });
});
