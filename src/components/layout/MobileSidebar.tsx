"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { LAYOUT } from "@/config/constants";
import { t } from "@/config/i18n";

interface MobileSidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  onClose: () => void;
  onCollapseChange: (collapsed: boolean) => void;
}

export function MobileSidebar({
  activeMenu,
  onMenuChange,
  onClose,
  onCollapseChange,
}: MobileSidebarProps) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div
        className="fixed left-0 top-0 h-full z-50 w-64"
        style={{
          backgroundColor: "var(--color-bg-card)",
          transform: "translateX(0)",
          transition: "transform 0.3s ease",
        }}
      >
        <div
          className="flex items-center justify-between px-4 border-b"
          style={{
            height: LAYOUT.MOBILE_HEADER_CALC,
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          <span className="font-semibold" style={{ color: "var(--color-text)" }}>
            {t.nav.menu}
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded hover:opacity-80"
            style={{ color: "var(--color-text)" }}
            aria-label={t.nav.closeMenu}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="4" y="4" width="12" height="1.5" transform="rotate(45 10 10)" />
              <rect x="4" y="4" width="12" height="1.5" transform="rotate(-45 10 10)" />
            </svg>
          </button>
        </div>
        <Sidebar
          activeMenu={activeMenu}
          onMenuChange={(menu) => {
            onMenuChange(menu);
            onClose();
          }}
          onCollapseChange={onCollapseChange}
          isMobile
        />
      </div>
    </>
  );
}