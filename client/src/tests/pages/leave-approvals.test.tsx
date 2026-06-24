import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import LeaveApprovalsPage from '@/pages/leaves/leave-approvals';

function createWrapper(initialRoute = '/leaves/approvals') {
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

describe('LeaveApprovalsPage', () => {
  it('renders approvals title', async () => {
    render(<LeaveApprovalsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Phê duyệt đơn')).toBeInTheDocument();
    });
  });

  it('renders pending leaves table with employee data', async () => {
    render(<LeaveApprovalsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('annual')).toBeInTheDocument();
    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument();
  });

  it('renders approve and reject buttons', async () => {
    render(<LeaveApprovalsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      const approveButtons = screen.getAllByRole('button', { name: 'Duyệt' });
      expect(approveButtons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
