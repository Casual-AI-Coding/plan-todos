/**
 * Statistics Types
 *
 * Type definitions for Statistics and Dashboard.
 * These types define the structure for analytics and overview data.
 */

/**
 * Statistics - 统计分析
 * Represents comprehensive statistics about the user's data.
 */
export interface Statistics {
  counts: {
    todo: number;
    plan: number;
    task: number;
    target: number;
    step: number;
    milestone: number;
  };
  completion: {
    todo_done: number;
    todo_total: number;
    task_done: number;
    task_total: number;
    step_completed: number;
    step_total: number;
    milestone_done: number;
    milestone_total: number;
    todo_completion_rate: number;
    task_completion_rate: number;
    step_completion_rate: number;
    milestone_completion_rate: number;
  };
  trends: {
    daily: Array<{
      date: string;
      completed: number;
    }>;
  };
  efficiency: {
    streak_days: number;
    today_completed: number;
    week_completed: number;
    month_completed: number;
    productivity_score: number;
  };
}

/**
 * Dashboard - 仪表盘
 * Represents the dashboard overview data.
 */
export interface Dashboard {
  // 今日概览
  overview: {
    today_todos_count: number;
    upcoming_3days_count: number;
    completed_today_count: number;
    overdue_count: number;
    streak_days: number;
    productivity_score: number;
  };
  // 本周统计
  week: {
    completed_count: number;
  };
  // 实体数量
  counts: {
    todo: number;
    plan: number;
    task: number;
    target: number;
    step: number;
    milestone: number;
    circulation: number;
  };
  // 打卡统计
  circulation_stats?: {
    today_pending: number;
    today_completed: number;
    current_streak: number;
  };
  // 今日待办
  today_todos: Array<{
    id: string;
    title: string;
    due_date: string | null;
    status: string;
    priority: string;
  }>;
  // 过期待办
  overdue_todos: Array<{
    id: string;
    title: string;
    due_date: string | null;
    status: string;
    priority: string;
  }>;
  // 今日完成
  completed_today: Array<{
    id: string;
    title: string;
    due_date: string | null;
    status: string;
    priority: string;
  }>;
  // 进行中的计划
  active_plans: Array<{
    id: string;
    title: string;
    progress: number;
    task_count: number;
    completed_count: number;
  }>;
  // 进行中的目标
  active_targets: Array<{
    id: string;
    title: string;
    progress: number;
    due_date: string | null;
  }>;
  // 进行中的里程碑
  active_milestones: Array<{
    id: string;
    title: string;
    progress: number;
    target_date: string | null;
  }>;
}
