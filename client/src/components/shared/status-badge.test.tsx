import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './status-badge';
import { LanguageProvider } from '../../context/language-context';

describe('StatusBadge', () => {
  it('renders the status text', () => {
    render(
      <LanguageProvider>
        <StatusBadge status="pending" />
      </LanguageProvider>
    );
    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument();
  });

  it('renders without crashing for all statuses', () => {
    const statuses = ['pending', 'approved', 'rejected', 'present', 'late', 'absent', 'half-day', 'draft', 'paid'];
    for (const status of statuses) {
      const { container } = render(
        <LanguageProvider>
          <StatusBadge status={status} />
        </LanguageProvider>
      );
      expect(container.firstChild).toBeTruthy();
    }
  });
});
