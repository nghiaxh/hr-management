import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/shared/status-badge';

const mockT = vi.fn((key: string) => key);

vi.mock('@/context/language-context', () => ({
  useTranslation: () => ({ t: mockT }),
}));

describe('StatusBadge', () => {
  const statuses = ['approved', 'pending', 'rejected', 'present', 'late', 'absent', 'half-day', 'draft', 'paid'];
  for (const status of statuses) {
    it(`renders with status "${status}"`, () => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(`status.${status.replace('-', '_')}`)).toBeInTheDocument();
    });
  }
});
