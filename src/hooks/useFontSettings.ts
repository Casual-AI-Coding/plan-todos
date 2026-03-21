"use client";

import { useCallback, useState, useEffect } from "react";

const FONT_SIZE_KEY = "plan-todos-font-size";

// Default font size (in pixels)
const defaultFontSize = 16;

// Valid font size range
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 24;

/**
 * Get current font size from DOM or localStorage
 */
function getStoredFontSize(): number {
  if (typeof window === "undefined") return defaultFontSize;

  // First check DOM
  const domFontSize =
    document.documentElement.style.getPropertyValue("--font-size-base");
  if (domFontSize) {
    const parsed = parseInt(domFontSize, 10);
    if (!isNaN(parsed)) return parsed;
  }

  // Then check localStorage
  const stored = localStorage.getItem(FONT_SIZE_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed) && parsed >= MIN_FONT_SIZE && parsed <= MAX_FONT_SIZE) {
      return parsed;
    }
  }

  return defaultFontSize;
}

/**
 * Apply font size to CSS variable
 */
function applyFontSize(size: number): void {
  document.documentElement.style.setProperty("--font-size-base", `${size}px`);
}

/**
 * useFontSettings hook - manages font size state and persistence
 */
export function useFontSettings() {
  const [fontSize, setFontSizeState] = useState<number>(() =>
    getStoredFontSize(),
  );

  // Apply font size on mount and when it changes
  useEffect(() => {
    applyFontSize(fontSize);
  }, [fontSize]);

  const setFontSize = useCallback((size: number) => {
    // Clamp to valid range
    const clampedSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size));
    setFontSizeState(clampedSize);
    localStorage.setItem(FONT_SIZE_KEY, String(clampedSize));
    applyFontSize(clampedSize);
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSize(fontSize + 1);
  }, [fontSize, setFontSize]);

  const decreaseFontSize = useCallback(() => {
    setFontSize(fontSize - 1);
  }, [fontSize, setFontSize]);

  const resetFontSize = useCallback(() => {
    setFontSize(defaultFontSize);
  }, [setFontSize]);

  return {
    fontSize,
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    minSize: MIN_FONT_SIZE,
    maxSize: MAX_FONT_SIZE,
    defaultSize: defaultFontSize,
  };
}
