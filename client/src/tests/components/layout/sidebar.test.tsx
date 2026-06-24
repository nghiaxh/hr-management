import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

const mockUseAuth = vi.fn();
const mockUseTranslation = vi.fn();
const mockUseTheme = vi.fn();

vi.mock('@/context/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/context/language-context', () => ({
  useTranslation: () => mockUseTranslation(),
}));

vi.mock('@/hooks/use-theme', () => ({
  useTheme: () => mockUseTheme(),
}));

function renderSidebar(user: any) {
  mockUseAuth.mockReturnValue({ user, logout: vi.fn() });
  mockUseTranslation.mockReturnValue({ t: (key: string) => key });
  mockUseTheme.mockReturnValue({ theme: 'light', toggleTheme: vi.fn() });
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MemoryRouter>
          <Sidebar mobileOpen={false} setMobileOpen={vi.fn()} />
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

describe('Sidebar', () => {
  it('renders admin-only links when user is admin', () => {
    renderSidebar({ role: 'admin', name: 'Admin', email: 'admin@test.com' });
    expect(screen.getByText('nav.payroll_management')).toBeInTheDocument();
    expect(screen.getByText('nav.job_postings')).toBeInTheDocument();
  });

  it('does not render admin-only links for employee', () => {
    renderSidebar({ role: 'employee', name: 'Emp', email: 'emp@test.com' });
    expect(screen.queryByText('nav.payroll_management')).not.toBeInTheDocument();
    expect(screen.queryByText('nav.job_postings')).not.toBeInTheDocument();
    expect(screen.getByText('nav.dashboard')).toBeInTheDocument();
  });

  it('renders mobile overlay when mobileOpen is true', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'admin', name: 'Admin', email: 'admin@test.com' }, logout: vi.fn() });
    mockUseTranslation.mockReturnValue({ t: (key: string) => key });
    mockUseTheme.mockReturnValue({ theme: 'light', toggleTheme: vi.fn() });
    const queryClient = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <MemoryRouter>
            <Sidebar mobileOpen={true} setMobileOpen={vi.fn()} />
          </MemoryRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
    expect(container.querySelector('.fixed.inset-0.z-30')).toBeInTheDocument();
  });
});
