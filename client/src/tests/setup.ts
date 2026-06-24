import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { server } from './mocks/server';

// Polyfill fetch for MSW in Node
import 'whatwg-fetch';

// Mock matchMedia for theme handling
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver (used by Radix)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  takeRecords(): IntersectionObserverEntry[] { return []; }
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserverMock,
});

// Mock scrollTo
window.scrollTo = vi.fn() as any;

// Suppress noisy console output in tests (informational, not actionable)
const suppressPatterns = ['React Router Future Flag Warning', 'Not implemented: navigation', 'No routes matched location', 'Error: Test error']; // expected test behavior
const originalWarn = console.warn.bind(console);
console.warn = (...args: any[]) => {
  if (suppressPatterns.some((p) => args.join(' ').includes(p))) return;
  originalWarn(...args);
};
const originalError = console.error.bind(console);
console.error = (...args: any[]) => {
  const msg = typeof args[0] === 'string' ? args.join(' ') : args.map(String).join(' ');
  if (suppressPatterns.some((p) => msg.includes(p))) return;
  originalError(...args);
};

// Also suppress expected errors written directly to process.stderr by React's dev mode
const originalStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = ((chunk: any) => {
  const str = String(chunk);
  if (str.includes('Error: Test error')) return true;
  return originalStderrWrite(chunk);
}) as typeof process.stderr.write;

// Prevent jsdom "Not implemented: navigation" by proxying location changes
const realLocation = window.location;
const locationProxy = new Proxy(realLocation, {
  set(target, prop, value) {
    if (prop === 'href') return true;
    return Reflect.set(target, prop, value);
  },
  get(target, prop) {
    if (prop === 'assign' || prop === 'replace' || prop === 'reload') return vi.fn();
    return Reflect.get(target, prop);
  },
});
Object.defineProperty(window, 'location', { value: locationProxy, writable: true, configurable: true });

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => { cleanup(); server.resetHandlers(); });
afterAll(() => server.close());
