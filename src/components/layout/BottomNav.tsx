"use client";

import { BOTTOM_NAV_ITEMS_RESOLVED } from "@/config/routes";
import { t } from "@/config/i18n";

interface BottomNavProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
}

const navItems = BOTTOM_NAV_ITEMS_RESOLVED;

export function BottomNav({ activeMenu, onMenuChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden z-40 border-t pb-[env(safe-area-inset-bottom)]"
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => {
          const isActive =
            activeMenu === item.id ||
            (item.id === "settings" &&
              (activeMenu.startsWith("settings") ||
                activeMenu.startsWith("data-management")));

          return (
            <button
              key={item.id}
              aria-label={item.label}
              onClick={() => onMenuChange(item.id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors cursor-pointer"
              style={{
                color: isActive
                  ? "var(--color-primary)"
                  : "var(--color-text-muted)",
              }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}