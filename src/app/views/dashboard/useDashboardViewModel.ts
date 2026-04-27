"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { useUpdateTodo } from "@/hooks/useTodos";
import { useNavigationStore } from "@/stores/navigation";
import type { Dashboard, StatisticsTodoStatus } from "@/lib/types";
import type { UpdateTodoInput } from "@/domain/todo/todoTypes";

interface DashboardTodo {
  id: string;
  title: string;
  due_date: string | null;
  status: StatisticsTodoStatus;
  priority: string;
}

export interface DashboardViewModel {
  dashboard: Dashboard | undefined;
  stats: {
    todayTodosCount: number;
    upcoming3DaysCount: number;
    completedTodayCount: number;
  };
  entityCounts: {
    todo: number;
    plan: number;
    task: number;
    target: number;
    milestone: number;
    circulation: number;
    weekCompleted: number;
  };
  circulationStats: {
    todayPending: number;
    todayCompleted: number;
    currentStreak: number;
  } | null;
  progressMetrics: {
    productivityScore: number;
    todayProgress: number;
    streakProgress: number;
  };
  todayTodos: DashboardTodo[];
  overdueTodos: DashboardTodo[];
  activePlans: Dashboard["active_plans"];
  activeTargets: Dashboard["active_targets"];
  activeMilestones: Dashboard["active_milestones"];
  isLoading: boolean;
  error: Error | null;
  handleToggleTodo: (id: string, currentStatus: StatisticsTodoStatus) => void;
  handleNavigateToEntity: (type: string, id: string) => void;
}

export function useDashboardViewModel(): DashboardViewModel {
  const { data: dashboard, isLoading, error } = useDashboard();
  const updateTodo = useUpdateTodo();
  const navigate = useNavigationStore((s) => s.navigate);

  const stats = {
    todayTodosCount: dashboard?.overview.today_todos_count ?? 0,
    upcoming3DaysCount: dashboard?.overview.upcoming_3days_count ?? 0,
    completedTodayCount: dashboard?.overview.completed_today_count ?? 0,
  };

  const entityCounts = {
    todo: dashboard?.counts.todo ?? 0,
    plan: dashboard?.counts.plan ?? 0,
    task: dashboard?.counts.task ?? 0,
    target: dashboard?.counts.target ?? 0,
    milestone: dashboard?.counts.milestone ?? 0,
    circulation: dashboard?.counts.circulation ?? 0,
    weekCompleted: dashboard?.week.completed_count ?? 0,
  };

  const circulationStats = dashboard?.circulation_stats
    ? {
        todayPending: dashboard.circulation_stats.today_pending,
        todayCompleted: dashboard.circulation_stats.today_completed,
        currentStreak: dashboard.circulation_stats.current_streak,
      }
    : null;

  const todayTotal = dashboard?.overview.today_todos_count ?? 0;
  const todayCompleted = dashboard?.overview.completed_today_count ?? 0;

  const progressMetrics = {
    productivityScore: dashboard?.overview.productivity_score ?? 0,
    todayProgress:
      todayTotal > 0 ? Math.min(100, (todayCompleted / todayTotal) * 100) : 0,
    streakProgress: dashboard?.circulation_stats
      ? Math.min(
          100,
          (dashboard.circulation_stats.current_streak / 30) * 100,
        )
      : 0,
  };

  function handleToggleTodo(id: string, currentStatus: StatisticsTodoStatus) {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    updateTodo.mutate({ id, status: newStatus } as UpdateTodoInput);
  }

  function handleNavigateToEntity(type: string, _id: string) {
    navigate(type);
  }

  return {
    dashboard,
    stats,
    entityCounts,
    circulationStats,
    progressMetrics,
    todayTodos: dashboard?.today_todos ?? [],
    overdueTodos: dashboard?.overdue_todos ?? [],
    activePlans: dashboard?.active_plans ?? [],
    activeTargets: dashboard?.active_targets ?? [],
    activeMilestones: dashboard?.active_milestones ?? [],
    isLoading,
    error: error ?? null,
    handleToggleTodo,
    handleNavigateToEntity,
  };
}
