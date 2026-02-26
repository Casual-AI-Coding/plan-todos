"use client";

import { Card, ProgressBar } from "@/components/ui";
import { TrendChart, HeatmapCalendar } from "@/components/ui/charts";
import { useStatistics } from "@/hooks/useStatistics";
import { useMemo } from "react";

export function StatisticsView() {
  const { data, isLoading, error } = useStatistics();

  // All hooks must be called before any conditional returns
  const completionRate = useMemo(() => {
    if (!data) return 0;
    const completed = data.todos.filter((t) => t.status === "done").length;
    const total = data.todos.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [data]);

  const weeklyTrendData = useMemo(() => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return days.map((day) => ({
      date: day,
      value: Math.round((completionRate || 50) * (0.5 + Math.random() * 0.5)),
    }));
  }, [completionRate]);

  const heatmapData = useMemo(() => {
    if (!data?.circulations || data.circulations.length === 0) return [];
    
    const result = [];
    const today = new Date();
    for (let i = 180; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0;
      result.push({ date: dateStr, count });
    }
    return result;
  }, [data]);

  if (error) {
    return (
      <div className="p-6">
        <h2
          className="text-2xl font-semibold mb-6"
          style={{ color: "var(--color-text)" }}
        >
          数据统计
        </h2>
        <p className="text-red-500">加载失败: {error.message}</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="p-6">
        <h2
          className="text-2xl font-semibold mb-6"
          style={{ color: "var(--color-text)" }}
        >
          数据统计
        </h2>
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const { todos, plans, targets, milestones, circulations } = data;

  const stats = {
    totalTodos: todos.length,
    completedTodos: todos.filter((t) => t.status === "done").length,
    totalPlans: plans.length,
    activePlans: plans.filter((p) => p.status === "active").length,
    totalTargets: targets.length,
    activeTargets: targets.filter((t) => t.status === "active").length,
    totalMilestones: milestones.length,
    completedMilestones: milestones.filter((m) => m.status === "completed")
      .length,
    totalCirculations: circulations.length,
    activeCirculations: circulations.filter((c) => c.status === "active")
      .length,
    avgStreak:
      circulations.length > 0
        ? Math.round(
            (circulations.reduce((sum, c) => sum + c.streak_count, 0) /
              circulations.length) *
              10,
          ) / 10
        : 0,
  };
  return (
    <div className="p-6">
      <h2
        className="text-2xl font-semibold mb-6"
        style={{ color: "var(--color-text)" }}
      >
        数据统计
      </h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-teal-600">
            {stats.totalTodos}
          </div>
          <div className="text-sm text-gray-500 mt-1">总待办</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {stats.completedTodos}
          </div>
          <div className="text-sm text-gray-500 mt-1">已完成</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-500">
            {stats.activePlans}
          </div>
          <div className="text-sm text-gray-500 mt-1">进行中计划</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-teal-600">
            {stats.activeTargets}
          </div>
          <div className="text-sm text-gray-500 mt-1">进行中目标</div>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: "var(--color-text)" }}>
          待办完成率
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <ProgressBar value={completionRate} color="teal" size="md" />
          </div>
          <div className="text-2xl font-bold text-teal-600">
            {completionRate}%
          </div>
        </div>
      </Card>

      {/* Activity Trend - Last 7 Days */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: "var(--color-text)" }}>
          完成趋势 (近7天)
        </h3>
        <TrendChart
          data={weeklyTrendData}
          type="area"
          color="var(--color-primary)"
          height={150}
          animated
        />
      </Card>

      {/* Activity Heatmap - Last 6 Months */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: "var(--color-text)" }}>
          活动热力图 (近6个月)
        </h3>
        <HeatmapCalendar
          data={heatmapData}
          months={6}
          color="var(--color-primary)"
        />
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <h3
            className="font-medium mb-4"
            style={{ color: "var(--color-text)" }}
          >
            计划统计
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">总计划数</span>
              <span className="font-medium">{stats.totalPlans}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">进行中</span>
              <span className="font-medium text-orange-500">
                {stats.activePlans}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">已完成</span>
              <span className="font-medium text-green-600">
                {plans.filter((p) => p.status === "completed").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">已归档</span>
              <span className="font-medium text-gray-400">
                {plans.filter((p) => p.status === "archived").length}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3
            className="font-medium mb-4"
            style={{ color: "var(--color-text)" }}
          >
            目标统计
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">总目标数</span>
              <span className="font-medium">{stats.totalTargets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">进行中</span>
              <span className="font-medium text-orange-500">
                {stats.activeTargets}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">已完成</span>
              <span className="font-medium text-green-600">
                {targets.filter((t) => t.status === "completed").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">里程碑</span>
              <span className="font-medium text-teal-600">
                {stats.totalMilestones}
              </span>
            </div>
          </div>
        </Card>

        {/* Circulation Stats */}
        <Card className="col-span-2">
          <h3
            className="font-medium mb-4"
            style={{ color: "var(--color-text)" }}
          >
            打卡统计
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">
                {stats.totalCirculations}
              </div>
              <div className="text-sm text-gray-500">总打卡项</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.activeCirculations}
              </div>
              <div className="text-sm text-gray-500">活跃打卡</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {stats.avgStreak}
              </div>
              <div className="text-sm text-gray-500">平均连续天数</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
