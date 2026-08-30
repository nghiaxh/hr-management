import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'app-theme';

function getStoredTheme(): string {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem(THEME_KEY) || 'light';
}

function applyDocumentTheme(theme: string) {
  if (typeof document !== 'undefined') {
    const isDark = theme === 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', isDark);
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<string>(getStoredTheme);

  const setTheme = useCallback((newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    applyDocumentTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  useEffect(() => {
    applyDocumentTheme(theme);
  }, [theme]);

  const isDark = theme === 'dark';

  return { theme, setTheme, toggleTheme, isDark };
}
