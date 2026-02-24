"use client";

import { useState, useEffect } from "react";

type SystemTheme = "light" | "dark";

/**
 * Hook to detect system theme preference
 *
 * Uses the prefers-color-scheme media query to detect
 * whether the user prefers light or dark mode.
 *
 * @example
 * const systemTheme = useSystemTheme();
 * // Returns 'light' or 'dark'
 */
export function useSystemTheme(): SystemTheme {
  const [systemTheme, setSystemTheme] = useState<SystemTheme>("light");

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === "undefined") {
      return;
    }

    // Get initial system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const initialTheme: SystemTheme = mediaQuery.matches ? "dark" : "light";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSystemTheme(initialTheme);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return systemTheme;
}

export default useSystemTheme;
