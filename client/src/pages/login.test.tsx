import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import LoginPage from './login';
import { AuthProvider } from '../context/auth-context';
import { authApi } from '../api/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../api/auth', () => ({
  authApi: {
    login: vi.fn(),
    getMe: vi.fn(),
  },
}));

function renderLogin() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(authApi.getMe).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'employee' });
  });

  it('renders login form', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeInTheDocument();
  });

  it('shows error on failed login', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'));
    const user = userEvent.setup();

    renderLogin();
    await user.type(screen.getByLabelText(/email/i), 'bad@email.com');
    await user.type(screen.getByLabelText(/mật khẩu/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /đăng nhập/i }));

    await waitFor(() => {
      expect(screen.getByText(/Thông tin đăng nhập không hợp lệ/i)).toBeInTheDocument();
    });
  });

  it('logs in directly when a demo account is clicked', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ user: { id: '1', email: 'admin@hr.com', role: 'admin' } });
    const user = userEvent.setup();

    renderLogin();
    await user.click(screen.getByRole('button', { name: /admin@hr\.com/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('admin@hr.com', 'admin123');
    });
  });
});