'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { ThemeSelector, type Theme } from '@/components/features/ThemeSelector';
import { LanguageSelector, type Language } from '@/components/features/LanguageSelector';
import { DataBackupSettings } from '@/components/features/DataBackupSettings';
import { AboutCard } from '@/components/features/AboutCard';

export function SettingsView() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [autoBackup, setAutoBackup] = useState(false);
  const [backupPath, setBackupPath] = useState('');

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text)' }}>设置</h2>
      
      {/* Appearance */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: 'var(--color-text)' }}>外观</h3>
        <div className="space-y-4">
          <ThemeSelector value={theme} onChange={setTheme} />
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>
      </Card>

      {/* Data Management */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: 'var(--color-text)' }}>数据管理</h3>
        <DataBackupSettings
          autoBackup={autoBackup}
          backupPath={backupPath}
          onAutoBackupChange={setAutoBackup}
          onBackupPathChange={setBackupPath}
        />
      </Card>

      {/* About */}
      <Card>
        <h3 className="font-medium mb-4" style={{ color: 'var(--color-text)' }}>关于</h3>
        <AboutCard />
      </Card>
    </div>
  );
}
