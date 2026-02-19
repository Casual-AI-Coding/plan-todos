'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button } from '@/components/ui';
import {
  getCirculation,
  getCirculationLogs,
  checkinCirculation,
  undoCheckinCirculation,
  Circulation,
  CirculationLog,
} from '@/lib/api';
import { CheckinConfirm } from '@/components/ui/CheckinConfirm';

interface CirculationDetailViewProps {
  id: string;
  onBack: () => void;
}

export function CirculationDetailView({ id, onBack }: CirculationDetailViewProps) {
  const [circulation, setCirculation] = useState<Circulation | null>(null);
  const [logs, setLogs] = useState<CirculationLog[]>([]);
  const [checkinTarget, setCheckinTarget] = useState<Circulation | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoaded = useRef(false);

  async function loadData() {
    try {
      const [c, l] = await Promise.all([
        getCirculation(id),
        getCirculationLogs(id, 20),
      ]);
      if (isLoaded.current) {
        setCirculation(c);
        setLogs(l);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isLoaded.current) setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoaded.current) {
      isLoaded.current = true;
      loadData();
    }
  }, []);

  const isCompletedToday = (): boolean => {
    if (!circulation?.last_completed_at) return false;
    const today = new Date().toISOString().split('T')[0];
    return circulation.last_completed_at.startsWith(today);
  };

  async function handleCheckin(note: string = '') {
    if (!circulation) return;
    try {
      await checkinCirculation(circulation.id, note);
      await loadData();
      setCheckinTarget(null);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : '打卡失败');
    }
  }

  async function handleUndo() {
    if (!circulation || !confirm('确定要撤销今天的打卡吗？')) return;
    try {
      await undoCheckinCirculation(circulation.id);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!circulation) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-gray-500">打卡项不存在</div>
        <Button onClick={onBack}>返回</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" onClick={onBack}>
          ← 返回
        </Button>
        <h2 className="text-2xl font-semibold" style={{ color: '#134E4A' }}>
          {circulation.title}
        </h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600">
              {circulation.streak_count}
            </div>
            <div className="text-sm text-gray-500 mt-1">当前连续</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500">
              {circulation.best_streak}
            </div>
            <div className="text-sm text-gray-500 mt-1">最佳记录</div>
          </div>
        </Card>
        {circulation.circulation_type === 'count' && (
          <>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">
                  {circulation.current_count}
                </div>
                <div className="text-sm text-gray-500 mt-1">已完成</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {circulation.target_count || '∞'}
                </div>
                <div className="text-sm text-gray-500 mt-1">目标</div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        {isCompletedToday() ? (
          <Button variant="secondary" onClick={handleUndo}>
            撤销打卡
          </Button>
        ) : (
          <Button onClick={() => setCheckinTarget(circulation)}>
            立即打卡
          </Button>
        )}
      </div>

      {/* History */}
      <Card>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#134E4A' }}>
          打卡记录
        </h3>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无记录</div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div
                key={log.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <div className="text-sm text-gray-900">
                    {new Date(log.completed_at).toLocaleString('zh-CN')}
                  </div>
                  {log.period && (
                    <div className="text-xs text-gray-400">周期: {log.period}</div>
                  )}
                </div>
                {log.note && (
                  <div className="text-sm text-gray-500">{log.note}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Checkin Modal */}
      {checkinTarget && (
        <CheckinConfirm
          circulation={checkinTarget}
          open={!!checkinTarget}
          onConfirm={(note) => handleCheckin(note)}
          onCancel={() => setCheckinTarget(null)}
        />
      )}
    </div>
  );
}
