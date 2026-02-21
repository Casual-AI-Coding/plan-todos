'use client';

import { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  children?: MenuItem[];
}

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
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

export function Sidebar({ activeMenu, onMenuChange }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['settings']));
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
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

  const isActive = (id: string) => activeMenu === id;
  const isChildOfActive = () => {
    // Check if current menu is a child of settings
    if (activeMenu.startsWith('settings')) return true;
    return false;
  };

  const renderMenuItem = (menu: MenuItem, level: number = 0) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedMenus.has(menu.id);
    const isCurrentActive = isActive(menu.id);
    const isParentOfActive = hasChildren && menu.children!.some(child => 
      activeMenu === child.id || (child.children?.some(c => activeMenu === c.id))
    );

    // Don't render children when collapsed
    if (isCollapsed && level > 0) return null;

    return (
      <div key={menu.id}>
        <button
          onClick={(e) => {
            if (hasChildren) {
              toggleExpand(menu.id, e);
            } else {
              onMenuChange(menu.id);
            }
          }}
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
        
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mb-0.5">
            {menu.children!.map(child => renderMenuItem(child, level + 1))}
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
