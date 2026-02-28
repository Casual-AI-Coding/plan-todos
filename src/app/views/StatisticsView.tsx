"use client";

import { Card, ProgressBar } from "@/components/ui";
import {
  TrendChart,
  HeatmapCalendar,
  DistributionChart,
} from "@/components/ui/charts";
import { useStatistics } from "@/hooks/useStatistics";
import { useMemo } from "react";
import { format, subDays } from "date-fns";

export function StatisticsView() {
  const { data, isLoading, error } = useStatistics();

  // All hooks must be called before any conditional returns
  const completionRate = useMemo(() => {
    if (!data) return 0;
    const completed = data.todos.filter((t) => t.status === "done").length;
    const total = data.todos.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [data]);

  // Replace the weeklyTrendData useMemo:
  const weeklyTrendData = useMemo(() => {
    if (!data?.todos) return [];

    const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Get counts for each day of the current week
    return days.map((day, i) => {
      const dayDate = new Date(today);
      dayDate.setDate(
        today.getDate() - dayOfWeek + i + (i < dayOfWeek ? 0 : -7) + 1,
      );
      const dateStr = format(dayDate, "yyyy-MM-dd");

      // Count todos due or completed on this day
      const dueCount = data.todos.filter((t) => t.due_date === dateStr).length;
      const completedCount = data.todos.filter(
        (t) => t.status === "done" && t.due_date === dateStr,
      ).length;

      return {
        date: day,
        value: completedCount + Math.round(dueCount * 0.3), // Weight: completed + 30% of due
      };
    });
  }, [data]);

  // Replace the heatmapData useMemo:
  const heatmapData = useMemo(() => {
    if (!data?.todos || !data?.circulations) return [];

    const result: { date: string; count: number }[] = [];
    const today = new Date();

    // Build a map of activity by date
    const activityMap = new Map<string, number>();

    // Add todo due dates
    data.todos.forEach((todo) => {
      if (todo.due_date) {
        const count = activityMap.get(todo.due_date) || 0;
        activityMap.set(todo.due_date, count + 1);
      }
    });

    // Add todo completions (approximate by updated_at for done todos)
    data.todos.forEach((todo) => {
      if (todo.status === "done" && todo.updated_at) {
        const date = todo.updated_at.split("T")[0];
        const count = activityMap.get(date) || 0;
        activityMap.set(date, count + 1);
      }
    });

    // Add circulation logs if available
    data.circulations.forEach((circ) => {
      // Use streak_count as a proxy for activity
      for (let i = 0; i < Math.min(circ.streak_count, 30); i++) {
        const date = subDays(today, i);
        const dateStr = format(date, "yyyy-MM-dd");
        const count = activityMap.get(dateStr) || 0;
        activityMap.set(dateStr, count + 1);
      }
    });

    // Generate 180 days of data
    for (let i = 180; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      result.push({
        date: dateStr,
        count: activityMap.get(dateStr) || 0,
      });
    }

    return result;
  }, [data]);

  // Todo distribution data for DistributionChart
  const todoDistributionData = useMemo(() => {
    if (!data?.todos) return [];

    const done = data.todos.filter((t) => t.status === "done").length;
    const todo = data.todos.filter((t) => t.status === "pending").length;
    const inProgress = data.todos.filter(
      (t) => t.status === "in-progress",
    ).length;

    return [
      { label: "已完成", value: done, color: "#22c55e" },
      { label: "待办", value: todo, color: "#f59e0b" },
      { label: "进行中", value: inProgress, color: "#3b82f6" },
    ].filter((item) => item.value > 0);
  }, [data]);

  if (error) {
    return (
      <div className="p-6" style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}>
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
      <div className="p-6" style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}>
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
    <div className="p-6" style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}>
      <h2
        className="text-2xl font-semibold mb-6"
        style={{ color: "var(--color-text)" }}
      >
        数据统计
      </h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

      {/* Todo Distribution & Activity Trend */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card>
          <h3
            className="font-medium mb-4"
            style={{ color: "var(--color-text)" }}
          >
            待办状态分布
          </h3>
          <DistributionChart
            data={todoDistributionData}
            showValues={true}
            animated={true}
          />
        </Card>

        <Card>
          <h3
            className="font-medium mb-4"
            style={{ color: "var(--color-text)" }}
          >
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
      </div>

      {/* Activity Heatmap - Last 6 Months */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: "var(--color-text)" }}>
          活动热力图 (近6个月)
        </h3>
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[600px]">
            <HeatmapCalendar
              data={heatmapData}
              months={6}
              color="var(--color-primary)"
            />
          </div>
        </div>
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
