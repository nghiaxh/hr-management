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
  const { user, login, logout, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'loaded'}</span>
      <span data-testid="user">{user ? user.email : 'no-user'}</span>
      <button data-testid="login-btn" onClick={() => login('a@b.com', 'pwd')}>Login</button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    document.cookie = 'JSESSIONID=; Max-Age=0; path=/';
    document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/';
    vi.clearAllMocks();
    vi.mocked(authApi.getMe).mockRejectedValue(new Error('no session'));
  });

  it('loads user from session on mount', async () => {
    document.cookie = 'JSESSIONID=abc123; path=/';
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

  it('skips session restore when no session cookie exists', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded');
    });
    expect(screen.getByTestId('user').textContent).toBe('no-user');
    expect(authApi.getMe).not.toHaveBeenCalled();
  });

  it('login sets user from the response without an extra profile fetch', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      user: { id: '1', email: 'test@example.com', role: 'admin' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    });
  });

  it('logout clears cookie and user', async () => {
    document.cookie = 'JSESSIONID=abc123; path=/';
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

    expect(screen.getByTestId('user').textContent).toBe('no-user');
    expect(document.cookie).not.toContain('JSESSIONID');
    expect(document.cookie).not.toContain('XSRF-TOKEN');
  });
});