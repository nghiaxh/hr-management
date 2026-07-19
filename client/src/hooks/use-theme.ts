import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'daisyui-theme';

function getStoredTheme(): string {
  if (typeof window === 'undefined') return 'business';
  return localStorage.getItem(THEME_KEY) || 'light';
}

function setDocumentTheme(theme: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<string>(getStoredTheme);

  const setTheme = useCallback((newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    setDocumentTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  useEffect(() => {
    setDocumentTheme(theme);
  }, []);

  const isDark = theme === 'dark';

  return { theme, setTheme, toggleTheme, resolvedTheme: theme, isDark };
}
