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
  // Light themes
  | "pastel"
  | "mint"
  | "lavender"
  | "ocean"
  | "rose"
  | "ayuLight"
  | "githubLight"
  // Dark themes
  | "midnight"
  | "purple"
  | "forest"
  | "coffee"
  | "sunset"
  | "nightOwl"
  | "cobalt2"
  | "ayuMirage"
  // Style themes
  | "blackMyth"
  | "cyberpunk"
  | "halloween"
  | "christmas"
  | "handwritten"
  | "cottagecore"
  | "vaporwave"
  | "darkAcademia"
  | "kawaii"
  | "retro90s"
  // Custom theme
  | "custom"
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
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    glow: string;
  };

  // Glass effects
  glass: {
    borderGlow: string;
    innerShadow: string;
  };

  // Special
  accent: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  nameZh: string;
  icon: string;
  type: "light" | "dark" | "system";
  colors: ThemeColors;
}

export const themes: Omit<Record<ThemeId, Theme>, "system"> = {
  // ==================== Light Themes ====================
  light: {
    id: "light",
    name: "Light",
    nameZh: "浅色",
    icon: "☀️",
    type: "light",
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
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03)",
        md: "0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04)",
        lg: "0 8px 16px rgba(0,0,0,0.12), 0 16px 32px rgba(0,0,0,0.06)",
        xl: "0 12px 24px rgba(0,0,0,0.16), 0 24px 48px rgba(0,0,0,0.08)",
        glow: "0 0 20px rgba(13, 148, 136, 0.3), 0 0 40px rgba(13, 148, 136, 0.1)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.5)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
      },
      accent: "#0D9488",
    },
  },

  glass: {
    id: "glass",
    name: "Warm",
    nameZh: "暖色",
    icon: "☀️",
    type: "light",
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
      shadows: {
        sm: "0 1px 2px rgba(120, 53, 15, 0.08), 0 2px 4px rgba(120, 53, 15, 0.05)",
        md: "0 4px 8px rgba(120, 53, 15, 0.12), 0 8px 16px rgba(120, 53, 15, 0.06)",
        lg: "0 8px 16px rgba(120, 53, 15, 0.16), 0 16px 32px rgba(120, 53, 15, 0.08)",
        xl: "0 12px 24px rgba(120, 53, 15, 0.2), 0 24px 48px rgba(120, 53, 15, 0.1)",
        glow: "0 0 20px rgba(245, 158, 11, 0.3), 0 0 40px rgba(245, 158, 11, 0.15)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.5)",
        innerShadow: "inset 0 1px 2px rgba(120, 53, 15, 0.08)",
      },
      accent: "#F59E0B",
    },
  },

  spring: {
    id: "spring",
    name: "Spring",
    nameZh: "春节",
    icon: "🧧",
    type: "light",
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
      shadows: {
        sm: "0 1px 2px rgba(220, 38, 38, 0.08), 0 2px 4px rgba(220, 38, 38, 0.05)",
        md: "0 4px 8px rgba(220, 38, 38, 0.12), 0 8px 16px rgba(220, 38, 38, 0.06)",
        lg: "0 8px 16px rgba(220, 38, 38, 0.16), 0 16px 32px rgba(220, 38, 38, 0.08)",
        xl: "0 12px 24px rgba(220, 38, 38, 0.2), 0 24px 48px rgba(220, 38, 38, 0.1)",
        glow: "0 0 20px rgba(220, 38, 38, 0.4), 0 0 40px rgba(220, 38, 38, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.5)",
        innerShadow: "inset 0 1px 2px rgba(220, 38, 38, 0.08)",
      },
      accent: "#DC2626",
    },
  },

  // Pastel Theme - 柔和粉色主题
  pastel: {
    id: "pastel",
    name: "Pastel",
    nameZh: "粉色",
    icon: "🌸",
    type: "light",
    colors: {
      primary: "#EC4899",
      secondary: "#F472B6",
      cta: "#F9A8D4",
      bg: "#FDF2F8",
      bgCard: "#FFFFFF",
      bgElevated: "#FCE7F3",
      bgHover: "#FBCFE8",
      text: "#831843",
      textMuted: "#9D174D",
      textInverse: "#FFFFFF",
      border: "#FBCFE8",
      borderLight: "#FCE7F3",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      shadows: {
        sm: "0 1px 2px rgba(131, 24, 67, 0.06), 0 2px 4px rgba(131, 24, 67, 0.04)",
        md: "0 4px 8px rgba(131, 24, 67, 0.08), 0 8px 16px rgba(131, 24, 67, 0.05)",
        lg: "0 8px 16px rgba(131, 24, 67, 0.1), 0 16px 32px rgba(131, 24, 67, 0.06)",
        xl: "0 12px 24px rgba(131, 24, 67, 0.12), 0 24px 48px rgba(131, 24, 67, 0.08)",
        glow: "0 0 20px rgba(236, 72, 153, 0.25), 0 0 40px rgba(236, 72, 153, 0.12)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        innerShadow: "inset 0 1px 2px rgba(131, 24, 67, 0.05)",
      },
      accent: "#EC4899",
    },
  },

  // Mint Theme - 薄荷绿主题
  mint: {
    id: "mint",
    name: "Mint",
    nameZh: "薄荷",
    icon: "🌿",
    type: "light",
    colors: {
      primary: "#10B981",
      secondary: "#34D399",
      cta: "#6EE7B7",
      bg: "#ECFDF5",
      bgCard: "#FFFFFF",
      bgElevated: "#D1FAE5",
      bgHover: "#A7F3D0",
      text: "#064E3B",
      textMuted: "#047857",
      textInverse: "#FFFFFF",
      border: "#A7F3D0",
      borderLight: "#D1FAE5",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      shadows: {
        sm: "0 1px 2px rgba(6, 78, 59, 0.06), 0 2px 4px rgba(6, 78, 59, 0.04)",
        md: "0 4px 8px rgba(6, 78, 59, 0.08), 0 8px 16px rgba(6, 78, 59, 0.05)",
        lg: "0 8px 16px rgba(6, 78, 59, 0.1), 0 16px 32px rgba(6, 78, 59, 0.06)",
        xl: "0 12px 24px rgba(6, 78, 59, 0.12), 0 24px 48px rgba(6, 78, 59, 0.08)",
        glow: "0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.15)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        innerShadow: "inset 0 1px 2px rgba(6, 78, 59, 0.05)",
      },
      accent: "#10B981",
    },
  },

  // Lavender Theme - 薰衣草紫主题
  lavender: {
    id: "lavender",
    name: "Lavender",
    nameZh: "薰衣草",
    icon: "💜",
    type: "light",
    colors: {
      primary: "#8B5CF6",
      secondary: "#A78BFA",
      cta: "#C4B5FD",
      bg: "#F5F3FF",
      bgCard: "#FFFFFF",
      bgElevated: "#EDE9FE",
      bgHover: "#DDD6FE",
      text: "#4C1D95",
      textMuted: "#5B21B6",
      textInverse: "#FFFFFF",
      border: "#DDD6FE",
      borderLight: "#EDE9FE",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      shadows: {
        sm: "0 1px 2px rgba(76, 29, 149, 0.06), 0 2px 4px rgba(76, 29, 149, 0.04)",
        md: "0 4px 8px rgba(76, 29, 149, 0.08), 0 8px 16px rgba(76, 29, 149, 0.05)",
        lg: "0 8px 16px rgba(76, 29, 149, 0.1), 0 16px 32px rgba(76, 29, 149, 0.06)",
        xl: "0 12px 24px rgba(76, 29, 149, 0.12), 0 24px 48px rgba(76, 29, 149, 0.08)",
        glow: "0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.15)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        innerShadow: "inset 0 1px 2px rgba(76, 29, 149, 0.05)",
      },
      accent: "#8B5CF6",
    },
  },

  // Ocean Theme - 海洋蓝主题
  ocean: {
    id: "ocean",
    name: "Ocean",
    nameZh: "海洋",
    icon: "🌊",
    type: "light",
    colors: {
      primary: "#0EA5E9",
      secondary: "#38BDF8",
      cta: "#7DD3FC",
      bg: "#F0F9FF",
      bgCard: "#FFFFFF",
      bgElevated: "#E0F2FE",
      bgHover: "#BAE6FD",
      text: "#0C4A6E",
      textMuted: "#0369A1",
      textInverse: "#FFFFFF",
      border: "#BAE6FD",
      borderLight: "#E0F2FE",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      shadows: {
        sm: "0 1px 2px rgba(12, 74, 110, 0.06), 0 2px 4px rgba(12, 74, 110, 0.04)",
        md: "0 4px 8px rgba(12, 74, 110, 0.08), 0 8px 16px rgba(12, 74, 110, 0.05)",
        lg: "0 8px 16px rgba(12, 74, 110, 0.1), 0 16px 32px rgba(12, 74, 110, 0.06)",
        xl: "0 12px 24px rgba(12, 74, 110, 0.12), 0 24px 48px rgba(12, 74, 110, 0.08)",
        glow: "0 0 20px rgba(14, 165, 233, 0.3), 0 0 40px rgba(14, 165, 233, 0.15)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        innerShadow: "inset 0 1px 2px rgba(12, 74, 110, 0.05)",
      },
      accent: "#0EA5E9",
    },
  },

  // Rose Theme - 玫瑰主题
  rose: {
    id: "rose",
    name: "Rose",
    nameZh: "玫瑰",
    icon: "🌹",
    type: "light",
    colors: {
      primary: "#F43F5E",
      secondary: "#FB7185",
      cta: "#FDA4AF",
      bg: "#FFF1F2",
      bgCard: "#FFFFFF",
      bgElevated: "#FFE4E6",
      bgHover: "#FECDD3",
      text: "#881337",
      textMuted: "#9F1239",
      textInverse: "#FFFFFF",
      border: "#FECDD3",
      borderLight: "#FFE4E6",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      shadows: {
        sm: "0 1px 2px rgba(136, 19, 55, 0.06), 0 2px 4px rgba(136, 19, 55, 0.04)",
        md: "0 4px 8px rgba(136, 19, 55, 0.08), 0 8px 16px rgba(136, 19, 55, 0.05)",
        lg: "0 8px 16px rgba(136, 19, 55, 0.1), 0 16px 32px rgba(136, 19, 55, 0.06)",
        xl: "0 12px 24px rgba(136, 19, 55, 0.12), 0 24px 48px rgba(136, 19, 55, 0.08)",
        glow: "0 0 20px rgba(244, 63, 94, 0.3), 0 0 40px rgba(244, 63, 94, 0.15)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        innerShadow: "inset 0 1px 2px rgba(136, 19, 55, 0.05)",
      },
      accent: "#F43F5E",
    },
  },

  // Ayu Light Theme - VS Code Ayu Light
  ayuLight: {
    id: "ayuLight",
    name: "Ayu Light",
    nameZh: "Ayu浅色",
    icon: "🌅",
    type: "light",
    colors: {
      primary: "#FF8E3C",
      secondary: "#86B300",
      cta: "#FF8E3C",
      bg: "#FAFAFA",
      bgCard: "#FFFFFF",
      bgElevated: "#F0F0F0",
      bgHover: "#E8E8E8",
      text: "#5C6773",
      textMuted: "#8C95A0",
      textInverse: "#FFFFFF",
      border: "#E6E6E6",
      borderLight: "#F0F0F0",
      success: "#86B300",
      warning: "#F2AE00",
      error: "#FF3333",
      shadows: {
        sm: "0 1px 2px rgba(92, 103, 115, 0.06), 0 2px 4px rgba(92, 103, 115, 0.04)",
        md: "0 4px 8px rgba(92, 103, 115, 0.08), 0 8px 16px rgba(92, 103, 115, 0.05)",
        lg: "0 8px 16px rgba(92, 103, 115, 0.1), 0 16px 32px rgba(92, 103, 115, 0.06)",
        xl: "0 12px 24px rgba(92, 103, 115, 0.12), 0 24px 48px rgba(92, 103, 115, 0.08)",
        glow: "0 0 20px rgba(255, 142, 60, 0.3), 0 0 40px rgba(255, 142, 60, 0.15)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        innerShadow: "inset 0 1px 2px rgba(92, 103, 115, 0.05)",
      },
      accent: "#FF8E3C",
    },
  },

  // GitHub Light Theme - VS Code GitHub Light
  githubLight: {
    id: "githubLight",
    name: "GitHub Light",
    nameZh: "GitHub浅色",
    icon: "🐙",
    type: "light",
    colors: {
      primary: "#0969DA",
      secondary: "#218BFF",
      cta: "#0969DA",
      bg: "#FFFFFF",
      bgCard: "#F6F8FA",
      bgElevated: "#EEF1F4",
      bgHover: "#E5E8EB",
      text: "#1F2328",
      textMuted: "#656D76",
      textInverse: "#FFFFFF",
      border: "#D0D7DE",
      borderLight: "#E1E4E8",
      success: "#1A7F37",
      warning: "#9A6700",
      error: "#CF222E",
      shadows: {
        sm: "0 1px 2px rgba(31, 35, 40, 0.04), 0 2px 4px rgba(31, 35, 40, 0.02)",
        md: "0 4px 8px rgba(31, 35, 40, 0.06), 0 8px 16px rgba(31, 35, 40, 0.03)",
        lg: "0 8px 16px rgba(31, 35, 40, 0.08), 0 16px 32px rgba(31, 35, 40, 0.04)",
        xl: "0 12px 24px rgba(31, 35, 40, 0.1), 0 24px 48px rgba(31, 35, 40, 0.06)",
        glow: "0 0 20px rgba(9, 105, 218, 0.3), 0 0 40px rgba(9, 105, 218, 0.15)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        innerShadow: "inset 0 1px 2px rgba(31, 35, 40, 0.03)",
      },
      accent: "#0969DA",
    },
  },

  // ==================== Dark Themes ====================
  dark: {
    id: "dark",
    name: "Dark",
    nameZh: "深色",
    icon: "🌙",
    type: "dark",
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
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
        md: "0 4px 8px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.3)",
        lg: "0 8px 16px rgba(0,0,0,0.5), 0 16px 32px rgba(0,0,0,0.4)",
        xl: "0 12px 24px rgba(0,0,0,0.6), 0 24px 48px rgba(0,0,0,0.5)",
        glow: "0 0 20px rgba(45, 212, 191, 0.4), 0 0 40px rgba(45, 212, 191, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
      },
      accent: "#14B8A6",
    },
  },

  dracula: {
    id: "dracula",
    name: "Dracula",
    nameZh: "德古拉",
    icon: "🧛",
    type: "dark",
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
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
        md: "0 4px 8px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.3)",
        lg: "0 8px 16px rgba(0,0,0,0.5), 0 16px 32px rgba(0,0,0,0.4)",
        xl: "0 12px 24px rgba(0,0,0,0.6), 0 24px 48px rgba(0,0,0,0.5)",
        glow: "0 0 20px rgba(189, 147, 249, 0.4), 0 0 40px rgba(189, 147, 249, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
      },
      accent: "#BD93F9",
    },
  },

  nord: {
    id: "nord",
    name: "Nord",
    nameZh: "北欧",
    icon: "❄️",
    type: "dark",
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
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
        md: "0 4px 8px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.3)",
        lg: "0 8px 16px rgba(0,0,0,0.5), 0 16px 32px rgba(0,0,0,0.4)",
        xl: "0 12px 24px rgba(0,0,0,0.6), 0 24px 48px rgba(0,0,0,0.5)",
        glow: "0 0 20px rgba(136, 192, 208, 0.4), 0 0 40px rgba(136, 192, 208, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
      },
      accent: "#88C0D0",
    },
  },

  monokai: {
    id: "monokai",
    name: "Monokai",
    nameZh: "单色",
    icon: "🎨",
    type: "dark",
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
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
        md: "0 4px 8px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.3)",
        lg: "0 8px 16px rgba(0,0,0,0.5), 0 16px 32px rgba(0,0,0,0.4)",
        xl: "0 12px 24px rgba(0,0,0,0.6), 0 24px 48px rgba(0,0,0,0.5)",
        glow: "0 0 20px rgba(249, 38, 114, 0.4), 0 0 40px rgba(249, 38, 114, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
      },
      accent: "#F92672",
    },
  },

  catppuccin: {
    id: "catppuccin",
    name: "Catppuccin",
    nameZh: "猫咪",
    icon: "🐱",
    type: "dark",
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
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
        md: "0 4px 8px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.3)",
        lg: "0 8px 16px rgba(0,0,0,0.5), 0 16px 32px rgba(0,0,0,0.4)",
        xl: "0 12px 24px rgba(0,0,0,0.6), 0 24px 48px rgba(0,0,0,0.5)",
        glow: "0 0 20px rgba(203, 166, 247, 0.4), 0 0 40px rgba(203, 166, 247, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
      },
      accent: "#cba6f7",
    },
  },

  tokyoNight: {
    id: "tokyoNight",
    name: "Tokyo Night",
    nameZh: "东京夜",
    icon: "🌃",
    type: "dark",
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
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
        md: "0 4px 8px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.3)",
        lg: "0 8px 16px rgba(0,0,0,0.5), 0 16px 32px rgba(0,0,0,0.4)",
        xl: "0 12px 24px rgba(0,0,0,0.6), 0 24px 48px rgba(0,0,0,0.5)",
        glow: "0 0 20px rgba(122, 162, 247, 0.4), 0 0 40px rgba(122, 162, 247, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
      },
      accent: "#7aa2f7",
    },
  },

  oneDark: {
    id: "oneDark",
    name: "One Dark",
    nameZh: "暗色一",
    icon: "🎨",
    type: "dark",
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
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
        md: "0 4px 8px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.3)",
        lg: "0 8px 16px rgba(0,0,0,0.5), 0 16px 32px rgba(0,0,0,0.4)",
        xl: "0 12px 24px rgba(0,0,0,0.6), 0 24px 48px rgba(0,0,0,0.5)",
        glow: "0 0 20px rgba(198, 120, 221, 0.4), 0 0 40px rgba(198, 120, 221, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
      },
      accent: "#c678dd",
    },
  },

  // Midnight Theme - 午夜蓝主题
  midnight: {
    id: "midnight",
    name: "Midnight",
    nameZh: "午夜",
    icon: "🌙",
    type: "dark",
    colors: {
      primary: "#3B82F6",
      secondary: "#60A5FA",
      cta: "#93C5FD",
      bg: "#0F172A",
      bgCard: "#1E293B",
      bgElevated: "#334155",
      bgHover: "#1E293B",
      text: "#E2E8F0",
      textMuted: "#94A3B8",
      textInverse: "#0F172A",
      border: "#334155",
      borderLight: "#475569",
      success: "#4ADE80",
      warning: "#FBBF24",
      error: "#F87171",
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
        md: "0 4px 8px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.4)",
        lg: "0 8px 16px rgba(0,0,0,0.6), 0 16px 32px rgba(0,0,0,0.5)",
        xl: "0 12px 24px rgba(0,0,0,0.7), 0 24px 48px rgba(0,0,0,0.6)",
        glow: "0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
      },
      accent: "#3B82F6",
    },
  },

  // Purple Theme - 紫色主题
  purple: {
    id: "purple",
    name: "Purple",
    nameZh: "紫色",
    icon: "🔮",
    type: "dark",
    colors: {
      primary: "#A855F7",
      secondary: "#C084FC",
      cta: "#E879F9",
      bg: "#1E1B2E",
      bgCard: "#2D2A45",
      bgElevated: "#3D3A5C",
      bgHover: "#2D2A45",
      text: "#E9E4F0",
      textMuted: "#A8A0BC",
      textInverse: "#1E1B2E",
      border: "#3D3A5C",
      borderLight: "#4D4A6C",
      success: "#4ADE80",
      warning: "#FBBF24",
      error: "#F87171",
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
        md: "0 4px 8px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.4)",
        lg: "0 8px 16px rgba(0,0,0,0.6), 0 16px 32px rgba(0,0,0,0.5)",
        xl: "0 12px 24px rgba(0,0,0,0.7), 0 24px 48px rgba(0,0,0,0.6)",
        glow: "0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
      },
      accent: "#A855F7",
    },
  },

  // Forest Theme - 森林绿主题
  forest: {
    id: "forest",
    name: "Forest",
    nameZh: "森林",
    icon: "🌲",
    type: "dark",
    colors: {
      primary: "#22C55E",
      secondary: "#4ADE80",
      cta: "#86EFAC",
      bg: "#14241F",
      bgCard: "#1C3129",
      bgElevated: "#253D34",
      bgHover: "#1C3129",
      text: "#E0F2E9",
      textMuted: "#94B8A6",
      textInverse: "#14241F",
      border: "#253D34",
      borderLight: "#344D42",
      success: "#22C55E",
      warning: "#FBBF24",
      error: "#F87171",
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
        md: "0 4px 8px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.4)",
        lg: "0 8px 16px rgba(0,0,0,0.6), 0 16px 32px rgba(0,0,0,0.5)",
        xl: "0 12px 24px rgba(0,0,0,0.7), 0 24px 48px rgba(0,0,0,0.6)",
        glow: "0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
      },
      accent: "#22C55E",
    },
  },

  // Coffee Theme - 咖啡主题
  coffee: {
    id: "coffee",
    name: "Coffee",
    nameZh: "咖啡",
    icon: "☕",
    type: "dark",
    colors: {
      primary: "#D97706",
      secondary: "#F59E0B",
      cta: "#FBBF24",
      bg: "#1C1612",
      bgCard: "#2A2118",
      bgElevated: "#382C1E",
      bgHover: "#2A2118",
      text: "#F5E6D3",
      textMuted: "#C4A88C",
      textInverse: "#1C1612",
      border: "#382C1E",
      borderLight: "#463824",
      success: "#4ADE80",
      warning: "#FBBF24",
      error: "#F87171",
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
        md: "0 4px 8px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.4)",
        lg: "0 8px 16px rgba(0,0,0,0.6), 0 16px 32px rgba(0,0,0,0.5)",
        xl: "0 12px 24px rgba(0,0,0,0.7), 0 24px 48px rgba(0,0,0,0.6)",
        glow: "0 0 20px rgba(217, 119, 6, 0.4), 0 0 40px rgba(217, 119, 6, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
      },
      accent: "#D97706",
    },
  },

  // Sunset Theme - 日落主题
  sunset: {
    id: "sunset",
    name: "Sunset",
    nameZh: "日落",
    icon: "🌅",
    type: "dark",
    colors: {
      primary: "#F97316",
      secondary: "#FB923C",
      cta: "#FDBA74",
      bg: "#1F1410",
      bgCard: "#2E1F15",
      bgElevated: "#3D291A",
      bgHover: "#2E1F15",
      text: "#FDEEE5",
      textMuted: "#D4A88C",
      textInverse: "#1F1410",
      border: "#3D291A",
      borderLight: "#4C3320",
      success: "#4ADE80",
      warning: "#FBBF24",
      error: "#F87171",
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
        md: "0 4px 8px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.4)",
        lg: "0 8px 16px rgba(0,0,0,0.6), 0 16px 32px rgba(0,0,0,0.5)",
        xl: "0 12px 24px rgba(0,0,0,0.7), 0 24px 48px rgba(0,0,0,0.6)",
        glow: "0 0 20px rgba(249, 115, 22, 0.4), 0 0 40px rgba(249, 115, 22, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
      },
      accent: "#F97316",
    },
  },

  // Night Owl Theme - VS Code Night Owl
  nightOwl: {
    id: "nightOwl",
    name: "Night Owl",
    nameZh: "夜猫子",
    icon: "🦉",
    type: "dark",
    colors: {
      primary: "#C792EA",
      secondary: "#82AAFF",
      cta: "#F78C6C",
      bg: "#011627",
      bgCard: "#0B2942",
      bgElevated: "#1D3B53",
      bgHover: "#234E6E",
      text: "#D6DEEB",
      textMuted: "#637777",
      textInverse: "#011627",
      border: "#1D3B53",
      borderLight: "#2F4B66",
      success: "#C3E88D",
      warning: "#FFCB8B",
      error: "#FF5370",
      shadows: {
        sm: "0 1px 2px rgba(1, 22, 39, 0.5), 0 2px 4px rgba(1, 22, 39, 0.3)",
        md: "0 4px 8px rgba(1, 22, 39, 0.6), 0 8px 16px rgba(1, 22, 39, 0.4)",
        lg: "0 8px 16px rgba(1, 22, 39, 0.7), 0 16px 32px rgba(1, 22, 39, 0.5)",
        xl: "0 12px 24px rgba(1, 22, 39, 0.8), 0 24px 48px rgba(1, 22, 39, 0.6)",
        glow: "0 0 20px rgba(199, 146, 234, 0.4), 0 0 40px rgba(199, 146, 234, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        innerShadow: "inset 0 1px 2px rgba(1, 22, 39, 0.5)",
      },
      accent: "#C792EA",
    },
  },

  // Cobalt2 Theme - VS Code Cobalt2
  cobalt2: {
    id: "cobalt2",
    name: "Cobalt2",
    nameZh: "钴蓝",
    icon: "💎",
    type: "dark",
    colors: {
      primary: "#FFC600",
      secondary: "#FF9D00",
      cta: "#FF628C",
      bg: "#193549",
      bgCard: "#1B3B52",
      bgElevated: "#234E6E",
      bgHover: "#2C5F82",
      text: "#FFFFFF",
      textMuted: "#A8B4C0",
      textInverse: "#193549",
      border: "#234E6E",
      borderLight: "#2C5F82",
      success: "#3AD900",
      warning: "#FF9D00",
      error: "#FF628C",
      shadows: {
        sm: "0 1px 2px rgba(25, 53, 73, 0.5), 0 2px 4px rgba(25, 53, 73, 0.3)",
        md: "0 4px 8px rgba(25, 53, 73, 0.6), 0 8px 16px rgba(25, 53, 73, 0.4)",
        lg: "0 8px 16px rgba(25, 53, 73, 0.7), 0 16px 32px rgba(25, 53, 73, 0.5)",
        xl: "0 12px 24px rgba(25, 53, 73, 0.8), 0 24px 48px rgba(25, 53, 73, 0.6)",
        glow: "0 0 20px rgba(255, 198, 0, 0.4), 0 0 40px rgba(255, 198, 0, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(25, 53, 73, 0.5)",
      },
      accent: "#FFC600",
    },
  },

  // Ayu Mirage Theme - VS Code Ayu Mirage
  ayuMirage: {
    id: "ayuMirage",
    name: "Ayu Mirage",
    nameZh: "Ayu幻影",
    icon: "🌆",
    type: "dark",
    colors: {
      primary: "#FFCC66",
      secondary: "#73D0FF",
      cta: "#FFCC66",
      bg: "#1F2430",
      bgCard: "#2A2F3A",
      bgElevated: "#343A45",
      bgHover: "#3E4450",
      text: "#CCCAC2",
      textMuted: "#707A8C",
      textInverse: "#1F2430",
      border: "#343A45",
      borderLight: "#3E4450",
      success: "#A6CC70",
      warning: "#FFCC66",
      error: "#F28779",
      shadows: {
        sm: "0 1px 2px rgba(31, 36, 48, 0.5), 0 2px 4px rgba(31, 36, 48, 0.3)",
        md: "0 4px 8px rgba(31, 36, 48, 0.6), 0 8px 16px rgba(31, 36, 48, 0.4)",
        lg: "0 8px 16px rgba(31, 36, 48, 0.7), 0 16px 32px rgba(31, 36, 48, 0.5)",
        xl: "0 12px 24px rgba(31, 36, 48, 0.8), 0 24px 48px rgba(31, 36, 48, 0.6)",
        glow: "0 0 20px rgba(255, 204, 102, 0.4), 0 0 40px rgba(255, 204, 102, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        innerShadow: "inset 0 1px 2px rgba(31, 36, 48, 0.5)",
      },
      accent: "#FFCC66",
    },
  },

  // ==================== Style Themes ====================
  // Black Myth Theme - 中国神话风
  blackMyth: {
    id: "blackMyth",
    name: "Black Myth",
    nameZh: "黑神话",
    icon: "🔱",
    type: "dark",
    colors: {
      primary: "#FFD700",
      secondary: "#DC2626",
      cta: "#50C878",
      bg: "#1a1a2e",
      bgCard: "#16213e",
      bgElevated: "#1f2b47",
      bgHover: "#1f2b47",
      text: "#E8E8E8",
      textMuted: "#A0A0A0",
      textInverse: "#1a1a2e",
      border: "#2a2a4a",
      borderLight: "#3a3a5a",
      success: "#50C878",
      warning: "#FFD700",
      error: "#DC2626",
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
        md: "0 4px 8px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.4)",
        lg: "0 8px 16px rgba(0,0,0,0.6), 0 16px 32px rgba(0,0,0,0.5)",
        xl: "0 12px 24px rgba(0,0,0,0.7), 0 24px 48px rgba(0,0,0,0.6)",
        glow: "0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
      },
      accent: "#50C878",
    },
  },

  // Cyberpunk Theme - 赛博朋克
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    nameZh: "赛博朋克",
    icon: "🤖",
    type: "dark",
    colors: {
      primary: "#00F0FF",
      secondary: "#FF00FF",
      cta: "#9D00FF",
      bg: "#0a0a0f",
      bgCard: "#12121a",
      bgElevated: "#1a1a25",
      bgHover: "#1a1a25",
      text: "#E0E0E0",
      textMuted: "#8888AA",
      textInverse: "#0a0a0f",
      border: "#2a2a3a",
      borderLight: "#3a3a4a",
      success: "#00FF6B",
      warning: "#FFD700",
      error: "#FF0055",
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)",
        md: "0 4px 8px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.5)",
        lg: "0 8px 16px rgba(0,0,0,0.7), 0 16px 32px rgba(0,0,0,0.6)",
        xl: "0 12px 24px rgba(0,0,0,0.8), 0 24px 48px rgba(0,0,0,0.7)",
        glow: "0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(0,240,255,0.2)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
      },
      accent: "#9D00FF",
    },
  },

  // Halloween Theme - 万圣节
  halloween: {
    id: "halloween",
    name: "Halloween",
    nameZh: "万圣节",
    icon: "🎃",
    type: "dark",
    colors: {
      primary: "#FF6B00",
      secondary: "#6B00FF",
      cta: "#00FF6B",
      bg: "#1a0f0a",
      bgCard: "#251810",
      bgElevated: "#302015",
      bgHover: "#302015",
      text: "#F5E6D3",
      textMuted: "#B8A090",
      textInverse: "#1a0f0a",
      border: "#3a2520",
      borderLight: "#4a3530",
      success: "#00FF6B",
      warning: "#FF6B00",
      error: "#FF0040",
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)",
        md: "0 4px 8px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.5)",
        lg: "0 8px 16px rgba(0,0,0,0.7), 0 16px 32px rgba(0,0,0,0.6)",
        xl: "0 12px 24px rgba(0,0,0,0.8), 0 24px 48px rgba(0,0,0,0.7)",
        glow: "0 0 20px rgba(255, 107, 0, 0.5), 0 0 40px rgba(255, 107, 0, 0.3)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
      },
      accent: "#00FF6B",
    },
  },

  // Christmas Theme - 圣诞节 (Light)
  christmas: {
    id: "christmas",
    name: "Christmas",
    nameZh: "圣诞节",
    icon: "🎄",
    type: "light",
    colors: {
      primary: "#C41E3A",
      secondary: "#228B22",
      cta: "#FFD700",
      bg: "#f8faf8",
      bgCard: "#ffffff",
      bgElevated: "#f0f5f0",
      bgHover: "#e8f0e8",
      text: "#2d2d2d",
      textMuted: "#666666",
      textInverse: "#ffffff",
      border: "#d0e0d0",
      borderLight: "#e0f0e0",
      success: "#228B22",
      warning: "#FFD700",
      error: "#C41E3A",
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03)",
        md: "0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04)",
        lg: "0 8px 16px rgba(0,0,0,0.12), 0 16px 32px rgba(0,0,0,0.06)",
        xl: "0 12px 24px rgba(0,0,0,0.16), 0 24px 48px rgba(0,0,0,0.08)",
        glow: "0 0 20px rgba(196, 30, 58, 0.3), 0 0 40px rgba(196, 30, 58, 0.15)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.5)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
      },
      accent: "#FFD700",
    },
  },

  // Handwritten Theme - 手账风 (Light)
  handwritten: {
    id: "handwritten",
    name: "Handwritten",
    nameZh: "手账风",
    icon: "📝",
    type: "light",
    colors: {
      primary: "#8B4513",
      secondary: "#D2691E",
      cta: "#FFB6C1",
      bg: "#FAF0E6",
      bgCard: "#FFFAF5",
      bgElevated: "#F5EDE5",
      bgHover: "#F0E8E0",
      text: "#4A3728",
      textMuted: "#8B7355",
      textInverse: "#FAF0E6",
      border: "#E8D8C8",
      borderLight: "#F0E0D0",
      success: "#6B8E23",
      warning: "#D2691E",
      error: "#CD5C5C",
      shadows: {
        sm: "0 1px 2px rgba(74, 55, 40, 0.06), 0 2px 4px rgba(74, 55, 40, 0.04)",
        md: "0 4px 8px rgba(74, 55, 40, 0.08), 0 8px 16px rgba(74, 55, 40, 0.05)",
        lg: "0 8px 16px rgba(74, 55, 40, 0.1), 0 16px 32px rgba(74, 55, 40, 0.06)",
        xl: "0 12px 24px rgba(74, 55, 40, 0.12), 0 24px 48px rgba(74, 55, 40, 0.08)",
        glow: "0 0 20px rgba(139, 69, 19, 0.3), 0 0 40px rgba(139, 69, 19, 0.15)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        innerShadow: "inset 0 1px 2px rgba(74, 55, 40, 0.05)",
      },
      accent: "#FFB6C1",
    },
  },

  // Cottagecore Theme - 田园风 (Light)
  cottagecore: {
    id: "cottagecore",
    name: "Cottagecore",
    nameZh: "田园风",
    icon: "🌻",
    type: "light",
    colors: {
      primary: "#8FBC8F",
      secondary: "#F5DEB3",
      cta: "#FFB6C1",
      bg: "#FDF5E6",
      bgCard: "#FFFEF8",
      bgElevated: "#F8F0E0",
      bgHover: "#F0E8D8",
      text: "#3D3D3D",
      textMuted: "#7A7A6A",
      textInverse: "#FDF5E6",
      border: "#D8C8A8",
      borderLight: "#E8D8B8",
      success: "#8FBC8F",
      warning: "#DEB887",
      error: "#CD853F",
      shadows: {
        sm: "0 1px 2px rgba(61, 61, 61, 0.05), 0 2px 4px rgba(61, 61, 61, 0.03)",
        md: "0 4px 8px rgba(61, 61, 61, 0.08), 0 8px 16px rgba(61, 61, 61, 0.04)",
        lg: "0 8px 16px rgba(61, 61, 61, 0.1), 0 16px 32px rgba(61, 61, 61, 0.06)",
        xl: "0 12px 24px rgba(61, 61, 61, 0.12), 0 24px 48px rgba(61, 61, 61, 0.08)",
        glow: "0 0 20px rgba(143, 188, 143, 0.3), 0 0 40px rgba(143, 188, 143, 0.15)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        innerShadow: "inset 0 1px 2px rgba(61, 61, 61, 0.05)",
      },
      accent: "#FFB6C1",
    },
  },

  // Vaporwave Theme - 蒸汽波
  vaporwave: {
    id: "vaporwave",
    name: "Vaporwave",
    nameZh: "蒸汽波",
    icon: "💜",
    type: "dark",
    colors: {
      primary: "#FF71CE",
      secondary: "#B967FF",
      cta: "#00F0FF",
      bg: "#1a0a1a",
      bgCard: "#251525",
      bgElevated: "#302030",
      bgHover: "#302030",
      text: "#F0E6F6",
      textMuted: "#B0A0C0",
      textInverse: "#1a0a1a",
      border: "#3a2540",
      borderLight: "#4a3550",
      success: "#00F0FF",
      warning: "#FF71CE",
      error: "#FF0080",
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)",
        md: "0 4px 8px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.5)",
        lg: "0 8px 16px rgba(0,0,0,0.7), 0 16px 32px rgba(0,0,0,0.6)",
        xl: "0 12px 24px rgba(0,0,0,0.8), 0 24px 48px rgba(0,0,0,0.7)",
        glow: "0 0 20px rgba(255, 113, 206, 0.5), 0 0 40px rgba(185, 103, 255, 0.3)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,113,206,0.2)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
      },
      accent: "#00F0FF",
    },
  },

  // Dark Academia Theme - 暗黑学院
  darkAcademia: {
    id: "darkAcademia",
    name: "Dark Academia",
    nameZh: "暗黑学院",
    icon: "📚",
    type: "dark",
    colors: {
      primary: "#C19A6B",
      secondary: "#722F37",
      cta: "#2F4F4F",
      bg: "#2C1810",
      bgCard: "#3A2218",
      bgElevated: "#482A1E",
      bgHover: "#482A1E",
      text: "#FFFFF0",
      textMuted: "#C8B8A0",
      textInverse: "#2C1810",
      border: "#4A3020",
      borderLight: "#5A3828",
      success: "#6B8E6B",
      warning: "#C19A6B",
      error: "#8B0000",
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)",
        md: "0 4px 8px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.5)",
        lg: "0 8px 16px rgba(0,0,0,0.7), 0 16px 32px rgba(0,0,0,0.6)",
        xl: "0 12px 24px rgba(0,0,0,0.8), 0 24px 48px rgba(0,0,0,0.7)",
        glow: "0 0 20px rgba(193, 154, 107, 0.4), 0 0 40px rgba(193, 154, 107, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
      },
      accent: "#2F4F4F",
    },
  },

  // Kawaii Theme - 可爱风 (Light)
  kawaii: {
    id: "kawaii",
    name: "Kawaii",
    nameZh: "可爱风",
    icon: "🌸",
    type: "light",
    colors: {
      primary: "#FFB6C1",
      secondary: "#98FF98",
      cta: "#87CEEB",
      bg: "#FFF0F5",
      bgCard: "#FFFFFF",
      bgElevated: "#FFF8FA",
      bgHover: "#FFE8EE",
      text: "#4A3A40",
      textMuted: "#8A7A80",
      textInverse: "#FFF0F5",
      border: "#FFD8E8",
      borderLight: "#FFE8F0",
      success: "#98FF98",
      warning: "#FFD700",
      error: "#FF6B8A",
      shadows: {
        sm: "0 1px 2px rgba(74, 58, 64, 0.05), 0 2px 4px rgba(74, 58, 64, 0.03)",
        md: "0 4px 8px rgba(74, 58, 64, 0.08), 0 8px 16px rgba(74, 58, 64, 0.04)",
        lg: "0 8px 16px rgba(74, 58, 64, 0.1), 0 16px 32px rgba(74, 58, 64, 0.06)",
        xl: "0 12px 24px rgba(74, 58, 64, 0.12), 0 24px 48px rgba(74, 58, 64, 0.08)",
        glow: "0 0 20px rgba(255, 182, 193, 0.4), 0 0 40px rgba(255, 182, 193, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        innerShadow: "inset 0 1px 2px rgba(74, 58, 64, 0.05)",
      },
      accent: "#87CEEB",
    },
  },

  // Retro 90s Theme - 复古90s
  retro90s: {
    id: "retro90s",
    name: "Retro 90s",
    nameZh: "复古90s",
    icon: "🕹️",
    type: "dark",
    colors: {
      primary: "#BF00FF",
      secondary: "#00CED1",
      cta: "#FF69B4",
      bg: "#1a0a2e",
      bgCard: "#251540",
      bgElevated: "#301F52",
      bgHover: "#301F52",
      text: "#F0E8F8",
      textMuted: "#B0A0C0",
      textInverse: "#1a0a2e",
      border: "#3a2550",
      borderLight: "#4a3560",
      success: "#00CED1",
      warning: "#FFD700",
      error: "#FF1493",
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)",
        md: "0 4px 8px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.5)",
        lg: "0 8px 16px rgba(0,0,0,0.7), 0 16px 32px rgba(0,0,0,0.6)",
        xl: "0 12px 24px rgba(0,0,0,0.8), 0 24px 48px rgba(0,0,0,0.7)",
        glow: "0 0 20px rgba(191, 0, 255, 0.5), 0 0 40px rgba(0, 206, 209, 0.3)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(191,0,255,0.2)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
      },
      accent: "#FF69B4",
    },
  },

  // Custom Theme - 用户自定义主题
  custom: {
    id: "custom",
    name: "Custom",
    nameZh: "自定义",
    icon: "🎨",
    type: "dark",
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
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
        md: "0 4px 8px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.3)",
        lg: "0 8px 16px rgba(0,0,0,0.5), 0 16px 32px rgba(0,0,0,0.4)",
        xl: "0 12px 24px rgba(0,0,0,0.6), 0 24px 48px rgba(0,0,0,0.5)",
        glow: "0 0 20px rgba(20, 184, 166, 0.4), 0 0 40px rgba(20, 184, 166, 0.2)",
      },
      glass: {
        borderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
        innerShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
      },
      accent: "#14B8A6",
    },
  },
};

