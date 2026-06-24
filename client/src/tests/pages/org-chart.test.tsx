import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import OrgChartPage from '@/pages/org-chart';

function createWrapper(initialRoute = '/org-chart') {
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

describe('OrgChartPage', () => {
  it('renders org chart title', async () => {
    render(<OrgChartPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Sơ đồ tổ chức')).toBeInTheDocument();
    });
  });

  it('renders department cards', async () => {
    render(<OrgChartPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('Marketing')).toBeInTheDocument();
    });
  });

  it('renders employee count for departments', async () => {
    render(<OrgChartPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getAllByText(/nhân viên/).length).toBeGreaterThanOrEqual(1);
    });
  });
});
