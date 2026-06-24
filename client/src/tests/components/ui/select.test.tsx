import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

describe('Select', () => {
  it('renders with trigger and placeholder', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText('Select option')).toBeInTheDocument();
  });

  it('renders SelectValue with a value', () => {
    render(
      <Select value="1">
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
