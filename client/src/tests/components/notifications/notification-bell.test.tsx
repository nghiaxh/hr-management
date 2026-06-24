import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/mocks/server';
import { NotificationBell } from '@/components/notifications/notification-bell';

const mockUseTranslation = vi.fn();

vi.mock('@/context/language-context', () => ({
  useTranslation: () => mockUseTranslation(),
}));

vi.mock('@/lib/utils', () => ({
  formatDate: () => 'Jun 1, 2025',
}));

function renderBell() {
  mockUseTranslation.mockReturnValue({ t: (key: string) => key });
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <NotificationBell />
    </QueryClientProvider>
  );
}

describe('NotificationBell', () => {
  it('renders bell icon', () => {
    renderBell();
    expect(screen.getByLabelText('nav.notifications')).toBeInTheDocument();
  });

  it('shows unread count badge', async () => {
    renderBell();
    const badge = await screen.findByText('1');
    expect(badge).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    renderBell();
    await user.click(screen.getByLabelText('nav.notifications'));
    expect(await screen.findByText('Leave approved')).toBeInTheDocument();
  });

  it('shows no notifications when empty', async () => {
    server.use(
      http.get('*/api/notifications', () => HttpResponse.json([])),
      http.get('*/api/notifications/unread-count', () => HttpResponse.json(0)),
    );
    const user = userEvent.setup();
    renderBell();
    await user.click(screen.getByLabelText('nav.notifications'));
    expect(await screen.findByText('notifications.no_notifications')).toBeInTheDocument();
  });
});
