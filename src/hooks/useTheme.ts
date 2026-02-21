'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { ThemeId, themes, defaultTheme } from '@/lib/themes/registry';

const THEME_KEY = 'plan-todos-theme';

/**
 * Get current theme from DOM or localStorage
 */
function getStoredTheme(): ThemeId {
  if (typeof window === 'undefined') return defaultTheme;
  
  // First check DOM (set by inline script)
  const domTheme = document.documentElement.getAttribute('data-theme') as ThemeId;
  if (domTheme && domTheme in themes) {
    return domTheme;
  }
  
  // Then check localStorage
  const stored = localStorage.getItem(THEME_KEY) as ThemeId;
  if (stored && stored in themes) {
    return stored;
  }
  
  // Finally check system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return defaultTheme;
}

/**
 * useTheme hook - manages theme state and persistence
 * Works correctly with SSR via inline script in layout.tsx
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(getStoredTheme);
  
  // Sync with DOM on mount and when theme changes externally
  useEffect(() => {
    const currentTheme = getStoredTheme();
    if (currentTheme !== theme) {
      setThemeState(currentTheme);
    }
  }, []);
  
  const setTheme = useCallback((newTheme: ThemeId) => {
    // Validate theme
    if (!(newTheme in themes)) {
      console.warn(`Invalid theme: ${newTheme}, falling back to light`);
      newTheme = defaultTheme;
    }
    
    // Update state
    setThemeState(newTheme);
    
    // Update DOM
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Persist to localStorage
    localStorage.setItem(THEME_KEY, newTheme);
  }, []);
  
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);
  
  const isDark = theme === 'dark';
  
  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
    isInitialized: true, // Always initialized due to inline script
  };
}

export type { ThemeId };
