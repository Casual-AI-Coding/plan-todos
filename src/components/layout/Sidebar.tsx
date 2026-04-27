"use client";

import { useState, useEffect, useRef } from "react";
import { SearchBar } from "@/components/features";
import { ChevronRight, LucideIcon } from "lucide-react";
import { ComponentType } from "react";
import { STORAGE_KEYS, LAYOUT } from "@/config/constants";
import {
  NAV_MENU_ITEMS_RESOLVED,
  ENTITY_ROUTE_MAP,
  DEFAULT_EXPANDED_GROUPS,
} from "@/config/routes";
import type { NavItem } from "@/config/routes";
import { t } from "@/config/i18n";

interface MenuItem extends NavItem {
  children?: MenuItem[];
}

const menus: MenuItem[] = NAV_MENU_ITEMS_RESOLVED as MenuItem[];

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
  isMobile?: boolean;
}

export function Sidebar({
  activeMenu,
  onMenuChange,
  onCollapseChange,
  isMobile = false,
}: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(
    new Set(DEFAULT_EXPANDED_GROUPS),
  );

  // Use useEffect to avoid hydration mismatch - start with false on both server and client
  // In mobile mode, always expanded (not collapsed)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Sync with localStorage after mount (desktop only)
  useEffect(() => {
    if (isMobile) {
      // Mobile mode: always expanded
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCollapsed(false);
      return;
    }
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    if (saved === "true") {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const [isMouseInPopup, setIsMouseInPopup] = useState(false);
  const menuRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear hide timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Handle hover with delay to prevent flickering
  const handleMenuHover = (menuId: string | null) => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setHoveredMenu(menuId);
  };

  const handleMenuLeave = () => {
    // Only set timeout if mouse is not entering popup
    if (!isMouseInPopup) {
      hideTimeoutRef.current = setTimeout(() => {
        setHoveredMenu(null);
      }, 150);
    }
  };

  const handlePopupMouseEnter = () => {
    setIsMouseInPopup(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handlePopupMouseLeave = () => {
    setIsMouseInPopup(false);
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 150);
  };

  // Save collapsed state to localStorage and notify parent
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(newState));
    onCollapseChange?.(newState);
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Update popup position based on hovered menu item
  useEffect(() => {
    if (isCollapsed && hoveredMenu) {
      const button = menuRefs.current.get(hoveredMenu);
      if (button) {
        const rect = button.getBoundingClientRect();
        setPopupPosition({ top: rect.top, left: rect.right });
      }
    }
  }, [hoveredMenu, isCollapsed]);

  const isActive = (id: string) => activeMenu === id;
  const _isChildOfActive = () => {
    if (activeMenu.startsWith("settings")) return true;
    return false;
  };

  // Render icon - supports both emoji strings and LucideIcon components
  const renderIcon = (icon: string | LucideIcon, className?: string) => {
    if (typeof icon === "string") {
      return <span className={className}>{icon}</span>;
    }
    const IconComponent = icon;
    return <IconComponent className={className || "w-5 h-5"} />;
  };

  // Render popup children for collapsed mode
  const renderPopupChildren = (children: MenuItem[]): React.ReactNode => {
    return children.map((child) => {
      const hasGrandChildren = child.children && child.children.length > 0;
      return (
        <div key={child.id} className="mb-0.5">
          <button
            onClick={() => {
              onMenuChange(child.id);
              setHoveredMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:opacity-80 cursor-pointer"
            style={{
              backgroundColor:
                activeMenu === child.id
                  ? "var(--color-primary)"
                  : "transparent",
              color:
                activeMenu === child.id
                  ? "var(--color-text-inverse)"
                  : "var(--color-text)",
            }}
          >
            {renderIcon(child.icon, "text-base")}
            <span className="font-medium truncate">{child.label}</span>
          </button>
          {/* Render grandchildren */}
          {hasGrandChildren && (
            <div className="ml-2">{renderPopupChildren(child.children!)}</div>
          )}
        </div>
      );
    });
  };

  const renderMenuItem = (
    menu: MenuItem,
    level: number = 0,
    forceShow: boolean = false,
  ) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedMenus.has(menu.id) || forceShow;
    const isCurrentActive = isActive(menu.id);
    const _isParentOfActive =
      hasChildren &&
      menu.children!.some(
        (child) =>
          activeMenu === child.id ||
          child.children?.some((c) => activeMenu === c.id),
      );

    // In collapsed state, don't render children inline
    if (isCollapsed && level > 0) return null;

    // Handle hover in collapsed mode
    const handleMouseEnter = () => {
      if (isCollapsed && hasChildren) {
        handleMenuHover(menu.id);
      }
    };
    const handleMouseLeave = () => {
      if (isCollapsed && hasChildren) {
        handleMenuLeave();
      }
    };

    return (
      <div key={menu.id} className="relative">
        <button
          ref={(el) => {
            if (el) menuRefs.current.set(menu.id, el);
          }}
          onClick={(e) => {
            if (hasChildren) {
              if (!isCollapsed) {
                toggleExpand(menu.id, e);
              }
            } else {
              onMenuChange(menu.id);
            }
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`
            w-full flex items-center gap-1.5 px-2 py-2 rounded-md transition-all mb-0.5
            ${level === 0 ? "" : level === 1 ? "ml-4" : "ml-8"}
            ${isCollapsed ? "justify-center" : ""}
          `}
          title={isCollapsed ? menu.label : undefined}
          style={{
            fontSize: level === 0 ? "15px" : "14px",
            maxWidth:
              level === 0
                ? "100%"
                : level === 1
                  ? "calc(100% - 16px)"
                  : level === 2
                    ? "calc(100% - 32px)"
                    : "calc(100% - 40px)",
            backgroundColor: isCurrentActive
              ? "var(--color-primary)"
              : "transparent",
            color: isCurrentActive
              ? "var(--color-text-inverse)"
              : "var(--color-text)",
          }}
        >
          {hasChildren && !isCollapsed && (
            <span
              className={`w-4 h-4 flex-shrink-0 flex items-center justify-center ${isExpanded ? "rotate-90" : ""}`}
              style={{
                color: isCurrentActive
                  ? "var(--color-text-inverse)"
                  : "var(--color-text-muted)",
                transition: "transform 0.2s ease",
              }}
              aria-hidden="true"
            >
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
          <span className="text-base" aria-hidden="true">
            {renderIcon(menu.icon)}
          </span>
          {!isCollapsed && (
            <span className="font-medium truncate">{menu.label}</span>
          )}
        </button>

        {/* Show children inline when expanded and NOT collapsed */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mb-0.5">
            {menu.children!.map((child) =>
              renderMenuItem(child, level + 1, isExpanded),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`${isMobile ? "" : "border-r"} flex flex-col h-full transition-all duration-300`}
      style={{
        width: isMobile
          ? "100%"
          : isCollapsed
            ? LAYOUT.SIDEBAR_WIDTH_COLLAPSED
            : LAYOUT.SIDEBAR_WIDTH_EXPANDED,
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Header with Logo and Toggle - hidden in mobile mode */}
      {!isMobile && (
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: "var(--color-border)" }}
        >
          {!isCollapsed && (
            <h1
              className="text-xl font-bold"
              style={{
                color: "var(--color-text)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Plan Todos
            </h1>
          )}
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg hover:opacity-80 transition-all cursor-pointer"
            style={{
              color: "var(--color-text-muted)",
              backgroundColor:
                "color-mix(in srgb, var(--color-text-muted) 8%, transparent)",
            }}
            title={isCollapsed ? t.nav.expandSidebar : t.nav.collapseSidebar}
            aria-label={
              isCollapsed ? t.nav.expandSidebar : t.nav.collapseSidebar
            }
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>
      )}

      {/* Search Bar - hidden in mobile mode */}
      {!isMobile && !isCollapsed && (
        <div className="px-2 pb-2">
          <SearchBar
            onResultClick={(entityType, id) => {
              const menu = ENTITY_ROUTE_MAP[entityType];
              if (menu) {
                onMenuChange(menu);
              }
            }}
          />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        {menus.map((menu) => renderMenuItem(menu))}
      </nav>

      {/* Hover Popup for collapsed state */}
      {isCollapsed && hoveredMenu && (
        <div
          className="fixed p-2 rounded-md shadow-lg z-50 min-w-40"
          style={{
            backgroundColor: "var(--color-bg-card)",
            top: popupPosition.top,
            left: LAYOUT.SIDEBAR_WIDTH_COLLAPSED,
          }}
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
        >
          {(() => {
            const menu = menus.find((m) => m.id === hoveredMenu);
            return menu?.children ? renderPopupChildren(menu.children) : null;
          })()}
        </div>
      )}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </aside>
  );
}
