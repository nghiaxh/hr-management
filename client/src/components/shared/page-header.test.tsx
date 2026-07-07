import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('renders title and description', () => {
    render(<PageHeader title="Employees" description="Manage your team" />);
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Manage your team')).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <PageHeader
        title="Employees"
        action={<button>Add New</button>}
      />
    );
    expect(screen.getByText('Add New')).toBeInTheDocument();
  });
});
