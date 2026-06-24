import { describe, it, expect } from 'vitest';
import { sanitizeFilter, escapeRegex } from '../../utils/security.js';

describe('sanitizeFilter', () => {
  it('should strip $ operator keys from objects', () => {
    const input = { $gt: 5, name: 'John' };
    expect(sanitizeFilter(input)).toEqual({ name: 'John' });
  });

  it('should handle nested objects', () => {
    const input = { user: { $ne: 'admin' }, name: 'John' };
    expect(sanitizeFilter(input)).toEqual({ user: {}, name: 'John' });
  });

  it('should handle arrays', () => {
    const input = [{ $gt: 5 }, { name: 'John' }];
    expect(sanitizeFilter(input)).toEqual([{}, { name: 'John' }]);
  });

  it('should return primitives as-is', () => {
    expect(sanitizeFilter('hello')).toBe('hello');
    expect(sanitizeFilter(42)).toBe(42);
    expect(sanitizeFilter(null)).toBeNull();
    expect(sanitizeFilter(undefined)).toBeUndefined();
  });
});

describe('escapeRegex', () => {
  it('should escape special regex characters', () => {
    expect(escapeRegex('hello.world')).toBe('hello\\.world');
    expect(escapeRegex('test (1)')).toBe('test \\(1\\)');
    expect(escapeRegex('a+b*c')).toBe('a\\+b\\*c');
  });

  it('should return normal string unchanged', () => {
    expect(escapeRegex('hello')).toBe('hello');
    expect(escapeRegex('John Doe')).toBe('John Doe');
  });

  it('should handle empty string', () => {
    expect(escapeRegex('')).toBe('');
  });
});
