import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useLanguage } from '@/hooks/use-language';

describe('useLanguage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to en', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.lang).toBe('en');
  });

  it('reads lang from localStorage', () => {
    localStorage.setItem('lang', 'vi');
    const { result } = renderHook(() => useLanguage());
    expect(result.current.lang).toBe('vi');
  });

  it('translates known keys', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.t('app.name')).toBe('HR Management');
  });

  it('returns key for missing translations', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('setLang changes the current language', () => {
    const { result } = renderHook(() => useLanguage());
    act(() => { result.current.setLang('vi'); });
    expect(result.current.lang).toBe('vi');
    expect(result.current.t('app.name')).toBe('Quản lý Nhân sự');
  });

  it('setLang persists to localStorage', () => {
    const { result } = renderHook(() => useLanguage());
    act(() => { result.current.setLang('vi'); });
    expect(localStorage.getItem('lang')).toBe('vi');
  });
});