export const themeList = Object.values(themes);

/** All valid theme IDs including system - used for validation */
export const allThemeIds: ThemeId[] = [
  ...(Object.keys(themes) as ThemeId[]),
  "system",
];

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
  type: "system",
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
    shadows: {
      sm: "0 1px 2px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03)",
      md: "0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04)",
      lg: "0 8px 16px rgba(0,0,0,0.12), 0 16px 32px rgba(0,0,0,0.06)",
      xl: "0 12px 24px rgba(0,0,0,0.16), 0 24px 48px rgba(0,0,0,0.08)",
      glow: "0 0 20px rgba(13, 148, 136, 0.3), 0 0 40px rgba(13, 148, 136, 0.1)",
    },
    glass: {
      borderGlow: "inset 0 1px 0 rgba(255,255,255,0.5)",
      innerShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
    },
    accent: "#0D9488",
  },
};

// Extended theme list including system for display
export const themeListWithSystem = [...themeList, systemThemeDisplay];

// Style themes (aesthetic themes) - must be defined before filters
export const styleThemeIds: ThemeId[] = [
  "blackMyth",
  "cyberpunk",
  "halloween",
  "christmas",
  "handwritten",
  "cottagecore",
  "vaporwave",
  "darkAcademia",
  "kawaii",
  "retro90s",
];

// Theme type filters (exclude style themes and custom)
export const lightThemes = themeList.filter(
  (t) =>
    t.type === "light" && !styleThemeIds.includes(t.id) && t.id !== "custom",
);
export const darkThemes = themeList.filter(
  (t) =>
    t.type === "dark" && !styleThemeIds.includes(t.id) && t.id !== "custom",
);

export const styleThemes = themeList.filter((t) =>
  styleThemeIds.includes(t.id),
);

// Custom theme placeholder
export const customThemeDisplay: Theme = themes.custom;
