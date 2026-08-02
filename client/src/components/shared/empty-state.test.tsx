import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './empty-state';
import { Tray } from '@phosphor-icons/react';

describe('EmptyState', () => {
  it('renders icon, title, and description', () => {
    render(
      <EmptyState
        icon={Tray}
        title="No results"
        description="Try adjusting your search."
      />
    );
    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search.')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(
      <EmptyState
        icon={Tray}
        title="No leaves"
        action={<button>Request Leave</button>}
      />
    );
    expect(screen.getByText('Request Leave')).toBeInTheDocument();
  });
});

