'use client';

interface BottomNavProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: '📊', label: '首页' },
  { id: 'todos', icon: '📋', label: '待办' },
  { id: 'circulations', icon: '🔄', label: '打卡' },
  { id: 'plans', icon: '🚀', label: '计划' },
  { id: 'settings', icon: '⚙️', label: '设置' },
];

export function BottomNav({ activeMenu, onMenuChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 border-t"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = activeMenu === item.id || 
            (item.id === 'settings' && activeMenu.startsWith('settings'));
          
          return (
            <button
              key={item.id}
              onClick={() => onMenuChange(item.id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors"
              style={{
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
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
