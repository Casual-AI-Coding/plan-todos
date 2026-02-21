'use client';

import { useState, useEffect, useRef } from 'react';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  children?: MenuItem[];
}

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
}
 
const menus: MenuItem[] = [
  { id: 'dashboard', icon: '📊', label: '今日总览' },
  { id: 'todos', icon: '📋', label: 'TODOS' },
  { id: 'circulations', icon: '🔄', label: 'CIRCULATIONS' },
  { id: 'plans', icon: '🚀', label: 'PLANS' },
  { id: 'goals', icon: '🎯', label: 'GOALS' },
  { id: 'milestones', icon: '🏆', label: 'MILESTONES' },
  { id: 'views', icon: '👁️', label: '视图查看' },
  { id: 'statistics', icon: '📈', label: '数据统计' },
  { 
    id: 'settings', 
    icon: '⚙️', 
    label: '设置',
    children: [
      { id: 'settings-general', icon: '🎨', label: '通用' },
      { id: 'settings-tags', icon: '🏷️', label: '标签管理' },
      { 
        id: 'settings-notifications',
        icon: '🔔', 
        label: '通知',
        children: [
          { id: 'settings-channels', icon: '📢', label: '通知渠道' },
          { id: 'settings-daily-summary', icon: '📅', label: '每日汇总' },
        ]
      },
    ]
  },
  { id: 'settings-about', icon: 'ℹ️', label: '关于' },
];

export function Sidebar({ activeMenu, onMenuChange, onCollapseChange }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['settings']));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [mouseInPopup, setMouseInPopup] = useState(false);
  const menuRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  // Save collapsed state to localStorage and notify parent
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
    onCollapseChange?.(newState);
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMenus(prev => {
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
  const isChildOfActive = () => {
    if (activeMenu.startsWith('settings')) return true;
    return false;
  };

  // Render popup children for collapsed mode
  const renderPopupChildren = (children: MenuItem[]): React.ReactNode => {
    return children.map(child => {
      const hasGrandChildren = child.children && child.children.length > 0;
      return (
        <div key={child.id} className="mb-0.5">
          <button
            onClick={() => {
              onMenuChange(child.id);
              setHoveredMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:opacity-80"
            style={{ 
              backgroundColor: activeMenu === child.id ? 'var(--color-primary)' : 'transparent',
              color: activeMenu === child.id ? 'var(--color-text-inverse)' : 'var(--color-text)',
            }}
          >
            <span>{child.icon}</span>
            <span className="font-medium truncate">{child.label}</span>
          </button>
          {/* Render grandchildren */}
          {hasGrandChildren && (
            <div className="ml-2">
              {renderPopupChildren(child.children!)}
            </div>
          )}
        </div>
      );
    });
  };

  const renderMenuItem = (menu: MenuItem, level: number = 0, forceShow: boolean = false) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedMenus.has(menu.id) || forceShow;
    const isCurrentActive = isActive(menu.id);
    const isParentOfActive = hasChildren && menu.children!.some(child => 
      activeMenu === child.id || (child.children?.some(c => activeMenu === c.id))
    );

    // In collapsed state, don't render children inline
    if (isCollapsed && level > 0) return null;

    // Handle hover in collapsed mode
    const handleMouseEnter = () => {
      if (isCollapsed && hasChildren) {
        setHoveredMenu(menu.id);
      }
    };
    const handleMouseLeave = () => {
      if (isCollapsed && hasChildren) {
        // Delay hiding to allow mouse to move to popup
        setTimeout(() => {
          if (!mouseInPopup) {
            setHoveredMenu(null);
          }
        }, 300);
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
            ${level === 0 ? '' : level === 1 ? 'ml-4' : 'ml-8'}
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? menu.label : undefined}
          style={{ 
            fontSize: level === 0 ? '15px' : '14px',
            maxWidth: level === 0 ? '100%' : level === 1 ? 'calc(100% - 16px)' : level === 2 ? 'calc(100% - 32px)' : 'calc(100% - 40px)',
            backgroundColor: isCurrentActive ? 'var(--color-primary)' : 'transparent',
            color: isCurrentActive ? 'var(--color-text-inverse)' : 'var(--color-text)',
          }}
        >
          {hasChildren && !isCollapsed && (
            <span className={`w-3 flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} style={{ color: isCurrentActive ? 'var(--color-text-inverse)' : 'var(--color-text)', transition: 'transform 0.2s' }}>
              ▶
            </span>
          )}
          <span className="text-base">{menu.icon}</span>
          {!isCollapsed && <span className="font-medium truncate">{menu.label}</span>}
        </button>
        
        {/* Show children inline when expanded and NOT collapsed */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mb-0.5">
            {menu.children!.map(child => renderMenuItem(child, level + 1, isExpanded))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside 
      className={`border-r flex flex-col h-screen transition-all duration-300`}
      style={{ 
        width: isCollapsed ? '4rem' : '13rem',
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header with Logo and Toggle */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
        {!isCollapsed && (
          <h1 
            className="text-xl font-bold"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}
          >
            Plan Todos
          </h1>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1 rounded hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-text-muted)' }}
          title={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        {menus.map(menu => renderMenuItem(menu))}
      </nav>

      {/* Hover Popup for collapsed state */}
      {isCollapsed && hoveredMenu && (
        <div 
          className="fixed p-2 rounded-md shadow-lg z-50 min-w-40"
          style={{ 
            backgroundColor: 'var(--color-bg-card)',
            top: popupPosition.top,
            left: '4rem',
          }}
          onMouseEnter={() => setMouseInPopup(true)}
          onMouseLeave={() => { setMouseInPopup(false); setHoveredMenu(null); }}
        >
          {(() => {
            const menu = menus.find(m => m.id === hoveredMenu);
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
