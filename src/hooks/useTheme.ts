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

import { STORAGE_KEYS } from "@/config/constants";

const CUSTOM_THEME_KEY = "plan-todos-custom-theme-colors";

// Custom theme colors interface
interface CustomThemeColors {
  primary: string;
  secondary: string;
  bg: string;
  bgCard: string;
  text: string;
  textMuted: string;
}

// Default custom theme colors
const defaultCustomColors: CustomThemeColors = {
  primary: "#14B8A6",
  secondary: "#2DD4BF",
  bg: "#0F172A",
  bgCard: "#1E293B",
  text: "#F1F5F9",
  textMuted: "#94A3B8",
};

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
  const stored = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeId;
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
 * Load custom colors from localStorage
 */
export function loadCustomColors(): CustomThemeColors {
  if (typeof window === "undefined") return defaultCustomColors;
  const stored = localStorage.getItem(CUSTOM_THEME_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultCustomColors;
    }
  }
  return defaultCustomColors;
}

/**
 * Save custom colors to localStorage
 */
export function saveCustomColors(colors: CustomThemeColors): void {
  localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(colors));
}

/**
 * Apply custom colors to CSS variables
 */
export function applyCustomColors(colors: CustomThemeColors): void {
  const root = document.documentElement;
  root.style.setProperty("--color-primary", colors.primary);
  root.style.setProperty("--color-secondary", colors.secondary);
  root.style.setProperty("--color-bg", colors.bg);
  root.style.setProperty("--color-bg-card", colors.bgCard);
  root.style.setProperty("--color-text", colors.text);
  root.style.setProperty("--color-text-muted", colors.textMuted);
}

/**
 * Clear custom colors from CSS variables (revert to CSS defaults)
 */
function clearCustomColors(): void {
  const root = document.documentElement;
  root.style.removeProperty("--color-primary");
  root.style.removeProperty("--color-secondary");
  root.style.removeProperty("--color-bg");
  root.style.removeProperty("--color-bg-card");
  root.style.removeProperty("--color-text");
  root.style.removeProperty("--color-text-muted");
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

    // Apply or clear custom colors
    if (themeToApply === "custom") {
      const customColors = loadCustomColors();
      applyCustomColors(customColors);
    } else {
      clearCustomColors();
    }
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
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
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
