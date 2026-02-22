'use client';

import { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { ImportExportView } from './ImportExportView';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { seedTestData, resetData } from '@/lib/api';

export function SettingsGeneralView() {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [isLoading, setIsLoading] = useState(false);

  const handleSeedTestData = async () => {
    if (!confirm('确定要生成测试数据吗？这将添加示例数据到当前数据库。')) {
      return;
    }
    setIsLoading(true);
    try {
      const seedResult = await seedTestData();
      alert(`测试数据生成成功！\n- Todo: ${seedResult.todos}\n- Plan: ${seedResult.plans}\n- Task: ${seedResult.tasks}\n- Target: ${seedResult.targets}\n- Step: ${seedResult.steps}\n- Milestone: ${seedResult.milestones}\n- Circulation: ${seedResult.circulations}\n- Tag: ${seedResult.tags}`);
    } catch (error) {
      console.error('Failed to seed test data:', error);
      alert('生成测试数据失败: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetData = async () => {
    const keepTags = confirm('是否保留标签？点击确定保留标签，点击取消删除所有标签。');
    const keepSettings = confirm('是否保留设置？点击确定保留设置，点击取消删除所有设置。');
    
    if (!confirm(`确定要重置数据吗？\n- 保留标签: ${keepTags ? '是' : '否'}\n- 保留设置: ${keepSettings ? '是' : '否'}`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      await resetData({ keep_tags: keepTags, keep_settings: keepSettings });
      alert('数据重置成功！');
    } catch (error) {
      console.error('Failed to reset data:', error);
      alert('重置数据失败: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text)' }}>
        设置 &gt; 通用
      </h2>
      
      {/* Appearance */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: 'var(--color-text)' }}>外观</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>主题</label>
            <ThemeSelector />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>语言</label>
            <select 
              value={language}
              onChange={e => setLanguage(e.target.value as typeof language)}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: 'var(--color-text)' }}>数据管理</h3>
        
        {/* Auto backup setting - keep as is */}
        <div className="space-y-4 mb-6">
          <div 
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-hover)' }}
          >
            <div>
              <div className="font-medium" style={{ color: 'var(--color-text)' }}>自动备份</div>
              <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>每次打开应用时自动备份</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
              />
              <div 
                className="w-11 h-6 rounded-full peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{ 
                  backgroundColor: 'var(--color-border)',
                }}
              ></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>备份路径</label>
            <div className="flex gap-2">
              <Input 
                placeholder="选择备份目录..."
                className="flex-1"
              />
              <Button variant="secondary">浏览</Button>
            </div>
          </div>
        </div>

        {/* Import/Export Component */}
        <ImportExportView />

        {/* Data Operations */}
        <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <h4 className="font-medium mb-4" style={{ color: 'var(--color-text)' }}>数据操作</h4>
          <div className="flex gap-3">
            <Button 
              onClick={handleSeedTestData} 
              disabled={isLoading}
              variant="secondary"
            >
              {isLoading ? '处理中...' : '生成测试数据'}
            </Button>
            <Button 
              onClick={handleResetData} 
              disabled={isLoading}
              variant="danger"
            >
              {isLoading ? '处理中...' : '重置数据'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
