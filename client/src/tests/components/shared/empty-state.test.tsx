import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/shared/empty-state';
import { Users } from 'lucide-react';

describe('EmptyState', () => {
  it('renders default title', () => {
    render(<EmptyState />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders custom title and description', () => {
    render(<EmptyState title="Nothing here" description="Try again later" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Try again later')).toBeInTheDocument();
  });

  it('renders custom icon', () => {
    const { container } = render(<EmptyState icon={Users} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders action slot', () => {
    render(<EmptyState action={<button>Add item</button>} />);
    expect(screen.getByText('Add item')).toBeInTheDocument();
  });
});
