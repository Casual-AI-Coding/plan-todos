'use client';

import { useTheme } from '@/hooks/useTheme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Theme is already set by inline script in layout.tsx
  // This component ensures client-side reactivity
  useTheme();
  
  return <>{children}</>;
}
