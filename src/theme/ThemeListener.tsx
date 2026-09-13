'use client';

import { useEffect } from 'react';
import { hydrateTheme, persistTheme, useTheme } from './useTheme';

export function ThemeListener() {
  const theme = useTheme((state) => state.theme);

  useEffect(() => {
    hydrateTheme();
  }, []);

  useEffect(() => {
    persistTheme(theme);
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return null;
}
