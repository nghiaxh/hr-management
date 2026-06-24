import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/protected-route';

const mockUseAuth = vi.fn();

vi.mock('@/context/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('ProtectedRoute', () => {
  it('shows children when user has correct role', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'admin' }, loading: false });
    render(
      <MemoryRouter>
        <ProtectedRoute roles={['admin']}>
          <div>Protected content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(
      <MemoryRouter initialEntries={['/test']}>
        <ProtectedRoute roles={['admin']}>
          <div>Protected content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('redirects when wrong role', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'employee' }, loading: false });
    render(
      <MemoryRouter initialEntries={['/test']}>
        <ProtectedRoute roles={['admin']}>
          <div>Protected content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});
