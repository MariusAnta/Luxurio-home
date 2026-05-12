import { useState, useEffect } from 'react';

const STORAGE_KEY = 'luxurio-theme';

export function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}
