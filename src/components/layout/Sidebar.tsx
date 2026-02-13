'use client';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
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
  { id: 'settings', icon: '⚙️', label: '设置' },
];

export function Sidebar({ activeMenu, onMenuChange }: SidebarProps) {
  return (
    <aside 
      className="w-60 bg-white border-r border-teal-100 flex flex-col h-screen"
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
      <nav className="flex-1 overflow-y-auto p-2">
        {menus.map(menu => (
          <button
            key={menu.id}
            onClick={() => onMenuChange(menu.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1
              ${activeMenu === menu.id ? 'bg-teal-100' : 'hover:bg-teal-50'}
            `}
            style={{ color: '#134E4A' }}
          >
            <span className="text-lg">{menu.icon}</span>
            <span className="text-sm font-medium">{menu.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
