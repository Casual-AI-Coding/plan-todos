"use client";

import { lazy, Suspense, useMemo } from "react";
import { ROUTE_VIEW_MAP, ROUTE_PARAMS_MAP } from "@/config/routes";
import { PageSlide } from "@/components/ui/animations";

const viewComponents = {
  Dashboard: lazy(() => import("@/app/views/Dashboard").then((m) => ({ default: m.Dashboard }))),
  TodosView: lazy(() => import("@/app/views/TodosView").then((m) => ({ default: m.TodosView }))),
  PlansView: lazy(() => import("@/app/views/PlansView").then((m) => ({ default: m.PlansView }))),
  TargetsView: lazy(() => import("@/app/views/TargetsView").then((m) => ({ default: m.TargetsView }))),
  MilestonesView: lazy(() => import("@/app/views/MilestonesView").then((m) => ({ default: m.MilestonesView }))),
  ViewsView: lazy(() => import("@/app/views/ViewsView").then((m) => ({ default: m.ViewsView }))),
  CirculationsView: lazy(() => import("@/app/views/CirculationsView").then((m) => ({ default: m.CirculationsView }))),
  StatisticsView: lazy(() => import("@/app/views/StatisticsView").then((m) => ({ default: m.StatisticsView }))),
  NotificationCenterView: lazy(() => import("@/app/views/NotificationCenterView").then((m) => ({ default: m.NotificationCenterView }))),
  DataManagementView: lazy(() => import("@/app/views/DataManagementView").then((m) => ({ default: m.DataManagementView }))),
  SettingsGeneralView: lazy(() => import("@/app/views/SettingsGeneralView").then((m) => ({ default: m.SettingsGeneralView }))),
  SettingsChannelsView: lazy(() => import("@/app/views/SettingsChannelsView").then((m) => ({ default: m.SettingsChannelsView }))),
  SettingsDailySummaryView: lazy(() => import("@/app/views/SettingsDailySummaryView").then((m) => ({ default: m.SettingsDailySummaryView }))),
  SettingsAboutView: lazy(() => import("@/app/views/SettingsAboutView").then((m) => ({ default: m.SettingsAboutView }))),
  SettingsTagsView: lazy(() => import("@/app/views/SettingsTagsView").then((m) => ({ default: m.SettingsTagsView }))),
  SettingsCirculationNotificationsView: lazy(() => import("@/app/views/SettingsCirculationNotificationsView").then((m) => ({ default: m.SettingsCirculationNotificationsView }))),
  SettingsNotificationsView: lazy(() => import("@/app/views/SettingsNotificationsView").then((m) => ({ default: m.SettingsNotificationsView }))),
  SettingsSyncView: lazy(() => import("@/app/views/SettingsSyncView").then((m) => ({ default: m.SettingsSyncView }))),
};

interface ViewRouterProps {
  activeMenu: string;
}

export function ViewRouter({ activeMenu }: ViewRouterProps) {
  const viewName = ROUTE_VIEW_MAP[activeMenu] ?? "Dashboard";
  const params = ROUTE_PARAMS_MAP[activeMenu] ?? {};

  const ViewComponent = viewComponents[viewName as keyof typeof viewComponents];

  const content = useMemo(() => {
    if (!ViewComponent) {
      return <viewComponents.Dashboard />;
    }
    return <ViewComponent {...params} />;
  }, [ViewComponent, params]);

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full" style={{ color: "var(--color-text-secondary)" }}>...</div>}>
      <PageSlide key={activeMenu}>{content}</PageSlide>
    </Suspense>
  );
}