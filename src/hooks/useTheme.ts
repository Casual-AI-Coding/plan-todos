"use client";

import { useCallback, useState, useEffect } from "react";
import { logger } from "@/lib/utils/logger";
import {
  ThemeId,
  themes,
  defaultTheme,
  systemTheme,
  getTheme,
} from "@/lib/themes/registry";

const THEME_KEY = "plan-todos-theme";

/**
 * Get the actual theme to apply based on stored theme preference
 * If theme is 'system', returns 'light' or 'dark' based on system preference
 * Otherwise returns the theme as-is (supports all custom themes)
 */
function getEffectiveTheme(storedTheme: ThemeId): ThemeId {
  if (storedTheme === "system") {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  }
  // Return the theme as-is for all custom themes (pastel, mint, etc.)
  return storedTheme;
}

/**
 * Get current theme from DOM or localStorage
 */
function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return defaultTheme;

  // Get all valid theme IDs
  const validThemeIds = [...(Object.keys(themes) as ThemeId[]), systemTheme];

  // First check DOM (set by inline script)
  const domTheme = document.documentElement.getAttribute(
    "data-theme",
  ) as ThemeId;
  if (domTheme && validThemeIds.includes(domTheme)) {
    return domTheme;
  }

  // Then check localStorage
  const stored = localStorage.getItem(THEME_KEY) as ThemeId;
  if (stored && validThemeIds.includes(stored)) {
    return stored;
  }

  // Finally check system preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return defaultTheme;
}

/**
 * useTheme hook - manages theme state and persistence
 * Works correctly with SSR via inline script in layout.tsx
 * Supports 'system' theme mode that follows OS preference
 */
export function useTheme() {
  // Initialize state lazily
  const [theme, setThemeState] = useState<ThemeId>(() => getStoredTheme());

  // Apply theme to DOM
  const applyTheme = useCallback((themeToApply: ThemeId) => {
    const effectiveTheme = getEffectiveTheme(themeToApply);
    document.documentElement.setAttribute("data-theme", effectiveTheme);
  }, []);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      applyTheme("system");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, applyTheme]);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setTheme = useCallback((newTheme: ThemeId) => {
    // Validate theme - allow system and any theme in our registry
    const validThemes: ThemeId[] = [
      ...(Object.keys(themes) as ThemeId[]),
      systemTheme,
    ];
    if (!validThemes.includes(newTheme)) {
      logger.warn(`Invalid theme: ${newTheme}, falling back to light`);
      newTheme = defaultTheme;
    }

    // Update state
    setThemeState(newTheme);

    // Persist to localStorage
    localStorage.setItem(THEME_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const themeObj = getTheme(theme);
    // Toggle between light and dark type
    if (themeObj.type === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, [theme, setTheme]);

  // Determine if currently in dark mode
  const effectiveTheme = getEffectiveTheme(theme);
  const themeObj = getTheme(theme);
  const isDark = themeObj.type === "dark";

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
    isSystem: theme === "system",
    isInitialized: true,
  };
}

export type { ThemeId };
