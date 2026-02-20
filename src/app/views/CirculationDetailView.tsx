'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, Modal } from '@/components/ui';
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
  onBack?: () => void;
  onClose?: () => void;
}

export function CirculationDetailView({ id, onBack, onClose }: CirculationDetailViewProps) {
  const [circulation, setCirculation] = useState<Circulation | null>(null);
  const [logs, setLogs] = useState<CirculationLog[]>([]);
  const [checkinTarget, setCheckinTarget] = useState<Circulation | null>(null);
  const [loading, setLoading] = useState(true);

  const isModal = !!onClose;
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

  async function handleCheckin(note: string = '', count?: number) {
    if (!circulation) return;
    try {
      await checkinCirculation(circulation.id, note, count);
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

  const detailContent = circulation ? (
    <>
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
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          打卡记录
        </h3>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无记录</div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">时间</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">
                    {circulation?.circulation_type === 'count' ? '进度' : '周期'}
                  </th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">备注</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700">
                      {new Date(log.completed_at).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {circulation?.circulation_type === 'count' 
                        ? (log.count !== null ? `+${log.count}` : '-')
                        : (log.period || '-')}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {log.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Checkin Modal */}
      {checkinTarget && (
        <CheckinConfirm
          circulation={checkinTarget}
          open={!!checkinTarget}
          onConfirm={(note, count) => handleCheckin(note, count)}
          onCancel={() => setCheckinTarget(null)}
        />
      )}
    </>
  ) : null;

  if (loading) {
    if (isModal) {
      return (
        <Modal open={true} title="加载中..." onClose={onClose}>
          <div className="text-center py-8 text-gray-500">加载中...</div>
        </Modal>
      );
    }
    return (
      <div className="p-6">
        <div className="text-center py-8 text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!circulation) {
    if (isModal) {
      return (
        <Modal open={true} title="打卡项不存在" onClose={onClose}>
          <div className="text-center py-8 text-gray-500">打卡项不存在</div>
        </Modal>
      );
    }
    return (
      <div className="p-6">
        <div className="text-center py-8 text-gray-500">打卡项不存在</div>
        <Button onClick={onBack}>返回</Button>
      </div>
    );
  }

  if (isModal) {
    return (
      <Modal
        open={true}
        title={circulation.title}
        onClose={onClose}
        width="lg"
      >
        {detailContent}
      </Modal>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {onBack && (
          <Button variant="secondary" onClick={onBack}>
            ← 返回
          </Button>
        )}
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>
          {circulation.title}
        </h2>
      </div>
      {detailContent}
    </div>
  );
}

