"use client";

import { useCallback, useState, useEffect } from "react";

import { STORAGE_KEYS, FONT_SIZE } from "@/config/constants";

const defaultFontSize = 16;

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
  const stored = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed) && parsed >= FONT_SIZE.MIN && parsed <= FONT_SIZE.MAX) {
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
    const clampedSize = Math.max(FONT_SIZE.MIN, Math.min(FONT_SIZE.MAX, size));
    setFontSizeState(clampedSize);
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, String(clampedSize));
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
    minSize: FONT_SIZE.MIN,
    maxSize: FONT_SIZE.MAX,
    defaultSize: defaultFontSize,
  };
}
