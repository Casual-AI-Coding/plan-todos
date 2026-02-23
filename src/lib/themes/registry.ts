/**
 * Theme Registry
 *
 * Central configuration for all themes.
 * Add new themes here - no other files need modification.
 */

export type ThemeId =
  | "light"
  | "dark"
  | "dracula"
  | "nord"
  | "monokai"
  | "glass"
  | "spring"
  | "catppuccin"
  | "tokyoNight"
  | "oneDark"
  | "system";

export interface ThemeColors {
  // Base colors
  primary: string;
  secondary: string;
  cta: string;

  // Background colors
  bg: string;
  bgCard: string;
  bgElevated: string;
  bgHover: string;

  // Text colors
  text: string;
  textMuted: string;
  textInverse: string;

  // Border colors
  border: string;
  borderLight: string;

  // Status colors
  success: string;
  warning: string;
  error: string;

  // Shadows
  shadowCard: string;
  shadowElevated: string;

  // Special
  accent: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  nameZh: string;
  icon: string;
  colors: ThemeColors;
}

export const themes: Omit<Record<ThemeId, Theme>, "system"> = {
  light: {
    id: "light",
    name: "Light",
    nameZh: "浅色",
    icon: "☀️",
    colors: {
      primary: "#0D9488",
      secondary: "#14B8A6",
      cta: "#F97316",
      bg: "#F0FDFA",
      bgCard: "#ffffff",
      bgElevated: "#ffffff",
      bgHover: "#F0FDFA",
      text: "#134E4A",
      textMuted: "#64748B",
      textInverse: "#ffffff",
      border: "#CCFBF1",
      borderLight: "#E2E8F0",
      success: "#22C55E",
      warning: "#F59E0B",
      error: "#EF4444",
      shadowCard: "0 1px 3px rgba(0, 0, 0, 0.1)",
      shadowElevated: "0 4px 12px rgba(0, 0, 0, 0.15)",
      accent: "#0D9488",
    },
  },

  dark: {
    id: "dark",
    name: "Dark",
    nameZh: "深色",
    icon: "🌙",
    colors: {
      primary: "#14B8A6",
      secondary: "#2DD4BF",
      cta: "#FB923C",
      bg: "#0F172A",
      bgCard: "#1E293B",
      bgElevated: "#334155",
      bgHover: "#1E293B",
      text: "#F1F5F9",
      textMuted: "#94A3B8",
      textInverse: "#0F172A",
      border: "#334155",
      borderLight: "#475569",
      success: "#4ADE80",
      warning: "#FBBF24",
      error: "#F87171",
      shadowCard: "0 1px 3px rgba(0, 0, 0, 0.3)",
      shadowElevated: "0 4px 12px rgba(0, 0, 0, 0.4)",
      accent: "#14B8A6",
    },
  },

  dracula: {
    id: "dracula",
    name: "Dracula",
    nameZh: "德古拉",
    icon: "🧛",
    colors: {
      primary: "#BD93F9",
      secondary: "#FF79C6",
      cta: "#FF5555",
      bg: "#282A36",
      bgCard: "#383A59",
      bgElevated: "#44475A",
      bgHover: "#383A59",
      text: "#F8F8F2",
      textMuted: "#6272A4",
      textInverse: "#282A36",
      border: "#44475A",
      borderLight: "#6272A4",
      success: "#50FA7B",
      warning: "#F1FA8C",
      error: "#FF5555",
      shadowCard: "0 1px 3px rgba(0, 0, 0, 0.3)",
      shadowElevated: "0 4px 12px rgba(0, 0, 0, 0.4)",
      accent: "#BD93F9",
    },
  },

  nord: {
    id: "nord",
    name: "Nord",
    nameZh: "北欧",
    icon: "❄️",
    colors: {
      primary: "#88C0D0",
      secondary: "#81A1C1",
      cta: "#D08770",
      bg: "#2E3440",
      bgCard: "#3B4252",
      bgElevated: "#434C5E",
      bgHover: "#3B4252",
      text: "#ECEFF4",
      textMuted: "#D8DEE9",
      textInverse: "#2E3440",
      border: "#4C566A",
      borderLight: "#5E81AC",
      success: "#A3BE8C",
      warning: "#EBCB8B",
      error: "#BF616A",
      shadowCard: "0 1px 3px rgba(0, 0, 0, 0.3)",
      shadowElevated: "0 4px 12px rgba(0, 0, 0, 0.4)",
      accent: "#88C0D0",
    },
  },

  monokai: {
    id: "monokai",
    name: "Monokai",
    nameZh: "单色",
    icon: "🎨",
    colors: {
      primary: "#F92672",
      secondary: "#FD971F",
      cta: "#A6E22E",
      bg: "#272822",
      bgCard: "#3E3D32",
      bgElevated: "#49483E",
      bgHover: "#3E3D32",
      text: "#F8F8F2",
      textMuted: "#75715E",
      textInverse: "#272822",
      border: "#49483E",
      borderLight: "#5B5A4E",
      success: "#A6E22E",
      warning: "#E6DB74",
      error: "#F92672",
      shadowCard: "0 1px 3px rgba(0, 0, 0, 0.3)",
      shadowElevated: "0 4px 12px rgba(0, 0, 0, 0.4)",
      accent: "#F92672",
    },
  },

  glass: {
    id: "glass",
    name: "Warm",
    nameZh: "暖色",
    icon: "☀️",
    colors: {
      primary: "#F59E0B",
      secondary: "#EF4444",
      cta: "#F97316",
      bg: "rgba(255, 248, 240, 1)",
      bgCard: "rgba(255, 252, 245, 1)",
      bgElevated: "rgba(255, 250, 240, 1)",
      bgHover: "rgba(255, 245, 235, 1)",
      text: "#78350F",
      textMuted: "#92400E",
      textInverse: "#FFFFFF",
      border: "#FED7AA",
      borderLight: "#FDE68A",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      shadowCard: "0 4px 12px rgba(120, 53, 15, 0.1)",
      shadowElevated: "0 8px 24px rgba(120, 53, 15, 0.15)",
      accent: "#F59E0B",
    },
  },

  // Spring Theme (春节)
  spring: {
    id: "spring",
    name: "Spring",
    nameZh: "春节",
    icon: "🧧",
    colors: {
      primary: "#DC2626",
      secondary: "#F97316",
      cta: "#FBBF24",
      bg: "#FFF1F2",
      bgCard: "#FFFFFF",
      bgElevated: "#FFF5F5",
      bgHover: "#FFE4E6",
      text: "#7F1D1D",
      textMuted: "#B91C1C",
      textInverse: "#FFFFFF",
      border: "#FECACA",
      borderLight: "#FECACA",
      success: "#16A34A",
      warning: "#F59E0B",
      error: "#DC2626",
      shadowCard: "0 1px 3px rgba(220, 38, 38, 0.1)",
      shadowElevated: "0 4px 12px rgba(220, 38, 38, 0.15)",
      accent: "#DC2626",
    },
  },

  // Catppuccin Theme
  catppuccin: {
    id: "catppuccin",
    name: "Catppuccin",
    nameZh: "猫咪",
    icon: "🐱",
    colors: {
      primary: "#cba6f7",
      secondary: "#f5c2e7",
      cta: "#f38ba8",
      bg: "#1e1e2e",
      bgCard: "#313244",
      bgElevated: "#45475a",
      bgHover: "#45475a",
      text: "#cdd6f4",
      textMuted: "#a6adc8",
      textInverse: "#1e1e2e",
      border: "#45475a",
      borderLight: "#585b70",
      success: "#a6e3a1",
      warning: "#f9e2af",
      error: "#f38ba8",
      shadowCard: "0 1px 3px rgba(0, 0, 0, 0.3)",
      shadowElevated: "0 4px 12px rgba(0, 0, 0, 0.4)",
      accent: "#cba6f7",
    },
  },

  // Tokyo Night Theme
  tokyoNight: {
    id: "tokyoNight",
    name: "Tokyo Night",
    nameZh: "东京夜",
    icon: "🌃",
    colors: {
      primary: "#7aa2f7",
      secondary: "#bb9af7",
      cta: "#f7768e",
      bg: "#1a1b26",
      bgCard: "#24283b",
      bgElevated: "#414868",
      bgHover: "#414868",
      text: "#c0caf5",
      textMuted: "#565f89",
      textInverse: "#1a1b26",
      border: "#414868",
      borderLight: "#565f89",
      success: "#9ece6a",
      warning: "#e0af68",
      error: "#f7768e",
      shadowCard: "0 1px 3px rgba(0, 0, 0, 0.3)",
      shadowElevated: "0 4px 12px rgba(0, 0, 0, 0.4)",
      accent: "#7aa2f7",
    },
  },

  // One Dark Theme
  oneDark: {
    id: "oneDark",
    name: "One Dark",
    nameZh: "暗色一",
    icon: "🎨",
    colors: {
      primary: "#c678dd",
      secondary: "#98c379",
      cta: "#e06c75",
      bg: "#282c34",
      bgCard: "#21252b",
      bgElevated: "#2c313c",
      bgHover: "#2c313c",
      text: "#abb2bf",
      textMuted: "#5c6370",
      textInverse: "#282c34",
      border: "#3e4451",
      borderLight: "#4b5263",
      success: "#98c379",
      warning: "#e5c07b",
      error: "#e06c75",
      shadowCard: "0 1px 3px rgba(0, 0, 0, 0.3)",
      shadowElevated: "0 4px 12px rgba(0, 0, 0, 0.4)",
      accent: "#c678dd",
    },
  },
};

