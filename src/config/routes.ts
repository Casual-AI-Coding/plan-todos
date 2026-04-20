/**
 * Route and Navigation Configuration - Single source of truth.
 * Used by Sidebar, BottomNav, and ViewRouter.
 */

export interface NavItem {
  id: string;
  icon: string;
  label: string;
  children?: NavItem[];
}

export interface RouteConfig {
  viewName: string;
  params?: Record<string, string>;
}

export { STORAGE_KEYS } from "./constants";
import { t } from "./i18n";

type NavKeys = keyof typeof t.nav;

function resolveLabel(label: string): string {
  if (label.startsWith("nav.")) {
    const key = label.slice(4) as NavKeys;
    return t.nav[key] ?? label;
  }
  return label;
}

function resolveNavItems<T extends { label: string; children?: T[] }>(items: T[]): T[] {
  return items.map((item) => ({
    ...item,
    label: resolveLabel(item.label),
    ...(item.children ? { children: resolveNavItems(item.children) } : {}),
  }));
}

export const NAV_MENU_ITEMS: NavItem[] = [
  { id: "dashboard", icon: "📊", label: "nav.dashboard" },
  { id: "todos", icon: "📋", label: "nav.todos" },
  {
    id: "circulations",
    icon: "🔄",
    label: "nav.circulations",
    children: [
      { id: "circulations-today", icon: "☀️", label: "nav.circulationsToday" },
      { id: "circulations-settings", icon: "⚙️", label: "nav.circulationsSettings" },
    ],
  },
  { id: "plans", icon: "🚀", label: "nav.plans" },
  { id: "goals", icon: "🎯", label: "nav.goals" },
  { id: "milestones", icon: "🏆", label: "nav.milestones" },
  { id: "views", icon: "👁️", label: "nav.views" },
  { id: "statistics", icon: "📈", label: "nav.statistics" },
  {
    id: "notifications",
    icon: "🔔",
    label: "nav.notifications",
    children: [
      { id: "notification-center", icon: "📨", label: "nav.notificationCenter" },
      { id: "settings-notifications", icon: "⚙️", label: "nav.notificationSettings" },
      { id: "settings-channels", icon: "📢", label: "nav.channels" },
      { id: "settings-daily-summary", icon: "📅", label: "nav.dailySummary" },
      { id: "settings-circulation-notifications", icon: "⏰", label: "nav.circulationNotifications" },
    ],
  },
  {
    id: "data-management",
    icon: "💾",
    label: "nav.dataManagement",
    children: [
      { id: "data-import-export", icon: "🔄", label: "nav.importExport" },
      { id: "settings-sync", icon: "☁️", label: "nav.sync" },
    ],
  },
  {
    id: "settings",
    icon: "⚙️",
    label: "nav.settings",
    children: [
      { id: "settings-general", icon: "🎨", label: "nav.general" },
      { id: "settings-tags", icon: "🏷️", label: "nav.tagManagement" },
    ],
  },
  { id: "settings-about", icon: "ℹ️", label: "nav.about" },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", icon: "📊", label: "nav.home" },
  { id: "todos", icon: "📋", label: "nav.todos" },
  { id: "circulations", icon: "🔄", label: "nav.checkin" },
  { id: "plans", icon: "🚀", label: "nav.plans" },
  { id: "settings", icon: "⚙️", label: "nav.more" },
];

export const NAV_MENU_ITEMS_RESOLVED = resolveNavItems(NAV_MENU_ITEMS);
export const BOTTOM_NAV_ITEMS_RESOLVED = resolveNavItems(BOTTOM_NAV_ITEMS);

export const ROUTE_VIEW_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  todos: "TodosView", "todos-all": "TodosView", "todos-today": "TodosView",
  "todos-upcoming": "TodosView", "todos-completed": "TodosView",
  plans: "PlansView", "plans-active": "PlansView", "plans-archived": "PlansView",
  goals: "TargetsView", "goals-active": "TargetsView", "goals-completed": "TargetsView",
  milestones: "MilestonesView",
  views: "ViewsView",
  circulations: "CirculationsView", "circulations-today": "CirculationsView",
  "circulations-settings": "CirculationsView",
  statistics: "StatisticsView",
  notifications: "NotificationCenterView", "notification-center": "NotificationCenterView",
  "settings-channels": "SettingsChannelsView",
  "settings-daily-summary": "SettingsDailySummaryView",
  "settings-circulation-notifications": "SettingsCirculationNotificationsView",
  "settings-notifications": "SettingsNotificationsView",
  "data-management": "DataManagementView", "data-import-export": "DataManagementView",
  "settings-sync": "SettingsSyncView",
  settings: "SettingsGeneralView", "settings-general": "SettingsGeneralView",
  "settings-tags": "SettingsTagsView",
  "settings-about": "SettingsAboutView",
};

export const ROUTE_PARAMS_MAP: Record<string, Record<string, string>> = {
  "circulations-today": { mode: "today" },
  "circulations-settings": { mode: "settings" },
};

export const ENTITY_ROUTE_MAP: Record<string, string> = {
  todo: "todos",
  plan: "plans",
  target: "goals",
  milestone: "milestones",
};

export const DEFAULT_EXPANDED_GROUPS = new Set([
  "notifications",
  "data-management",
  "settings",
]);