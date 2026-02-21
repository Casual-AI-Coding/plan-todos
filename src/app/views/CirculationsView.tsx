'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, Modal, Input } from '@/components/ui';
import { CheckinConfirm } from '@/components/ui/CheckinConfirm';
import { EmptyStateCard } from '@/components/ui/EmptyStateCard';
import { SortableList } from '@/components/ui/SortableList';
import { CirculationDetailView } from './CirculationDetailView';
import {
  getCirculations,
  getCirculationsByType,
  createCirculation,
  updateCirculation,
  deleteCirculation,
  checkinCirculation,
  undoCheckinCirculation,
  getCirculationLogs,
  Circulation,
  CirculationType,
  PeriodicFrequency,
} from '@/lib/api';

type ViewMode = 'today' | 'settings';
type SettingsTab = 'periodic' | 'count';
type PeriodicSubTab = 'daily' | 'weekly' | 'monthly';

// 今日打卡统计
interface TodayStats {
  count: number; // 今日打卡次数
  progress: number; // 今日累计进度
}

interface CirculationsViewProps {
  mode?: ViewMode;
  onNavigate?: (id: string) => void;
}

export function CirculationsView({ mode = 'today', onNavigate }: CirculationsViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(mode);
  const [circulations, setCirculations] = useState<Circulation[]>([]);
  const [todayCirculations, setTodayCirculations] = useState<Circulation[]>([]);
  const [todayCirculationsOrdered, setTodayCirculationsOrdered] = useState<Circulation[]>([]);
  const [todayStats, setTodayStats] = useState<Record<string, TodayStats>>({});
  
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
  
  // Detail modal state
  const [detailCirculation, setDetailCirculation] = useState<Circulation | null>(null);

  const isLoaded = useRef(false);

  async function loadCirculations() {
    try {
      const data = await getCirculations();
      if (isLoaded.current) {
        setCirculations(data);
        // Filter today's circulations
        const today = new Date();
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
        setTodayCirculationsOrdered(todayList);
        
        // Load today's stats for count-type circulations
        const stats: Record<string, TodayStats> = {};
        const todayStr = today.toISOString().split('T')[0];
        await Promise.all(
          todayList
            .filter(c => c.circulation_type === 'count')
            .map(async (c) => {
              try {
                const logs = await getCirculationLogs(c.id, 50);
                const todayLogs = logs.filter(log => 
                  log.completed_at.startsWith(todayStr)
                );
                stats[c.id] = {
                  count: todayLogs.length,
                  progress: todayLogs.reduce((sum, log) => sum + (log.count || 0), 0),
                };
              } catch {
                stats[c.id] = { count: 0, progress: 0 };
              }
            })
        );
        setTodayStats(stats);
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
  async function handleCheckin(circulation: Circulation, note: string = '', count?: number) {
    setCheckinLoading(true);
    try {
      await checkinCirculation(circulation.id, note, count);
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

  // Handle reorder circulations (local only, not persisted)
  function handleReorderCirculations(newOrder: Circulation[]) {
    setTodayCirculationsOrdered(newOrder);
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
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {todayCirculations.length === 0 ? (
            <Card className="col-span-full">
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
            (todayCirculationsOrdered.length > 0 ? todayCirculationsOrdered : todayCirculations).map(c => {
              const isPeriodic = c.circulation_type === 'periodic';
              const isDoneToday = isCompletedToday(c);
              
              return (
                <Card key={c.id} className="hover:shadow-md transition-all">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div 
                        className="font-semibold cursor-pointer hover:opacity-80 truncate flex items-center gap-1" 
                        onClick={() => setDetailCirculation(c)}
                        title={c.title}
                      >
                        {isPeriodic ? (
                          <span className="text-lg">🔄</span>
                        ) : (
                          <span className="text-lg">📊</span>
                        )}
                        <span style={{ color: 'var(--color-text)' }}>{c.title}</span>
                      </div>
                      {/* Status Badge */}
                      <div className="flex items-center gap-1">
                        {isPeriodic ? (
                          isDoneToday ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-text-inverse)', opacity: 0.9 }}>
                              ✓ 已完成
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--color-warning)', color: 'var(--color-text-inverse)', opacity: 0.9 }}>
                              ○ 待打卡
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text-inverse)', opacity: 0.9 }}>
                            计数打卡
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Type Label */}
                    <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                      {isPeriodic 
                        ? '周期打卡' 
                        : `今日已打卡 ${todayStats[c.id]?.count || 0} 次 · 进度 +${todayStats[c.id]?.progress || 0}`
                      }
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {isPeriodic ? (
                        <>
                          <div className="rounded-md p-2 text-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                            <div className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>{c.streak_count}</div>
                            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>连续天数</div>
                          </div>
                          <div className="rounded-md p-2 text-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                            <div className="text-xl font-bold" style={{ color: 'var(--color-warning)' }}>{c.best_streak}</div>
                            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>最佳记录</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-md p-2 text-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                            <div className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>{todayStats[c.id]?.count || 0}</div>
                            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>今日次数</div>
                          </div>
                          <div className="rounded-md p-2 text-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                            <div className="text-xl font-bold" style={{ color: 'var(--color-success)' }}>+{todayStats[c.id]?.progress || 0}</div>
                            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>今日进度</div>
                          </div>
                        </>
                      )}
                      {!isPeriodic && c.target_count && (
                        <div className="col-span-2 rounded-md p-2" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>总进度</span>
                            <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>{c.current_count} / {c.target_count}</span>
                          </div>
                          <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--color-border-light)' }}>
                            <div 
                              className="h-2 rounded-full" 
                              style={{ width: `${Math.min((c.current_count / c.target_count) * 100, 100)}%`, backgroundColor: 'var(--color-accent)' }}
                            />
                          </div>
                        </div>
                      )}
                      {c.last_completed_at && (
                        <div className="col-span-2 rounded-md p-2 text-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                          <div className="text-sm" style={{ color: 'var(--color-text)' }}>
                            {new Date(c.last_completed_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>上次打卡</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex gap-2 mt-auto">
                      {isPeriodic ? (
                        isDoneToday ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleUndo(c)}
                          >
                            撤销打卡
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => setCheckinTarget(c)}
                          >
                            立即打卡
                          </Button>
                        )
                      ) : (
                        <Button 
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => setCheckinTarget(c)}
                        >
                          打卡 +1
                        </Button>
                      )}
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="text-xs px-3"
                        onClick={() => setDetailCirculation(c)}
                      >
                        详情
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Settings View */}
      {viewMode === 'settings' && (
        <>
          {/* Sub Tabs */}
          <div className="flex gap-2 mb-4">
            <div className="flex rounded-lg p-1" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  settingsTab === 'periodic'
                    ? ''
                    : ''
                }`}
                style={{
                  backgroundColor: settingsTab === 'periodic' ? 'var(--color-bg-card)' : 'transparent',
                  color: settingsTab === 'periodic' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: settingsTab === 'periodic' ? 'var(--shadow-card)' : 'none'
                }}
                onClick={() => setSettingsTab('periodic')}
              >
                周期打卡
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  settingsTab === 'count'
                    ? ''
                    : ''
                }`}
                style={{
                  backgroundColor: settingsTab === 'count' ? 'var(--color-bg-card)' : 'transparent',
                  color: settingsTab === 'count' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: settingsTab === 'count' ? 'var(--shadow-card)' : 'none'
                }}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCirculations.length === 0 ? (
              <Card className="col-span-full">
                <EmptyStateCard 
                  icon="🔄" 
                  title="今日暂无打卡" 
                  description="创建你的第一个打卡项来开始"
                  action={<Button onClick={() => setShowForm(true)}>+ 创建打卡</Button>}
                />
              </Card>
            ) : (
              filteredCirculations.map(c => (
                <Card key={c.id} className="hover:shadow-md transition-shadow">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <div 
                        className="font-semibold cursor-pointer hover:text-teal-600" 
                        style={{ color: 'var(--color-text)' }}
                        onClick={() => setDetailCirculation(c)}
                      >
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
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Button variant="secondary" size="sm" className="text-xs px-2 py-1" onClick={() => setDetailCirculation(c)}>
                        详情
                      </Button>
                      <Button variant="secondary" size="sm" className="text-xs px-2 py-1" onClick={() => openEdit(c)}>
                        编辑
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs px-2 py-1"
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
          onConfirm={(note, count) => handleCheckin(checkinTarget, note, count)}
          onCancel={() => setCheckinTarget(null)}
        />
      )}

      {/* Detail Modal */}
      {detailCirculation && (
        <CirculationDetailView
          id={detailCirculation.id}
          onClose={() => setDetailCirculation(null)}
        />
      )}
    </div>
  );
}