export const themeList = Object.values(themes);

// Helper function to get theme by id (does not handle 'system' - use activeTheme in useTheme hook)
export function getTheme(id: ThemeId): Theme {
  if (id === "system") return systemThemeDisplay;
  return themes[id] || themes.light;
}

// Default theme
export const defaultTheme: ThemeId = "light";

// System theme is special - it follows the OS preference
export const systemTheme: ThemeId = "system";

// Manual system theme for display in selector (not a real theme)
export const systemThemeDisplay: Theme = {
  id: "system",
  name: "System",
  nameZh: "跟随系统",
  icon: "🖥️",
  colors: {
    primary: "#0D9488",
    secondary: "#14B8A6",
    cta: "#F97316",
    bg: "#F0FDFA",
    bgCard: "#ffffff",
    bgElevated: "#ffffff",
    bgHover: "#F0FDFA",
    text: "#134E4A",
    textMuted: "#64748B",
    textInverse: "#ffffff",
    border: "#CCFBF1",
    borderLight: "#E2E8F0",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    shadowCard: "0 1px 3px rgba(0, 0, 0, 0.1)",
    shadowElevated: "0 4px 12px rgba(0, 0, 0, 0.15)",
    accent: "#0D9488",
  },
};

// Extended theme list including system for display
export const themeListWithSystem = [...themeList, systemThemeDisplay];
