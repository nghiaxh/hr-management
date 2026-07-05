import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import NotFoundPage from '@/pages/not-found';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/nonexistent']}>
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

describe('NotFoundPage', () => {
  it('renders 404 heading', () => {
    render(<NotFoundPage />, { wrapper: createWrapper() });

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders not found message', () => {
    render(<NotFoundPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Không tìm thấy trang')).toBeInTheDocument();
  });

  it('renders link to leaves', () => {
    render(<NotFoundPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Về trang chủ')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/leaves');
  });
});
