import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatCurrency } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('merges tailwind classes correctly', () => {
    expect(cn('px-4 px-6')).toBe('px-6');
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2025-06-15T00:00:00Z');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result).not.toBe('Invalid Date');
  });
});

describe('formatCurrency', () => {
  it('formats a number as VND', () => {
    const result = formatCurrency(15000000);
    expect(result).toContain('15');
    expect(result).toContain('000');
  });

  it('handles zero', () => {
    const result = formatCurrency(0);
    expect(result).toBeTruthy();
  });
});
