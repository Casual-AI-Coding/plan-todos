"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TitleBar } from "@/components/ui/TitleBar";
import { PageSlide } from "@/components/ui/animations";
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
    let view;
    switch (activeMenu) {
      case "dashboard":
        view = <Dashboard />;
        break;
      case "todos":
      case "todos-all":
      case "todos-today":
      case "todos-upcoming":
      case "todos-completed":
        view = <TodosView />;
        break;
      case "plans":
      case "plans-active":
      case "plans-archived":
        view = <PlansView />;
        break;
      case "goals":
      case "goals-active":
      case "goals-completed":
        view = <TargetsView />;
        break;
      case "milestones":
        view = <MilestonesView />;
        break;
      case "views":
        view = <ViewsView />;
        break;
      case "circulations":
      case "circulations-today":
        view = <CirculationsView mode="today" />;
        break;
      case "circulations-settings":
        view = <CirculationsView mode="settings" />;
        break;
      case "statistics":
        view = <StatisticsView />;
        break;
      case "settings":
      case "settings-general":
        view = <SettingsGeneralView />;
        break;
      case "settings-tags":
        view = <SettingsTagsView />;
        break;
      case "settings-channels":
        view = <SettingsChannelsView />;
        break;
      case "settings-daily-summary":
        view = <SettingsDailySummaryView />;
        break;
      case "settings-about":
        view = <SettingsAboutView />;
        break;
      default:
        view = <Dashboard />;
    }
    return <PageSlide key={activeMenu}>{view}</PageSlide>;
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
      <div className="md:hidden flex flex-col h-full">
        {/* Mobile Header with hamburger */}
        <header
          className="flex items-center px-4 border-b fixed top-0 left-0 right-0 z-40"
          style={{
            height: "calc(3.5rem + env(safe-area-inset-top))",
            paddingTop: "env(safe-area-inset-top)",
            backgroundColor: "var(--color-bg-card)",
            borderColor: "var(--color-border)",
          }}
        >
          {/* Sub-pages show back button, main pages show hamburger */}
          {activeMenu.startsWith("settings-") ? (
            <button
              onClick={() => setActiveMenu("settings")}
              className="p-2 -ml-2 rounded hover:opacity-80 flex items-center"
              style={{ color: "var(--color-text)" }}
              aria-label="返回"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 4l-6 6 6 6V4z" />
              </svg>
              <span className="ml-1 text-sm">返回</span>
            </button>
          ) : (
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
          )}
          {activeMenu.startsWith("settings-")
            ? activeMenu.replace("settings-", "").charAt(0).toUpperCase() +
              activeMenu.replace("settings-", "").slice(1)
            : "Plan Todos"}
        </header>

        {/* Main Content */}
        <main
          className="flex-1 overflow-auto"
          style={{
            backgroundColor: "var(--color-bg)",
            paddingTop: "calc(3.5rem + env(safe-area-inset-top))",
            paddingBottom: "calc(4rem + env(safe-area-inset-bottom))",
          }}
        >
          {renderContent()}
        </main>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[60] bg-black/50"
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Sidebar Panel */}
            <div
              className="fixed left-0 top-0 h-full z-[60] w-64"
              style={{
                backgroundColor: "var(--color-bg-card)",
                transform: "translateX(0)",
                transition: "transform 0.3s ease",
              }}
            >
              {/* Mobile sidebar header with close button */}
              <div
                className="flex items-center justify-between px-4 border-b"
                style={{
                  height: "calc(3.5rem + env(safe-area-inset-top))",
                  paddingTop: "env(safe-area-inset-top)",
                }}
              >
                <span
                  className="font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  菜单
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2 rounded hover:opacity-80"
                  style={{ color: "var(--color-text)" }}
                  aria-label="关闭菜单"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="12"
                      height="1.5"
                      transform="rotate(45 10 10)"
                    />
                    <rect
                      x="4"
                      y="4"
                      width="12"
                      height="1.5"
                      transform="rotate(-45 10 10)"
                    />
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
