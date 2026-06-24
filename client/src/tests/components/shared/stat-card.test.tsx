import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/shared/stat-card';
import { Users } from 'lucide-react';

describe('StatCard', () => {
  it('renders title, value, subtitle, icon', () => {
    render(<StatCard title="Employees" value={42} subtitle="Active" icon={Users} />);
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
});
