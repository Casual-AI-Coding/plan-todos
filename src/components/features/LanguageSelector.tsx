'use client';

export type Language = 'zh' | 'en';

export interface LanguageSelectorProps {
  value: Language;
  onChange: (language: Language) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">语言</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
