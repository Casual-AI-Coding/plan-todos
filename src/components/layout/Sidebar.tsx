'use client';

import { useState } from 'react';

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
            ${level === 0 ? '' : 'ml-4'}
            ${level === 1 ? 'ml-6' : ''}
            ${level === 2 ? 'ml-8' : ''}
            ${isCurrentActive 
              ? 'bg-teal-500 text-white shadow-sm' 
              : 'hover:bg-teal-100 text-gray-700'
            }
          `}
          style={{ 
            fontSize: level === 0 ? '15px' : '14px',
          }}
        >
                    {level > 0 && <span className={`w-3 flex-shrink-0 ${hasChildren ? '' : 'invisible'}`}>
            {hasChildren && '▶'}
          </span>}
          <span className="text-base">{menu.icon}</span>
          <span className="font-medium truncate">{menu.label}</span>
        </button>
        
        {hasChildren && isExpanded && (
          <div className="mb-0.5">
            {menu.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside 
      className="w-52 bg-white border-r border-teal-100 flex flex-col h-screen"
      style={{ borderColor: '#CCFBF1' }}
    >
      {/* Logo */}
      <div className="p-4 border-b border-teal-100">
        <h1 
          className="text-xl font-bold"
          style={{ color: '#134E4A', fontFamily: 'Fira Code, monospace' }}
        >
          Plan Todos
        </h1>
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
