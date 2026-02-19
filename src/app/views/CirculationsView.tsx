'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, Modal, Input } from '@/components/ui';
import { CheckinConfirm } from '@/components/ui/CheckinConfirm';
import {
  getCirculations,
  getCirculationsByType,
  createCirculation,
  updateCirculation,
  deleteCirculation,
  checkinCirculation,
  undoCheckinCirculation,
  Circulation,
  CirculationType,
  PeriodicFrequency,
} from '@/lib/api';

type ViewMode = 'today' | 'settings';
type SettingsTab = 'periodic' | 'count';
type PeriodicSubTab = 'daily' | 'weekly' | 'monthly';

interface CirculationsViewProps {
  mode?: ViewMode;
}

export function CirculationsView({ mode = 'today' }: CirculationsViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(mode);
  const [circulations, setCirculations] = useState<Circulation[]>([]);
  const [todayCirculations, setTodayCirculations] = useState<Circulation[]>([]);
  
  // Settings tabs
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('periodic');
  const [periodicSubTab, setPeriodicSubTab] = useState<PeriodicSubTab>('daily');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingCirculation, setEditingCirculation] = useState<Circulation | null>(null);
  const [title, setTitle] = useState('');
  const [circulationType, setCirculationType] = useState<CirculationType>('periodic');
  const [frequency, setFrequency] = useState<PeriodicFrequency>('daily');
  const [targetCount, setTargetCount] = useState<number | ''>('');
  
  // Checkin state
  const [checkinTarget, setCheckinTarget] = useState<Circulation | null>(null);
  const [checkinLoading, setCheckinLoading] = useState(false);

  const isLoaded = useRef(false);

  async function loadCirculations() {
    try {
      const data = await getCirculations();
      if (isLoaded.current) {
        setCirculations(data);
        // Filter today's circulations
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const dayOfWeek = today.getDay();
        
        const todayList = data.filter(c => {
          if (c.status !== 'active') return false;
          if (c.circulation_type === 'count') return true;
          if (c.frequency === 'daily') return true;
          if (c.frequency === 'weekly' && dayOfWeek === 1) return true; // Monday
          if (c.frequency === 'monthly' && today.getDate() === 1) return true; // 1st of month
          return false;
        });
        setTodayCirculations(todayList);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (!isLoaded.current) {
      isLoaded.current = true;
      loadCirculations();
    }
  }, []);

  // Check if circulation was completed today
  const isCompletedToday = (c: Circulation): boolean => {
    if (!c.last_completed_at) return false;
    const today = new Date().toISOString().split('T')[0];
    return c.last_completed_at.startsWith(today);
  };

  // Handle checkin
  async function handleCheckin(circulation: Circulation, note: string = '') {
    setCheckinLoading(true);
    try {
      await checkinCirculation(circulation.id, note);
      await loadCirculations();
      setCheckinTarget(null);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : '打卡失败');
    } finally {
      setCheckinLoading(false);
    }
  }

  // Handle undo checkin
  async function handleUndo(circulation: Circulation) {
    if (!confirm('确定要撤销今天的打卡吗？')) return;
    try {
      await undoCheckinCirculation(circulation.id);
      await loadCirculations();
    } catch (e) {
      console.error(e);
    }
  }

  // Handle create/update
  async function handleSave() {
    try {
      if (editingCirculation) {
        await updateCirculation(editingCirculation.id, {
          title,
          circulation_type: circulationType,
          frequency: circulationType === 'periodic' ? frequency : undefined,
          target_count: circulationType === 'count' && targetCount ? Number(targetCount) : undefined,
        });
      } else {
        await createCirculation({
          title,
          circulation_type: circulationType,
          frequency: circulationType === 'periodic' ? frequency : undefined,
          target_count: circulationType === 'count' && targetCount ? Number(targetCount) : undefined,
        });
      }
      await loadCirculations();
      closeForm();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : '保存失败');
    }
  }

  // Handle delete
  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个打卡项吗？')) return;
    try {
      await deleteCirculation(id);
      await loadCirculations();
    } catch (e) {
      console.error(e);
    }
  }

  function openEdit(c: Circulation) {
    setEditingCirculation(c);
    setTitle(c.title);
    setCirculationType(c.circulation_type);
    setFrequency(c.frequency || 'daily');
    setTargetCount(c.target_count || '');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingCirculation(null);
    setTitle('');
    setCirculationType('periodic');
    setFrequency('daily');
    setTargetCount('');
  }

  // Filter circulations for settings
  const filteredCirculations = settingsTab === 'periodic'
    ? circulations.filter(c => c.circulation_type === 'periodic' && c.frequency === periodicSubTab)
    : circulations.filter(c => c.circulation_type === 'count');

  return (
    <div className="p-6">
      {/* Tab Navigation */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: '#134E4A' }}>
          打卡
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'today' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('today')}
          >
            今日打卡
          </Button>
          <Button
            variant={viewMode === 'settings' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('settings')}
          >
            打卡设置
          </Button>
          <Button onClick={() => setShowForm(true)}>
            + 新建
          </Button>
        </div>
      </div>

      {/* Today View */}
      {viewMode === 'today' && (
        <div className="space-y-4">
          {todayCirculations.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">今日没有待打卡项</p>
                <Button
                  className="mt-4"
                  onClick={() => setViewMode('settings')}
                >
                  去创建打卡
                </Button>
              </div>
            </Card>
          ) : (
            todayCirculations.map(c => (
              <Card key={c.id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold" style={{ color: '#134E4A' }}>
                      {c.title}
                    </div>
                    {c.circulation_type === 'periodic' && (
                      <div className="text-sm text-gray-500 mt-1">
                        🔥 连续 {c.streak_count} 天
                        {c.best_streak > 0 && <span className="ml-2">最佳: {c.best_streak} 天</span>}
                      </div>
                    )}
                    {c.circulation_type === 'count' && (
                      <div className="text-sm text-gray-500 mt-1">
                        📊 {c.current_count} / {c.target_count || '∞'}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isCompletedToday(c) ? (
                      <Button
                        variant="secondary"
                        onClick={() => handleUndo(c)}
                      >
                        撤销
                      </Button>
                    ) : (
                      <Button onClick={() => setCheckinTarget(c)}>
                        打卡
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Settings View */}
      {viewMode === 'settings' && (
        <>
          {/* Sub Tabs */}
          <div className="flex gap-2 mb-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  settingsTab === 'periodic'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setSettingsTab('periodic')}
              >
                周期打卡
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  settingsTab === 'count'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setSettingsTab('count')}
              >
                计数打卡
              </button>
            </div>
          </div>

          {/* Periodic Sub Tabs */}
          {settingsTab === 'periodic' && (
            <div className="flex gap-2 mb-4 ml-2">
              <button
                className={`px-3 py-1 rounded text-sm ${
                  periodicSubTab === 'daily' ? 'bg-teal-100 text-teal-700' : 'text-gray-500'
                }`}
                onClick={() => setPeriodicSubTab('daily')}
              >
                每日
              </button>
              <button
                className={`px-3 py-1 rounded text-sm ${
                  periodicSubTab === 'weekly' ? 'bg-teal-100 text-teal-700' : 'text-gray-500'
                }`}
                onClick={() => setPeriodicSubTab('weekly')}
              >
                每周
              </button>
              <button
                className={`px-3 py-1 rounded text-sm ${
                  periodicSubTab === 'monthly' ? 'bg-teal-100 text-teal-700' : 'text-gray-500'
                }`}
                onClick={() => setPeriodicSubTab('monthly')}
              >
                每月
              </button>
            </div>
          )}

          {/* List */}
          <div className="space-y-4">
            {filteredCirculations.length === 0 ? (
              <Card>
                <div className="text-center py-8 text-gray-500">
                  暂无打卡项
                </div>
              </Card>
            ) : (
              filteredCirculations.map(c => (
                <Card key={c.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold" style={{ color: '#134E4A' }}>
                        {c.title}
                        {c.status === 'archived' && (
                          <span className="ml-2 text-xs text-gray-400">(已归档)</span>
                        )}
                      </div>
                      {c.circulation_type === 'periodic' && (
                        <div className="text-sm text-gray-500 mt-1">
                          🔥 {c.streak_count} 天 · 最佳 {c.best_streak} 天
                        </div>
                      )}
                      {c.circulation_type === 'count' && (
                        <div className="text-sm text-gray-500 mt-1">
                          📊 {c.current_count} / {c.target_count || '∞'}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(c)}>
                        编辑
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDelete(c.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* Create/Edit Form Modal */}
      <Modal
        open={showForm}
        title={editingCirculation ? '编辑打卡项' : '新建打卡项'}
        onClose={closeForm}
        width="sm"
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              保存
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标题
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入打卡项名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              类型
            </label>
            <div className="flex gap-2">
              <button
                className={`flex-1 py-2 rounded-lg border-2 transition-colors ${
                  circulationType === 'periodic'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-600'
                }`}
                onClick={() => setCirculationType('periodic')}
              >
                周期打卡
              </button>
              <button
                className={`flex-1 py-2 rounded-lg border-2 transition-colors ${
                  circulationType === 'count'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-600'
                }`}
                onClick={() => setCirculationType('count')}
              >
                计数打卡
              </button>
            </div>
          </div>

          {circulationType === 'periodic' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                频率
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as PeriodicFrequency)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="daily">每日</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </div>
          )}

          {circulationType === 'count' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目标次数 (可选)
              </label>
              <Input
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value ? Number(e.target.value) : '')}
                placeholder="不填则无限"
                min={1}
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Checkin Confirm Modal */}
      {checkinTarget && (
        <CheckinConfirm
          circulation={checkinTarget}
          open={!!checkinTarget}
          onConfirm={(note) => handleCheckin(checkinTarget, note)}
          onCancel={() => setCheckinTarget(null)}
        />
      )}
    </div>
  );
}
