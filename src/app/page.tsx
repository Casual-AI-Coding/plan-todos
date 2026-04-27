"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TitleBar } from "@/components/layout/TitleBar";
import { ViewRouter } from "@/components/layout/ViewRouter";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { STORAGE_KEYS, LAYOUT } from "@/config/constants";
import { useNavigationStore } from "@/stores/navigation";
import { CirculationDetailView } from "./views";

function getInitialSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === "true";
}

export default function Home() {
  const activeMenu = useNavigationStore((state) => state.activeMenu);
  const mobileSidebarOpen = useNavigationStore((state) => state.mobileSidebarOpen);
  const navigate = useNavigationStore((state) => state.navigate);
  const openMobileSidebar = useNavigationStore((state) => state.openMobileSidebar);
  const closeMobileSidebar = useNavigationStore((state) => state.closeMobileSidebar);
  const [circulationDetailId, setCirculationDetailId] = useState<string | null>(null);
  const [, setSidebarCollapsed] = useState(getInitialSidebarCollapsed);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("sidebar-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen" style={{ background: "transparent", fontFamily: "var(--font-sans)" }}>
      <div className="hidden md:flex flex-col h-screen rounded-lg overflow-hidden border border-[var(--color-border)] shadow-lg">
        <TitleBar />
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden md:block h-full">
            <Sidebar activeMenu={activeMenu} onMenuChange={navigate} onCollapseChange={setSidebarCollapsed} />
          </div>
          <main className="flex-1 overflow-auto pb-16 md:pb-0" style={{ backgroundColor: "var(--color-bg)" }}>
            <ViewRouter activeMenu={activeMenu} />
          </main>
        </div>
      </div>

      <div className="md:hidden flex flex-col h-full">
        <header
          className="flex items-center px-4 border-b fixed top-0 left-0 right-0 z-40"
          style={{
            height: LAYOUT.MOBILE_HEADER_CALC,
            paddingTop: "env(safe-area-inset-top)",
            backgroundColor: "var(--color-bg-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <button
            onClick={openMobileSidebar}
            className="p-2 -ml-2 rounded hover:opacity-80"
            style={{ color: "var(--color-text)" }}
            aria-label="打开菜单"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <rect x="2" y="4" width="16" height="1.5" />
              <rect x="2" y="9" width="16" height="1.5" />
              <rect x="2" y="14" width="16" height="1.5" />
            </svg>
          </button>
          <h1 className="ml-2 text-lg font-semibold" style={{ color: "var(--color-text)" }}>
            Plan Todos
          </h1>
        </header>

        <main
          className="flex-1 overflow-auto"
          style={{
            backgroundColor: "var(--color-bg)",
            paddingTop: LAYOUT.MOBILE_HEADER_CALC,
            paddingBottom: LAYOUT.MOBILE_FOOTER_CALC,
          }}
        >
          <ViewRouter activeMenu={activeMenu} />
        </main>

        {mobileSidebarOpen && (
          <MobileSidebar
            activeMenu={activeMenu}
            onMenuChange={navigate}
            onClose={closeMobileSidebar}
            onCollapseChange={setSidebarCollapsed}
          />
        )}
      </div>

      <BottomNav activeMenu={activeMenu} onMenuChange={navigate} />

      {circulationDetailId && (
        <CirculationDetailView id={circulationDetailId} onClose={() => setCirculationDetailId(null)} />
      )}
    </div>
  );
}
