'use client';

import { useState, useEffect } from 'react';
import { Card, ProgressBar, Checkbox } from '@/components/ui';
import { getTodos, getPlans, getTargets, Todo, Plan, Target } from '@/lib/api';

export function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);

  async function loadData() {
    try {
      const [todosData, plansData, targetsData] = await Promise.all([
        getTodos(),
        getPlans(),
        getTargets(),
      ]);
      setTodos(todosData);
      setPlans(plansData);
      setTargets(targetsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const todayTodos = todos.filter(t => t.due_date?.startsWith(today));
  const upcomingTodos = todos.filter(t => t.due_date && t.due_date > today && t.due_date <= threeDaysLater);
  const completedToday = todos.filter(t => t.status === 'done' && t.updated_at.startsWith(today));
  const activePlans = plans.filter(p => p.status === 'active');
  const activeTargets = targets.filter(t => t.status === 'active');

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold" style={{ color: '#134E4A' }}>
        今日总览
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-teal-600">{todayTodos.length}</div>
          <div className="text-sm text-gray-500 mt-1">今日待办</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-500">{upcomingTodos.length}</div>
          <div className="text-sm text-gray-500 mt-1">即将到期 (3天内)</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-teal-600">{completedToday.length}</div>
          <div className="text-sm text-gray-500 mt-1">今日完成</div>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card>
        <h3 className="font-semibold mb-4" style={{ color: '#134E4A' }}>今日待办</h3>
        {todayTodos.length === 0 ? (
          <p className="text-gray-400 text-sm">暂无今日待办</p>
        ) : (
          <div className="space-y-2">
            {todayTodos.map(todo => (
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

      {/* Active Plans & Targets */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4" style={{ color: '#134E4A' }}>进行中的计划</h3>
          {activePlans.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无进行中的计划</p>
          ) : (
            <div className="space-y-3">
              {activePlans.slice(0, 3).map(plan => (
                <div key={plan.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{plan.title}</span>
                  </div>
                  <ProgressBar value={0} color="teal" size="sm" />
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h3 className="font-semibold mb-4" style={{ color: '#134E4A' }}>进行中的目标</h3>
          {activeTargets.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无进行中的目标</p>
          ) : (
            <div className="space-y-3">
              {activeTargets.slice(0, 3).map(target => (
                <div key={target.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{target.title}</span>
                    <span className="text-teal-600">{target.progress}%</span>
                  </div>
                  <ProgressBar value={target.progress} color="orange" size="sm" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
