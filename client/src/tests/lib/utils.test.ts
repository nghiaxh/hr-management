import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatCurrency } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('handles undefined values', () => {
    expect(cn('a', undefined, 'b')).toBe('a b');
  });

  it('merges tailwind classes (later wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('formatDate', () => {
  it('formats a date string to vi-VN locale', () => {
    const result = formatDate('2025-06-01');
    expect(result).toContain('01');
    expect(result).toContain('06');
    expect(result).toContain('2025');
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date(2025, 0, 1));
    expect(result).toContain('01');
    expect(result).toContain('01');
    expect(result).toContain('2025');
  });
});

describe('formatCurrency', () => {
  it('formats VND currency', () => {
    const result = formatCurrency(50000);
    expect(result).toContain('₫');
  });

  it('handles zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });
});
