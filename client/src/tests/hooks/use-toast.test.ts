import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { toast, useToast } from '@/hooks/use-toast';

describe('useToast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('toast() returns a toast with id and title', () => {
    const t = toast({ title: 'Hello' });
    expect(t.id).toBeDefined();
    expect(t.title).toBe('Hello');
  });

  it('toast() supports description and variant', () => {
    const t = toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    expect(t.description).toBe('Something went wrong');
    expect(t.variant).toBe('destructive');
  });

  it('useToast sees added toasts', () => {
    const { result } = renderHook(() => useToast());
    act(() => { toast({ title: 'Test' }); });
    expect(result.current.toasts.some((t) => t.title === 'Test')).toBe(true);
  });

  it('dismiss removes toast from list', () => {
    const { result } = renderHook(() => useToast());
    let created: ReturnType<typeof toast>;
    act(() => { created = toast({ title: 'Dismiss me' }); });
    expect(result.current.toasts.some((t) => t.id === created!.id)).toBe(true);
    act(() => { result.current.dismiss(created!.id); });
    expect(result.current.toasts.some((t) => t.id === created!.id)).toBe(false);
  });

  it('auto-removes toast after 5 seconds', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());
    const before = result.current.toasts.length;
    act(() => { toast({ title: 'Auto' }); });
    expect(result.current.toasts.length).toBe(before + 1);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.toasts.length).toBe(before);
  });
});
