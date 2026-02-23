"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TitleBar } from "@/components/ui/TitleBar";
import {
  Dashboard,
  TodosView,
  PlansView,
  TargetsView,
  MilestonesView,
  ViewsView,
  StatisticsView,
  SettingsGeneralView,
  SettingsChannelsView,
  SettingsDailySummaryView,
  SettingsAboutView,
  SettingsTagsView,
  CirculationsView,
  CirculationDetailView,
} from "./views";

// Main App
export default function Home() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [circulationDetailId, setCirculationDetailId] = useState<string | null>(
    null,
  );

  // Use useEffect to avoid hydration mismatch - start with false on both server and client
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Mobile sidebar overlay state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Sync with localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSidebarCollapsed(true);
    }
  }, []);

  // Global keyboard shortcut for search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("sidebar-search-input");
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <Dashboard />;
      case "todos":
      case "todos-all":
      case "todos-today":
      case "todos-upcoming":
      case "todos-completed":
        return <TodosView />;
      case "plans":
      case "plans-active":
      case "plans-archived":
        return <PlansView />;
      case "goals":
      case "goals-active":
      case "goals-completed":
        return <TargetsView />;
      case "milestones":
        return <MilestonesView />;
      case "views":
        return <ViewsView />;
      case "circulations":
      case "circulations-today":
        return <CirculationsView mode="today" />;
      case "circulations-settings":
        return <CirculationsView mode="settings" />;
      case "statistics":
        return <StatisticsView />;
      case "settings":
        return <SettingsGeneralView />;
      case "settings-general":
        return <SettingsGeneralView />;
      case "settings-tags":
        return <SettingsTagsView />;
      case "settings-channels":
        return <SettingsChannelsView />;
      case "settings-daily-summary":
        return <SettingsDailySummaryView />;
      case "settings-about":
        return <SettingsAboutView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: "transparent", fontFamily: "var(--font-sans)" }}
    >
      {/* Desktop: entire app with rounded corners, shadow, border */}
      <div className="hidden md:flex flex-col h-screen rounded-lg overflow-hidden border border-[var(--color-border)] shadow-lg">
        <TitleBar />

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden md:block h-full">
            <Sidebar
              activeMenu={activeMenu}
              onMenuChange={setActiveMenu}
              onCollapseChange={setSidebarCollapsed}
            />
          </div>

          {/* Main Content */}
          <main
            className="flex-1 overflow-auto pb-16 md:pb-0"
            style={{
              backgroundColor: "var(--color-bg)",
            }}
          >
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Mobile: with hamburger menu */}
      <div className="md:hidden flex flex-col h-screen">
        {/* Mobile Header with hamburger */}
        <header
          className="flex items-center h-12 px-4 border-b pt-[env(safe-area-inset-top)] fixed top-0 left-0 right-0 z-50"
          style={{
            backgroundColor: "var(--color-bg-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 -ml-2 rounded hover:opacity-80"
            style={{ color: "var(--color-text)" }}
            aria-label="打开菜单"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect x="2" y="4" width="16" height="1.5" />
              <rect x="2" y="9" width="16" height="1.5" />
              <rect x="2" y="14" width="16" height="1.5" />
            </svg>
          </button>
          <h1
            className="ml-2 text-lg font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            Plan Todos
          </h1>
        </header>

        {/* Main Content */}
        <main
          className="flex-1 overflow-auto pb-14 mt-12"
          style={{
            backgroundColor: "var(--color-bg)",
            paddingBottom: "calc(3.5rem + env(safe-area-inset-bottom))",
          }}
        >
          {renderContent()}
        </main>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Sidebar Panel */}
            <div
              className="fixed left-0 top-0 h-full z-30 w-64 pt-12"
              style={{
                backgroundColor: "var(--color-bg-card)",
                transform: "translateX(0)",
                transition: "transform 0.3s ease",
              }}
            >
              {/* Mobile sidebar header with close button */}
              <div className="flex items-center justify-between px-4 h-12 border-b">
                <span className="font-semibold" style={{ color: "var(--color-text)" }}>菜单</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2 rounded hover:opacity-80"
                  style={{ color: "var(--color-text)" }}
                  aria-label="关闭菜单"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <rect x="4" y="4" width="12" height="1.5" transform="rotate(45 10 10)" />
                    <rect x="4" y="4" width="12" height="1.5" transform="rotate(-45 10 10)" />
                  </svg>
                </button>
              </div>
              <Sidebar
                activeMenu={activeMenu}
                onMenuChange={(menu) => {
                  setActiveMenu(menu);
                  setMobileSidebarOpen(false);
                }}
                onCollapseChange={setSidebarCollapsed}
                isMobile
              />
            </div>
          </>
        )}
      </div>

      <BottomNav activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      {circulationDetailId && (
        <CirculationDetailView
          id={circulationDetailId}
          onClose={() => setCirculationDetailId(null)}
        />
      )}
    </div>
  );
}
