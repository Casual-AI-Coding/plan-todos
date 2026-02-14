'use client';

import { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';

export function SettingsGeneralView() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6" style={{ color: '#134E4A' }}>
        设置 &gt; 通用
      </h2>
      
      {/* Appearance */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: '#134E4A' }}>外观</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">主题</label>
            <div className="flex gap-3">
              {[
                { id: 'light', label: '浅色', icon: '☀️' },
                { id: 'dark', label: '深色', icon: '🌙' },
                { id: 'auto', label: '自动', icon: '⚙️' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as typeof theme)}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    theme === t.id 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-gray-200 hover:border-teal-200'
                  }`}
                >
                  <div className="text-xl mb-1">{t.icon}</div>
                  <div className="text-sm font-medium">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">语言</label>
            <select 
              value={language}
              onChange={e => setLanguage(e.target.value as typeof language)}
              className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: '#134E4A' }}>数据管理</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">自动备份</div>
              <div className="text-sm text-gray-500">每次打开应用时自动备份</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">备份路径</label>
            <div className="flex gap-2">
              <Input 
                placeholder="选择备份目录..."
                className="flex-1"
              />
              <Button variant="secondary">浏览</Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1">
              导出数据 (JSON)
            </Button>
            <Button variant="secondary" className="flex-1">
              导入数据
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
