import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/app-layout';

const mockUseAuth = vi.fn();
const mockUseTranslation = vi.fn();
vi.mock('@/context/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/context/language-context', () => ({
  useTranslation: () => mockUseTranslation(),
}));

function renderAppLayout() {
  mockUseTranslation.mockReturnValue({ t: (key: string) => key });
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/leaves']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/leaves" element={<div>Leaves page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AppLayout', () => {
  it('shows loading state when authenticating', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    renderAppLayout();
    expect(screen.getByText('app.loading')).toBeInTheDocument();
  });

  it('redirects when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    renderAppLayout();
    expect(screen.queryByText('Leaves page')).not.toBeInTheDocument();
  });

  it('renders sidebar, top-header, and outlet when authenticated', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'admin', name: 'Admin', email: 'admin@test.com' }, loading: false, logout: vi.fn() });
    renderAppLayout();
    expect(screen.getByText('Leaves page')).toBeInTheDocument();
    expect(screen.getAllByText('nav.leaves').length).toBeGreaterThan(0);
  });
});
