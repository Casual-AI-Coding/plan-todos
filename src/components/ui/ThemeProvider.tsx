"use client";

import { useTheme } from "@/hooks/useTheme";
import { useGlassSettings } from "@/hooks/useGlassSettings";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Theme is already set by inline script in layout.tsx
  // This component ensures client-side reactivity
  useTheme();

  // Initialize glass settings (blur/opacity) on app load
  // This applies transparency settings immediately on startup
  useGlassSettings();

  return <>{children}</>;
}
