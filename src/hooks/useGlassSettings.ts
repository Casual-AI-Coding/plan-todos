'use client';

import { useState, useEffect, useCallback } from 'react';

const DEFAULT_BLUR = 30;
const DEFAULT_OPACITY = 20;

export function useGlassSettings() {
  const [glassBlur, setGlassBlurState] = useState(DEFAULT_BLUR);
  const [glassOpacity, setGlassOpacityState] = useState(DEFAULT_OPACITY);

  // Load from localStorage on mount AND set CSS variables
  useEffect(() => {
    const savedBlur = localStorage.getItem('glass-blur');
    const savedOpacity = localStorage.getItem('glass-opacity');
    
    if (savedBlur) {
      const blur = parseInt(savedBlur, 10);
      setGlassBlurState(blur);
      document.documentElement.style.setProperty('--glass-blur', `${blur}px`);
    } else {
      // Set default if nothing saved
      document.documentElement.style.setProperty('--glass-blur', `${DEFAULT_BLUR}px`);
    }
    
    if (savedOpacity) {
      const opacity = parseInt(savedOpacity, 10);
      setGlassOpacityState(opacity);
      document.documentElement.style.setProperty('--glass-opacity', `${opacity / 100}`);
    } else {
      // Set default if nothing saved
      document.documentElement.style.setProperty('--glass-opacity', `${DEFAULT_OPACITY / 100}`);
    }
  }, []);

  const setGlassBlur = useCallback((blur: number) => {
    setGlassBlurState(blur);
    localStorage.setItem('glass-blur', blur.toString());
    document.documentElement.style.setProperty('--glass-blur', `${blur}px`);
  }, []);

  const setGlassOpacity = useCallback((opacity: number) => {
    setGlassOpacityState(opacity);
    localStorage.setItem('glass-opacity', opacity.toString());
    document.documentElement.style.setProperty('--glass-opacity', `${opacity / 100}`);
  }, []);

  return {
    glassBlur,
    glassOpacity,
    setGlassBlur,
    setGlassOpacity,
  };
}
