import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '@/components/shared/page-header';

describe('PageHeader', () => {
  it('renders title and description', () => {
    render(<PageHeader title="Dashboard" description="Overview" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('renders action slot', () => {
    render(<PageHeader title="Title" action={<button>Action</button>} />);
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(<PageHeader title="Only Title" />);
    expect(screen.getByText('Only Title')).toBeInTheDocument();
  });
});
