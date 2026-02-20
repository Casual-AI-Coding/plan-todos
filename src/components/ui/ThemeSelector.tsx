'use client';

import { useTheme, ThemeId } from '@/hooks/useTheme';
import { themes, themeList } from '@/lib/themes/registry';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-3 gap-3">
      {themeList.map((t) => {
        const isActive = theme === t.id;
        
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id as ThemeId)}
            className={`
              p-4 rounded-lg border-2 transition-all flex flex-col items-center
              ${isActive 
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
              }
            `}
          >
            <div 
              className="w-12 h-12 rounded-md mb-2 flex items-center justify-center text-xl border"
              style={{ 
                background: t.colors.bg,
                borderColor: t.colors.border,
              }}
            >
              {t.icon}
            </div>
            <span 
              className="text-sm font-medium"
              style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text)' }}
            >
              {t.nameZh}
            </span>
          </button>
        );
      })}
    </div>
  );
}
