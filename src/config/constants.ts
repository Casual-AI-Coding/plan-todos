export const STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: "sidebar-collapsed",
  THEME: "plan-todos-theme",
  FONT_SIZE: "plan-todos-font-size",
  LIST_DENSITY: "list-density-settings",
} as const;

export const LAYOUT = {
  SIDEBAR_WIDTH_EXPANDED: "13rem",
  SIDEBAR_WIDTH_COLLAPSED: "4rem",
  TITLE_BAR_HEIGHT: "3.5rem",
  BOTTOM_NAV_HEIGHT: "3.5rem",
  MOBILE_HEADER_HEIGHT: "3.5rem",
  MOBILE_HEADER_CALC: "calc(3.5rem + env(safe-area-inset-top))",
  MOBILE_FOOTER_CALC: "calc(3.5rem + env(safe-area-inset-bottom))",
} as const;

export const PRIORITY_ORDER: Record<string, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
} as const;

export const FONT_SIZE = {
  MIN: 12,
  MAX: 24,
} as const;
