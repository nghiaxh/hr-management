import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/auth-context';

function TestComponent() {
  const { user, login, logout, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <span data-testid="user-email">{user ? user.email : 'No user'}</span>
      <span data-testid="user-role">{user ? user.role : ''}</span>
      <button data-testid="login-success" onClick={() => login('admin@test.com', 'Password1')}>
        Login Success
      </button>
      <button
        data-testid="login-fail"
        onClick={() => login('bad@test.com', 'bad').catch(() => {})}
      >
        Login Fail
      </button>
      <button data-testid="logout" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

function renderWithProviders() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('AuthContext', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    localStorage.clear();
  });

  it('shows loading then renders with no user', async () => {
    renderWithProviders();
    await waitFor(() => expect(screen.getByTestId('user-email')).toHaveTextContent('No user'));
  });

  it('login succeeds and sets user', async () => {
    renderWithProviders();
    await waitFor(() => expect(screen.getByTestId('user-email')).toHaveTextContent('No user'));
    await user.click(screen.getByTestId('login-success'));
    await waitFor(() => expect(screen.getByTestId('user-email')).toHaveTextContent('admin@test.com'));
    expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
    expect(localStorage.getItem('token')).toBe('test-token-admin');
  });

  it('login fails with wrong credentials', async () => {
    renderWithProviders();
    await waitFor(() => expect(screen.getByTestId('user-email')).toHaveTextContent('No user'));
    await user.click(screen.getByTestId('login-fail'));
    await waitFor(() => expect(screen.getByTestId('user-email')).toHaveTextContent('No user'));
  });

  it('logout clears user and token', async () => {
    renderWithProviders();
    await waitFor(() => expect(screen.getByTestId('user-email')).toHaveTextContent('No user'));
    await user.click(screen.getByTestId('login-success'));
    await waitFor(() => expect(screen.getByTestId('user-email')).toHaveTextContent('admin@test.com'));
    await user.click(screen.getByTestId('logout'));
    expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    expect(localStorage.getItem('token')).toBeNull();
  });
});
