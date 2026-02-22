'use client';

import { useState } from 'react';
import { Card, Button, Input, Modal, Checkbox } from '@/components/ui';
import { ImportExportView } from './ImportExportView';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { seedTestData, resetData } from '@/lib/api';

export function SettingsGeneralView() {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [isLoading, setIsLoading] = useState(false);
  
  // Seed modal state
  const [showSeedModal, setShowSeedModal] = useState(false);
  
  // Reset modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [keepTags, setKeepTags] = useState(true);
  const [keepSettings, setKeepSettings] = useState(true);

  const handleSeedConfirm = async () => {
    setShowSeedModal(false);
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

  const handleResetConfirm = async () => {
    setShowResetModal(false);
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
      </Card>

      {/* Data Operations */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: 'var(--color-text)' }}>数据操作</h3>
        
        {/* Warning */}
        <div 
          className="flex items-start gap-3 p-4 mb-4 rounded-lg border"
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            borderColor: 'rgba(239, 68, 68, 0.2)',
          }}
        >
          <svg 
            className="w-5 h-5 flex-shrink-0 mt-0.5" 
            style={{ color: '#EF4444' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <div className="text-sm" style={{ color: '#B91C1C' }}>
            <div className="font-medium mb-1">危险操作</div>
            <div>生成测试数据会添加示例数据到数据库，重置数据会清空所有业务数据。请谨慎操作。</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={() => setShowSeedModal(true)} 
            disabled={isLoading}
            variant="secondary"
          >
            {isLoading ? '处理中...' : '生成测试数据'}
          </Button>
          <Button 
            onClick={() => setShowResetModal(true)} 
            disabled={isLoading}
            variant="danger"
          >
            {isLoading ? '处理中...' : '重置数据'}
          </Button>
        </div>
      </Card>

      {/* Seed Data Confirmation Modal */}
      <Modal
        open={showSeedModal}
        title="生成测试数据"
        onClose={() => setShowSeedModal(false)}
        width="sm"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => setShowSeedModal(false)}
            >
              取消
            </Button>
            <Button 
              variant="primary"
              onClick={handleSeedConfirm}
            >
              确认生成
            </Button>
          </>
        }
      >
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <p className="mb-3">确定要生成测试数据吗？这将在当前数据库中添加以下示例数据：</p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>6 个标签 (工作、生活、学习、健康、娱乐、财务)</li>
            <li>10 个待办事项</li>
            <li>3 个计划</li>
            <li>15 个任务</li>
            <li>5 个目标</li>
            <li>10 个步骤</li>
            <li>5 个里程碑</li>
            <li>8 个打卡</li>
            <li>30 条打卡记录</li>
          </ul>
        </div>
      </Modal>

      {/* Reset Data Confirmation Modal */}
      <Modal
        open={showResetModal}
        title="重置数据"
        onClose={() => setShowResetModal(false)}
        width="sm"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => setShowResetModal(false)}
            >
              取消
            </Button>
            <Button 
              variant="danger"
              onClick={handleResetConfirm}
            >
              确认重置
            </Button>
          </>
        }
      >
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <p className="mb-4">
            <span className="font-medium text-red-600">警告：</span>
            此操作将清空所有业务数据（待办、计划、任务、目标、步骤、里程碑、打卡记录），请谨慎操作！
          </p>
          
          <div className="space-y-3">
            <Checkbox
              checked={keepTags}
              onChange={(e) => setKeepTags(e.target.checked)}
              label="保留标签"
            />
            <Checkbox
              checked={keepSettings}
              onChange={(e) => setKeepSettings(e.target.checked)}
              label="保留设置"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
