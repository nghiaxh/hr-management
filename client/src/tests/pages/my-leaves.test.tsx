import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import MyLeavesPage from '@/pages/leaves/my-leaves';

function createWrapper(initialRoute = '/leaves') {
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

describe('MyLeavesPage', () => {
  it('renders leaves title', async () => {
    render(<MyLeavesPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Đơn nghỉ phép')).toBeInTheDocument();
    });
  });

  it('renders new request button', async () => {
    render(<MyLeavesPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Tạo đơn')).toBeInTheDocument();
    });
  });

  it('renders leave balance cards', async () => {
    render(<MyLeavesPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('annual')).toBeInTheDocument();
      expect(screen.getByText('Chờ duyệt')).toBeInTheDocument();
    });
  });
});
