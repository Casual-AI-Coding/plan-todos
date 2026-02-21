/**
 * Theme Registry
 * 
 * Central configuration for all themes.
 * Add new themes here - no other files need modification.
 */

export type ThemeId = 'light' | 'dark' | 'dracula' | 'nord' | 'monokai' | 'glass';

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

export const themes: Record<ThemeId, Theme> = {
  light: {
    id: 'light',
    name: 'Light',
    nameZh: '浅色',
    icon: '☀️',
    colors: {
      primary: '#0D9488',
      secondary: '#14B8A6',
      cta: '#F97316',
      bg: '#F0FDFA',
      bgCard: '#ffffff',
      bgElevated: '#ffffff',
      bgHover: '#F0FDFA',
      text: '#134E4A',
      textMuted: '#64748B',
      textInverse: '#ffffff',
      border: '#CCFBF1',
      borderLight: '#E2E8F0',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      shadowCard: '0 1px 3px rgba(0, 0, 0, 0.1)',
      shadowElevated: '0 4px 12px rgba(0, 0, 0, 0.15)',
      accent: '#0D9488',
    },
  },
  
  dark: {
    id: 'dark',
    name: 'Dark',
    nameZh: '深色',
    icon: '🌙',
    colors: {
      primary: '#14B8A6',
      secondary: '#2DD4BF',
      cta: '#FB923C',
      bg: '#0F172A',
      bgCard: '#1E293B',
      bgElevated: '#334155',
      bgHover: '#1E293B',
      text: '#F1F5F9',
      textMuted: '#94A3B8',
      textInverse: '#0F172A',
      border: '#334155',
      borderLight: '#475569',
      success: '#4ADE80',
      warning: '#FBBF24',
      error: '#F87171',
      shadowCard: '0 1px 3px rgba(0, 0, 0, 0.3)',
      shadowElevated: '0 4px 12px rgba(0, 0, 0, 0.4)',
      accent: '#14B8A6',
    },
  },
  
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    nameZh: '德古拉',
    icon: '🧛',
    colors: {
      primary: '#BD93F9',
      secondary: '#FF79C6',
      cta: '#FF5555',
      bg: '#282A36',
      bgCard: '#383A59',
      bgElevated: '#44475A',
      bgHover: '#383A59',
      text: '#F8F8F2',
      textMuted: '#6272A4',
      textInverse: '#282A36',
      border: '#44475A',
      borderLight: '#6272A4',
      success: '#50FA7B',
      warning: '#F1FA8C',
      error: '#FF5555',
      shadowCard: '0 1px 3px rgba(0, 0, 0, 0.3)',
      shadowElevated: '0 4px 12px rgba(0, 0, 0, 0.4)',
      accent: '#BD93F9',
    },
  },
  
  nord: {
    id: 'nord',
    name: 'Nord',
    nameZh: '北欧',
    icon: '❄️',
    colors: {
      primary: '#88C0D0',
      secondary: '#81A1C1',
      cta: '#D08770',
      bg: '#2E3440',
      bgCard: '#3B4252',
      bgElevated: '#434C5E',
      bgHover: '#3B4252',
      text: '#ECEFF4',
      textMuted: '#D8DEE9',
      textInverse: '#2E3440',
      border: '#4C566A',
      borderLight: '#5E81AC',
      success: '#A3BE8C',
      warning: '#EBCB8B',
      error: '#BF616A',
      shadowCard: '0 1px 3px rgba(0, 0, 0, 0.3)',
      shadowElevated: '0 4px 12px rgba(0, 0, 0, 0.4)',
      accent: '#88C0D0',
    },
  },
  
  monokai: {
    id: 'monokai',
    name: 'Monokai',
    nameZh: '单色',
    icon: '🎨',
    colors: {
      primary: '#F92672',
      secondary: '#FD971F',
      cta: '#A6E22E',
      bg: '#272822',
      bgCard: '#3E3D32',
      bgElevated: '#49483E',
      bgHover: '#3E3D32',
      text: '#F8F8F2',
      textMuted: '#75715E',
      textInverse: '#272822',
      border: '#49483E',
      borderLight: '#5B5A4E',
      success: '#A6E22E',
      warning: '#E6DB74',
      error: '#F92672',
      shadowCard: '0 1px 3px rgba(0, 0, 0, 0.3)',
      shadowElevated: '0 4px 12px rgba(0, 0, 0, 0.4)',
      accent: '#F92672',
    },
  },
  
  glass: {
    id: 'glass',
    name: 'Warm',
    nameZh: '暖色',
    icon: '☀️',
    colors: {
      primary: '#F59E0B',
      secondary: '#EF4444',
      cta: '#F97316',
      bg: 'rgba(255, 248, 240, 1)',
      bgCard: 'rgba(255, 252, 245, 1)',
      bgElevated: 'rgba(255, 250, 240, 1)',
      bgHover: 'rgba(255, 245, 235, 1)',
      text: '#78350F',
      textMuted: '#92400E',
      textInverse: '#FFFFFF',
      border: '#FED7AA',
      borderLight: '#FDE68A',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      shadowCard: '0 4px 12px rgba(120, 53, 15, 0.1)',
      shadowElevated: '0 8px 24px rgba(120, 53, 15, 0.15)',
      accent: '#F59E0B',
    },
  },
};

export const themeList = Object.values(themes);

// Helper function to get theme by id
export function getTheme(id: ThemeId): Theme {
  return themes[id] || themes.light;
}

// Default theme
export const defaultTheme: ThemeId = 'light';
