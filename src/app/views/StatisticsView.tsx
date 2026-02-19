'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, ProgressBar } from '@/components/ui';
import { getTodos, getPlans, getTargets, getMilestones, Todo, Plan, Target, Milestone } from '@/lib/api';

export function StatisticsView() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const isLoaded = useRef(false);

  async function loadData() {
    try {
      const [t, p, tg, m] = await Promise.all([
        getTodos(), getPlans(), getTargets(), getMilestones()
      ]);
      if (isLoaded.current) {
        setTodos(t);
        setPlans(p);
        setTargets(tg);
        setMilestones(m);
      }
    } catch (e) { console.error(e); }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (isLoaded.current) return; isLoaded.current = true; loadData(); }, []);

  const stats = {
    totalTodos: todos.length,
    completedTodos: todos.filter(t => t.status === 'done').length,
    totalPlans: plans.length,
    activePlans: plans.filter(p => p.status === 'active').length,
    totalTargets: targets.length,
    activeTargets: targets.filter(t => t.status === 'active').length,
    totalMilestones: milestones.length,
    completedMilestones: milestones.filter(m => m.status === 'completed').length,
  };

  const completionRate = stats.totalTodos > 0 
    ? Math.round((stats.completedTodos / stats.totalTodos) * 100) 
    : 0;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6" style={{ color: '#134E4A' }}>数据统计</h2>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-teal-600">{stats.totalTodos}</div>
          <div className="text-sm text-gray-500 mt-1">总待办</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats.completedTodos}</div>
          <div className="text-sm text-gray-500 mt-1">已完成</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-500">{stats.activePlans}</div>
          <div className="text-sm text-gray-500 mt-1">进行中计划</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-teal-600">{stats.activeTargets}</div>
          <div className="text-sm text-gray-500 mt-1">进行中目标</div>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: '#134E4A' }}>待办完成率</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <ProgressBar value={completionRate} color="teal" size="md" />
          </div>
          <div className="text-2xl font-bold text-teal-600">{completionRate}%</div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <h3 className="font-medium mb-4" style={{ color: '#134E4A' }}>计划统计</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">总计划数</span>
              <span className="font-medium">{stats.totalPlans}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">进行中</span>
              <span className="font-medium text-orange-500">{stats.activePlans}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">已完成</span>
              <span className="font-medium text-green-600">{plans.filter(p => p.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">已归档</span>
              <span className="font-medium text-gray-400">{plans.filter(p => p.status === 'archived').length}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-medium mb-4" style={{ color: '#134E4A' }}>目标统计</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">总目标数</span>
              <span className="font-medium">{stats.totalTargets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">进行中</span>
              <span className="font-medium text-orange-500">{stats.activeTargets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">已完成</span>
              <span className="font-medium text-green-600">{targets.filter(t => t.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">里程碑</span>
              <span className="font-medium text-teal-600">{stats.totalMilestones}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
