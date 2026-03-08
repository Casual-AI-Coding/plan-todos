"use client";

import { useState, useCallback, useEffect } from "react";

const DEFAULT_BLUR = 10;
const DEFAULT_OPACITY = 80;

// Helper to get initial values
function getInitialBlur(): number {
  if (typeof window === "undefined") return DEFAULT_BLUR;
  const saved = localStorage.getItem("glass-blur");
  return saved ? parseInt(saved, 10) : DEFAULT_BLUR;
}

function getInitialOpacity(): number {
  if (typeof window === "undefined") return DEFAULT_OPACITY;
  const saved = localStorage.getItem("glass-opacity");
  return saved ? parseInt(saved, 10) : DEFAULT_OPACITY;
}

export function useGlassSettings() {
  // Lazy initialization - replaces useEffect for initial load
  const [glassBlur, setGlassBlurState] = useState<number>(getInitialBlur);
  const [glassOpacity, setGlassOpacityState] =
    useState<number>(getInitialOpacity);

  // Set initial CSS variables on mount only
  // Subsequent updates are handled by setGlassBlur/setGlassOpacity setters
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--glass-blur",
      `${glassBlur}px`,
    );
    document.documentElement.style.setProperty(
      "--glass-opacity",
      `${glassOpacity / 100}`,
    );
  }, []); // Intentionally empty - only run once on mount

  const setGlassBlur = useCallback((blur: number) => {
    setGlassBlurState(blur);
    localStorage.setItem("glass-blur", blur.toString());
    document.documentElement.style.setProperty("--glass-blur", `${blur}px`);
  }, []);

  const setGlassOpacity = useCallback((opacity: number) => {
    setGlassOpacityState(opacity);
    localStorage.setItem("glass-opacity", opacity.toString());
    document.documentElement.style.setProperty(
      "--glass-opacity",
      `${opacity / 100}`,
    );
  }, []);

  return {
    glassBlur,
    glassOpacity,
    setGlassBlur,
    setGlassOpacity,
  };
}
