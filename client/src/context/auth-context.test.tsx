import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './auth-context';
import { authApi } from '../api/auth';

vi.mock('../api/auth', () => ({
  authApi: {
    login: vi.fn(),
    getMe: vi.fn(),
  },
}));

function TestComponent() {
  const { user, token, login, logout, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'loaded'}</span>
      <span data-testid="user">{user ? user.email : 'no-user'}</span>
      <span data-testid="token">{token ?? 'no-token'}</span>
      <button data-testid="login-btn" onClick={() => login('a@b.com', 'pwd')}>Login</button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows loading initially when token exists', () => {
    localStorage.setItem('token', 'existing-token');
    vi.mocked(authApi.getMe).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'employee' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading').textContent).toBe('loading');
  });

  it('loads user from token on mount', async () => {
    localStorage.setItem('token', 'existing-token');
    vi.mocked(authApi.getMe).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'employee' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('a@b.com');
    });
    expect(screen.getByTestId('loading').textContent).toBe('loaded');
  });

  it('shows no user when no token', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('no-user');
    });
    expect(screen.getByTestId('token').textContent).toBe('no-token');
  });

  it('login stores token and sets user', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      token: 'new-token',
      user: { id: '1', email: 'test@example.com', role: 'admin' },
    });
    vi.mocked(authApi.getMe).mockResolvedValue({ id: '1', email: 'test@example.com', role: 'admin' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('new-token');
    });
    expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    expect(localStorage.getItem('token')).toBe('new-token');
  });

  it('logout clears token and user', async () => {
    localStorage.setItem('token', 'existing-token');
    vi.mocked(authApi.getMe).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'employee' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('a@b.com');
    });

    await userEvent.click(screen.getByTestId('logout-btn'));

    expect(screen.getByTestId('token').textContent).toBe('no-token');
    expect(screen.getByTestId('user').textContent).toBe('no-user');
    expect(localStorage.getItem('token')).toBeNull();
  });
});
