'use client';

import { useState, useEffect } from 'react';
import { Card, ProgressBar, Checkbox } from '@/components/ui';
import { getDashboard, type Dashboard } from '@/lib/api';

export function Dashboard() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  async function loadData() {
    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (!dashboard) {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-semibold" style={{ color: '#134E4A' }}>
          今日总览
        </h2>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">加载中...</div>
        </div>
      </div>
    );
  }

  const { overview, week, counts, today_todos, overdue_todos, completed_today, active_plans, active_targets, active_milestones } = dashboard;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold" style={{ color: '#134E4A' }}>
        今日总览
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-teal-600">{overview.today_todos_count}</div>
          <div className="text-sm text-gray-500 mt-1">今日待办</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-500">{overview.upcoming_3days_count}</div>
          <div className="text-sm text-gray-500 mt-1">即将到期 (3天内)</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-teal-600">{overview.completed_today_count}</div>
          <div className="text-sm text-gray-500 mt-1">今日完成</div>
        </Card>
      </div>

      {/* Entity Counts */}
      <div className="grid grid-cols-6 gap-2">
        <Card className="text-center py-2">
          <div className="text-lg font-semibold text-teal-600">{counts.todo}</div>
          <div className="text-xs text-gray-500">待办</div>
        </Card>
        <Card className="text-center py-2">
          <div className="text-lg font-semibold text-teal-600">{counts.plan}</div>
          <div className="text-xs text-gray-500">计划</div>
        </Card>
        <Card className="text-center py-2">
          <div className="text-lg font-semibold text-teal-600">{counts.task}</div>
          <div className="text-xs text-gray-500">任务</div>
        </Card>
        <Card className="text-center py-2">
          <div className="text-lg font-semibold text-teal-600">{counts.target}</div>
          <div className="text-xs text-gray-500">目标</div>
        </Card>
        <Card className="text-center py-2">
          <div className="text-lg font-semibold text-teal-600">{counts.milestone}</div>
          <div className="text-xs text-gray-500">里程碑</div>
        </Card>
        <Card className="text-center py-2">
          <div className="text-lg font-semibold text-teal-600">{week.completed_count}</div>
          <div className="text-xs text-gray-500">本周完成</div>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card>
        <h3 className="font-semibold mb-4" style={{ color: '#134E4A' }}>今日待办</h3>
        {today_todos.length === 0 ? (
          <p className="text-gray-400 text-sm">暂无今日待办</p>
        ) : (
          <div className="space-y-2">
            {today_todos.map(todo => (
              <div key={todo.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <Checkbox checked={todo.status === 'done'} readOnly />
                <span className={todo.status === 'done' ? 'line-through text-gray-400' : ''}>
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
          <h3 className="font-semibold mb-4 text-red-500">已过期</h3>
          <div className="space-y-2">
            {overdue_todos.map(todo => (
              <div key={todo.id} className="flex items-center gap-3 p-2 bg-red-50 rounded">
                <Checkbox checked={todo.status === 'done'} readOnly />
                <span className={todo.status === 'done' ? 'line-through text-gray-400' : ''}>
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
          <h3 className="font-semibold mb-4" style={{ color: '#134E4A' }}>进行中的计划</h3>
          {active_plans.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无进行中的计划</p>
          ) : (
            <div className="space-y-3">
              {active_plans.slice(0, 3).map(plan => (
                <div key={plan.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{plan.title}</span>
                    <span className="text-teal-600">{plan.completed_count}/{plan.task_count}</span>
                  </div>
                  <ProgressBar value={plan.progress} color="teal" size="sm" />
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h3 className="font-semibold mb-4" style={{ color: '#134E4A' }}>进行中的目标</h3>
          {active_targets.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无进行中的目标</p>
          ) : (
            <div className="space-y-3">
              {active_targets.slice(0, 3).map(target => (
                <div key={target.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{target.title}</span>
                    <span className="text-orange-500">{target.progress}%</span>
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
