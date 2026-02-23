"use client";

export type Theme = "light" | "dark" | "auto";

export interface ThemeSelectorProps {
  value: Theme;
  onChange: (theme: Theme) => void;
}

const themes = [
  { id: "light" as const, label: "浅色", icon: "☀️" },
  { id: "dark" as const, label: "深色", icon: "🌙" },
  { id: "auto" as const, label: "自动", icon: "⚙️" },
];

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        主题
      </label>
      <div className="flex gap-3">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              value === t.id
                ? "border-teal-500 bg-teal-50"
                : "border-gray-200 hover:border-teal-200"
            }`}
          >
            <div className="text-xl mb-1">{t.icon}</div>
            <div className="text-sm font-medium">{t.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
