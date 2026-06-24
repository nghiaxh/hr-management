import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import NotificationsListPage from '@/pages/notifications-list';

function createWrapper(initialRoute = '/notifications') {
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

describe('NotificationsListPage', () => {
  it('renders notifications title', async () => {
    render(<NotificationsListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Thông báo')).toBeInTheDocument();
    });
  });

  it('renders notification items from MSW', async () => {
    render(<NotificationsListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Leave approved')).toBeInTheDocument();
      expect(screen.getByText('Payroll ready')).toBeInTheDocument();
    });

    expect(screen.getByText('Your leave has been approved')).toBeInTheDocument();
    expect(screen.getByText('Your payroll is ready')).toBeInTheDocument();
  });

  it('renders mark all as read button when unread notifications exist', async () => {
    render(<NotificationsListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Đánh dấu đã đọc')).toBeInTheDocument();
    });
  });
});
