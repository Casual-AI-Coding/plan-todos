'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, ProgressBar, Checkbox } from '@/components/ui';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { getDashboard, type Dashboard } from '@/lib/api';

export function Dashboard() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const isLoaded = useRef(false);

  async function loadData() {
    try {
      const data = await getDashboard();
      if (isLoaded.current) setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (isLoaded.current) return; isLoaded.current = true; loadData(); }, []);

  if (!dashboard) {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>
          今日总览
        </h2>
        <div className="flex items-center justify-center h-64">
          <div style={{ color: 'var(--color-text-muted)' }}>加载中...</div>
        </div>
      </div>
    );
  }

  const { overview, week, counts, today_todos, overdue_todos, completed_today, active_plans, active_targets, active_milestones } = dashboard;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>
        今日总览
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{overview.today_todos_count}</div>
          <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>今日待办</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--color-warning)' }}>{overview.upcoming_3days_count}</div>
          <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>即将到期 (3天内)</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{overview.completed_today_count}</div>
          <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>今日完成</div>
        </Card>
      </div>

      {/* Entity Counts */}
      <div className="grid grid-cols-7 gap-2">
        <Card className="text-center py-2">
          <div className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>{counts.todo}</div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>待办</div>
        </Card>
        <Card className="text-center py-2">
          <div className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>{counts.plan}</div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>计划</div>
        </Card>
        <Card className="text-center py-2">
          <div className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>{counts.task}</div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>任务</div>
        </Card>
        <Card className="text-center py-2">
          <div className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>{counts.target}</div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>目标</div>
        </Card>
        <Card className="text-center py-2">
          <div className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>{counts.milestone}</div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>里程碑</div>
        </Card>
        <Card className="text-center py-2">
          <div className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>{counts.circulation || 0}</div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>打卡</div>
        </Card>
        <Card className="text-center py-2">
          <div className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>{week.completed_count}</div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>本周完成</div>
        </Card>
      </div>

      {/* Circulation Stats */}
      {dashboard.circulation_stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{dashboard.circulation_stats.today_pending}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>今日待打卡</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold" style={{ color: 'var(--color-success)' }}>{dashboard.circulation_stats.today_completed}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>今日已完成</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold" style={{ color: 'var(--color-warning)' }}>{dashboard.circulation_stats.current_streak}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>当前最长连续</div>
          </Card>
        </div>
      )}

      {/* Progress Rings */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="flex flex-col items-center justify-center py-6">
          <ProgressRing 
            value={overview.productivity_score || 0} 
            size={100}
            strokeWidth={8}
            label="效率"
          />
          <div className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>效率评分</div>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6">
          <ProgressRing 
            value={overview.completed_today_count > 0 ? Math.min(100, (overview.completed_today_count / overview.today_todos_count) * 100) : 0} 
            size={100}
            strokeWidth={8}
            label="完成"
          />
          <div className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>今日进度</div>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6">
          <ProgressRing 
            value={dashboard.circulation_stats ? Math.min(100, (dashboard.circulation_stats.current_streak / 30) * 100) : 0} 
            size={100}
            strokeWidth={8}
            label="连续"
          />
          <div className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>30天连续</div>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>今日待办</h3>
        {today_todos.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>暂无今日待办</p>
        ) : (
          <div className="space-y-2">
            {today_todos.map(todo => (
              <div key={todo.id} className="flex items-center gap-3 p-2 rounded" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                <Checkbox checked={todo.status === 'done'} readOnly />
                <span className={todo.status === 'done' ? 'line-through' : ''} style={{ color: todo.status === 'done' ? 'var(--color-text-muted)' : 'var(--color-text)' }}>
                  {todo.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Overdue Tasks */}
      {overdue_todos.length > 0 && (
        <Card>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-error)' }}>已过期</h3>
          <div className="space-y-2">
            {overdue_todos.map(todo => (
              <div key={todo.id} className="flex items-center gap-3 p-2 rounded" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                <Checkbox checked={todo.status === 'done'} readOnly />
                <span className={todo.status === 'done' ? 'line-through' : ''} style={{ color: todo.status === 'done' ? 'var(--color-text-muted)' : 'var(--color-text)' }}>
                  {todo.title}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Active Plans & Targets */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>进行中的计划</h3>
          {active_plans.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>暂无进行中的计划</p>
          ) : (
            <div className="space-y-3">
              {active_plans.slice(0, 3).map(plan => (
                <div key={plan.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: 'var(--color-text)' }}>{plan.title}</span>
                    <span style={{ color: 'var(--color-primary)' }}>{plan.completed_count}/{plan.task_count}</span>
                  </div>
                  <ProgressBar value={plan.progress} color="teal" size="sm" />
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>进行中的目标</h3>
          {active_targets.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>暂无进行中的目标</p>
          ) : (
            <div className="space-y-3">
              {active_targets.slice(0, 3).map(target => (
                <div key={target.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: 'var(--color-text)' }}>{target.title}</span>
                    <span style={{ color: 'var(--color-warning)' }}>{target.progress}%</span>
                  </div>
                  <ProgressBar value={target.progress} color="orange" size="sm" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Active Milestones */}
      {active_milestones.length > 0 && (
        <Card>
          <h3 className="font-semibold mb-4" style={{ color: '#134E4A' }}>进行中的里程碑</h3>
          <div className="space-y-3">
            {active_milestones.slice(0, 3).map(milestone => (
              <div key={milestone.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{milestone.title}</span>
                  <span className="text-teal-600">{milestone.progress}%</span>
                </div>
                <ProgressBar value={milestone.progress} color="teal" size="sm" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
