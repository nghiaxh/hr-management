import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import SettingsPage from '@/pages/settings';

function createWrapper(initialRoute = '/settings') {
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

describe('SettingsPage', () => {
  it('renders settings title', () => {
    render(<SettingsPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Cài đặt')).toBeInTheDocument();
  });

  it('renders theme toggle section', () => {
    render(<SettingsPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Giao diện')).toBeInTheDocument();
    expect(screen.getByText('Sáng')).toBeInTheDocument();
    expect(screen.getByText('Tối')).toBeInTheDocument();
  });

  it('renders language section', () => {
    render(<SettingsPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Ngôn ngữ')).toBeInTheDocument();
    expect(screen.getByText('settings.language_desc')).toBeInTheDocument();
  });

  it('toggles theme on click', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />, { wrapper: createWrapper() });

    const darkButton = screen.getByText('Tối');
    await user.click(darkButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
