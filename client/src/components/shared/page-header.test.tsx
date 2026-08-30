import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('renders the action button', () => {
    render(<PageHeader action={<button>Add New</button>} />);
    expect(screen.getByText('Add New')).toBeInTheDocument();
  });

  it('renders nothing when no action is provided', () => {
    render(<PageHeader />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(document.querySelector('.mb-6')).toBeNull();
  });
});