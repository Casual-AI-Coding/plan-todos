"use client";

import { useEffect, useCallback, useRef } from "react";
import { useHotkeyStore } from "./useHotkeyStore";

interface HotkeyProviderProps {
  children: React.ReactNode;
}

export function HotkeyProvider({ children }: HotkeyProviderProps) {
  const hotkeys = useHotkeyStore((s) => s.hotkeys);
  const hotkeysRef = useRef(hotkeys);

  useEffect(() => {
    hotkeysRef.current = hotkeys;
  }, [hotkeys]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      if (e.key !== "Escape") return;
    }

    const key = e.key;
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const alt = e.altKey;

    for (const [, binding] of Object.entries(hotkeysRef.current)) {
      if (
        binding.key.toLowerCase() === key.toLowerCase() &&
        !!binding.ctrl === ctrl &&
        !!binding.shift === shift &&
        !!binding.alt === alt
      ) {
        e.preventDefault();
        binding.action();
        return;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return <>{children}</>;
}
