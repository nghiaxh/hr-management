import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TopHeader } from '@/components/layout/top-header';

const mockUseTranslation = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('@/context/language-context', () => ({
  useTranslation: () => mockUseTranslation(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useLocation: () => mockUseLocation() };
});

describe('TopHeader', () => {
  beforeEach(() => {
    mockUseTranslation.mockReturnValue({ t: (key: string) => key });
  });

  it('renders breadcrumbs based on current path', () => {
    mockUseLocation.mockReturnValue({ pathname: '/employees' });
    render(
      <MemoryRouter>
        <TopHeader onMenuToggle={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getAllByText('nav.employees').length).toBeGreaterThan(0);
  });

  it('renders mobile menu button', () => {
    mockUseLocation.mockReturnValue({ pathname: '/leaves' });
    render(
      <MemoryRouter>
        <TopHeader onMenuToggle={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
  });

  it('returns null on login path', () => {
    mockUseLocation.mockReturnValue({ pathname: '/login' });
    const { container } = render(
      <MemoryRouter>
        <TopHeader onMenuToggle={vi.fn()} />
      </MemoryRouter>
    );
    expect(container.innerHTML).toBe('');
  });
});
