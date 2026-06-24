import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Breadcrumb } from '@/components/shared/breadcrumb';

describe('Breadcrumb', () => {
  it('renders home link and breadcrumb items', () => {
    const items = [
      { label: 'Employees', href: '/employees' },
      { label: 'John Doe' },
    ];
    render(
      <MemoryRouter>
        <Breadcrumb items={items} />
      </MemoryRouter>
    );
    expect(screen.getByLabelText('Home')).toBeInTheDocument();
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders last item as non-link', () => {
    const items = [
      { label: 'Link1', href: '/link1' },
      { label: 'Last' },
    ];
    render(
      <MemoryRouter>
        <Breadcrumb items={items} />
      </MemoryRouter>
    );
    const last = screen.getByText('Last');
    expect(last.tagName).toBe('SPAN');
    expect(last).toHaveClass('font-medium');
  });
});
