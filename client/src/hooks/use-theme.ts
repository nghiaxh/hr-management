import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));

  return { theme, toggleTheme };
}
