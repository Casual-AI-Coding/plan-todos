// Types for Plan Todos Application

// ============================================================================
// Plan - 长期计划
// ============================================================================
export interface Plan {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Task - 短期任务
// ============================================================================
export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

// ============================================================================
// Tag - 标签
// ============================================================================
export interface Tag {
  id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
}

export type EntityType = 'todo' | 'plan' | 'target';

export interface Task {
  id: string;
  plan_id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'pending' | 'in-progress' | 'done';
  priority: Priority;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Target - 长期目标
// ============================================================================
export interface Target {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: 'active' | 'completed' | 'archived';
  progress: number; // 0-100, calculated from Steps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Step - 步骤
// ============================================================================
export interface Step {
  id: string;
  target_id: string;
  title: string;
  weight: number; // 0-100
  status: 'pending' | 'completed';
  priority: Priority;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Todo - 短期事项
// ============================================================================
export interface Todo {
  id: string;
  title: string;
  content: string | null;
  due_date: string | null;
  status: 'pending' | 'in-progress' | 'done';
  priority: Priority;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

// ============================================================================
// Milestone - 里程碑
// ============================================================================
export interface Milestone {
  id: string;
  title: string;
  target_date: string | null;
  // Unified fields for flexible linking
  biz_type: string | null; // 'plan' | 'task' | 'target' | 'circulation'
  biz_id: string | null;
  status: 'pending' | 'completed';
  progress: number; // 0-100, calculated from linked entity
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Circulation - 打卡
// ============================================================================
export type CirculationType = 'periodic' | 'count';
export type PeriodicFrequency = 'daily' | 'weekly' | 'monthly';

export interface Circulation {
  id: string;
  title: string;
  content: string | null;
  circulation_type: CirculationType;
  frequency: PeriodicFrequency | null; // periodic only
  frequency_config: string | null; // JSON config
  target_count: number | null; // count only
  current_count: number;
  streak_count: number; // periodic only
  best_streak: number; // periodic only
  last_completed_at: string | null;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CirculationLog {
  id: string;
  circulation_id: string;
  completed_at: string;
  note: string | null;
  period: string | null; // "2024-W05" / "2024-02"
}

export interface CreateCirculationParams {
  title: string;
  circulation_type: CirculationType;
  frequency?: PeriodicFrequency;
  frequency_config?: string;
  target_count?: number;
}

export interface UpdateCirculationParams {
  title?: string;
  circulation_type?: CirculationType;
  frequency?: PeriodicFrequency;
  frequency_config?: string;
  target_count?: number;
  status?: 'active' | 'archived';
}

// Check if running in Tauri environment
// Exported for testing purposes
export function isTauri(): boolean {
  if (typeof window === 'undefined') return false;
  return '__TAURI__' in window;
}

// ============================================================================
// API Functions - Plan
// ============================================================================

export async function getPlan(id: string): Promise<Plan> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to get plan');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Plan>('get_plan', { id });
}

export async function getPlans(): Promise<Plan[]> {
  if (!isTauri()) {
    console.warn('Running outside Tauri - data not available');
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Plan[]>('get_plans');
}

export async function createPlan(data: {
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}): Promise<Plan> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to create plans');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Plan>('create_plan', {
    title: data.title,
    description: data.description || null,
    startDate: data.start_date || null,
    endDate: data.end_date || null,
  });
}

export async function updatePlan(id: string, data: {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: 'active' | 'completed' | 'archived';
}): Promise<Plan> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to update plans');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Plan>('update_plan', {
    id,
    title: data.title,
    description: data.description,
    startDate: data.start_date,
    endDate: data.end_date,
    status: data.status,
  });
}

export async function deletePlan(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to delete plans');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<void>('delete_plan', { id });
}

// ============================================================================
// API Functions - Task
// ============================================================================

export async function getTask(id: string): Promise<Task> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to get task');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Task>('get_task', { id });
}

export async function getTasks(): Promise<Task[]> {
  if (!isTauri()) {
    console.warn('Running outside Tauri - data not available');
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Task[]>('get_tasks');
}

export async function getTasksByPlan(planId: string): Promise<Task[]> {
  if (!isTauri()) {
    console.warn('Running outside Tauri - data not available');
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Task[]>('get_tasks_by_plan', { planId });
}

export async function createTask(data: {
  plan_id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  priority?: Priority;
}): Promise<Task> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to create tasks');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Task>('create_task', {
    planId: data.plan_id,
    title: data.title,
    description: data.description || null,
    startDate: data.start_date || null,
    endDate: data.end_date || null,
    priority: data.priority || null,
  });
}

export async function updateTask(id: string, data: {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: 'pending' | 'in-progress' | 'done';
  priority?: Priority;
}): Promise<Task> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to update tasks');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Task>('update_task', {
    id,
    title: data.title,
    description: data.description,
    startDate: data.start_date,
    endDate: data.end_date,
    status: data.status,
    priority: data.priority,
  });
}

export async function deleteTask(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to delete tasks');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<void>('delete_task', { id });
}

// ============================================================================
// API Functions - Target
// ============================================================================

export async function getTarget(id: string): Promise<Target> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to get target');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Target>('get_target', { id });
}

export async function getTargets(): Promise<Target[]> {
  if (!isTauri()) {
    console.warn('Running outside Tauri - data not available');
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Target[]>('get_targets');
}

export async function createTarget(data: {
  title: string;
  description?: string;
  due_date?: string;
}): Promise<Target> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to create targets');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Target>('create_target', {
    title: data.title,
    description: data.description || null,
    dueDate: data.due_date || null,
  });
}

export async function updateTarget(id: string, data: {
  title?: string;
  description?: string;
  due_date?: string;
  status?: 'active' | 'completed' | 'archived';
}): Promise<Target> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to update targets');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Target>('update_target', {
    id,
    title: data.title,
    description: data.description,
    dueDate: data.due_date,
    status: data.status,
  });
}

export async function deleteTarget(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to delete targets');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<void>('delete_target', { id });
}

// ============================================================================
// API Functions - Step
// ============================================================================

export async function getSteps(targetId: string): Promise<Step[]> {
  if (!isTauri()) {
    console.warn('Running outside Tauri - data not available');
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Step[]>('get_steps', { targetId });
}

export async function createStep(data: {
  target_id: string;
  title: string;
  weight: number;
  priority?: Priority;
}): Promise<Step> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to create steps');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Step>('create_step', {
    targetId: data.target_id,
    title: data.title,
    weight: data.weight,
    priority: data.priority || null,
  });
}

export async function updateStep(id: string, data: {
  title?: string;
  weight?: number;
  status?: 'pending' | 'completed';
  priority?: Priority;
}): Promise<Step> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to update steps');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Step>('update_step', {
    id,
    title: data.title,
    weight: data.weight,
    status: data.status,
    priority: data.priority,
  });
}

export async function deleteStep(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to delete steps');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<void>('delete_step', { id });
}

// ============================================================================
// API Functions - Todo
// ============================================================================

export async function getTodo(id: string): Promise<Todo> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to get todo');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Todo>('get_todo', { id });
}

export async function getTodos(): Promise<Todo[]> {
  if (!isTauri()) {
    console.warn('Running outside Tauri - data not available');
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Todo[]>('get_todos');
}

export async function createTodo(data: {
  title: string;
  content?: string;
  due_date?: string;
  priority?: Priority;
}): Promise<Todo> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to create todos');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Todo>('create_todo', {
    title: data.title,
    content: data.content || null,
    dueDate: data.due_date || null,
    priority: data.priority || null,
  });
}

export async function updateTodo(id: string, data: {
  title?: string;
  content?: string;
  due_date?: string;
  status?: 'pending' | 'in-progress' | 'done';
  priority?: Priority;
}): Promise<Todo> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to update todos');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Todo>('update_todo', {
    id,
    title: data.title,
    content: data.content,
    dueDate: data.due_date,
    status: data.status,
    priority: data.priority,
  });
}

export async function deleteTodo(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to delete todos');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<void>('delete_todo', { id });
}

// ============================================================================
// API Functions - Milestone
// ============================================================================

export async function getMilestone(id: string): Promise<Milestone> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to get milestone');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Milestone>('get_milestone', { id });
}

export async function getMilestones(): Promise<Milestone[]> {
  if (!isTauri()) {
    console.warn('Running outside Tauri - data not available');
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Milestone[]>('get_milestones');
}

export async function createMilestone(data: {
  title: string;
  target_date?: string;
  biz_type?: string;
  biz_id?: string;
}): Promise<Milestone> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to create milestones');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Milestone>('create_milestone', {
    title: data.title,
    targetDate: data.target_date || null,
    bizType: data.biz_type || null,
    bizId: data.biz_id || null,
  });
}

export async function updateMilestone(id: string, data: {
  title?: string;
  target_date?: string;
  status?: 'pending' | 'completed';
}): Promise<Milestone> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to update milestones');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Milestone>('update_milestone', {
    id,
    title: data.title,
    targetDate: data.target_date,
    status: data.status,
  });
}

export async function deleteMilestone(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to delete milestones');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<void>('delete_milestone', { id });
}

// ============================================================================
// Statistics
// ============================================================================

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

// ============================================================================
// Search
// ============================================================================

export interface SearchResult {
  entity_type: string;
  id: string;
  title: string;
  content: string | null;
  status: string;
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!isTauri()) {
    console.warn('Running outside Tauri - search not available');
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<SearchResult[]>('search_all', { query });
}

// ============================================================================
// Dashboard API
// ============================================================================

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

export async function getDashboard(): Promise<Dashboard> {
  if (!isTauri()) {
    console.warn('Running outside Tauri - returning mock data');
    return {
      overview: {
        today_todos_count: 0,
        upcoming_3days_count: 0,
        completed_today_count: 0,
        overdue_count: 0,
        streak_days: 0,
        productivity_score: 0,
      },
      week: { completed_count: 0 },
      counts: { todo: 0, plan: 0, task: 0, target: 0, step: 0, milestone: 0, circulation: 0 },
      circulation_stats: { today_pending: 0, today_completed: 0, current_streak: 0 },
      today_todos: [],
      overdue_todos: [],
      completed_today: [],
      active_plans: [],
      active_targets: [],
      active_milestones: [],
    };
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Dashboard>('get_dashboard');
}

// ============================================================================
// Batch Operations
// ============================================================================

export interface BatchUpdateResult {
  updated: number;
  failed: Array<{
    id: string;
    error: string;
  }>;
}

export async function bulkUpdateTodoStatus(
  ids: string[],
  status: string
): Promise<BatchUpdateResult> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<BatchUpdateResult>('bulk_update_todo_status', { ids, status });
}

export async function bulkUpdateTaskStatus(
  ids: string[],
  status: string
): Promise<BatchUpdateResult> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<BatchUpdateResult>('bulk_update_task_status', { ids, status });
}

export async function bulkUpdateStepStatus(
  ids: string[],
  status: string
): Promise<BatchUpdateResult> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<BatchUpdateResult>('bulk_update_step_status', { ids, status });
}

export async function bulkDeleteTodos(ids: string[]): Promise<BatchUpdateResult> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<BatchUpdateResult>('bulk_delete_todos', { ids });
}

export async function bulkDeleteTasks(ids: string[]): Promise<BatchUpdateResult> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<BatchUpdateResult>('bulk_delete_tasks', { ids });
}

// ============================================================================
// Notifications
// ============================================================================

export interface NotificationSettings {
  id: string;
  entity_type: string;
  entity_id: string;
  reminder_minutes: number;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailySummarySettings {
  id: string;
  enabled: boolean;
  time: string;
  include_pending: boolean;
  include_overdue: boolean;
  include_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DueReminder {
  entity_type: string;
  entity_id: string;
  title: string;
  due_date: string;
  minutes_until_due: number;
}

export interface DailySummary {
  date: string;
  pending_count: number;
  overdue_count: number;
  completed_count: number;
  upcoming_count: number;
}

export async function getNotificationSettings(
  entityType: string,
  entityId: string
): Promise<NotificationSettings | null> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<NotificationSettings | null>('get_notification_settings', {
    entityType,
    entityId,
  });
}

export async function setNotificationSettings(
  entityType: string,
  entityId: string,
  reminderMinutes: number
): Promise<NotificationSettings> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<NotificationSettings>('set_notification_settings', {
    entityType,
    entityId,
    reminderMinutes,
  });
}

export async function deleteNotificationSettings(
  entityType: string,
  entityId: string
): Promise<boolean> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<boolean>('delete_notification_settings', {
    entityType,
    entityId,
  });
}

export async function getDailySummarySettings(): Promise<DailySummarySettings> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<DailySummarySettings>('get_daily_summary_settings');
}

export async function updateDailySummarySettings(
  enabled: boolean,
  time: string,
  includePending: boolean,
  includeOverdue: boolean,
  includeCompleted: boolean
): Promise<DailySummarySettings> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<DailySummarySettings>('update_daily_summary_settings', {
    enabled,
    time,
    includePending,
    includeOverdue,
    includeCompleted,
  });
}

export async function getDueReminders(): Promise<DueReminder[]> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<DueReminder[]>('get_due_reminders');
}

export async function markReminderSent(
  entityType: string,
  entityId: string
): Promise<boolean> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<boolean>('mark_reminder_sent', {
    entityType,
    entityId,
  });
}

export async function getDailySummary(): Promise<DailySummary> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<DailySummary>('get_daily_summary');
}

// ============================================================================
// Notification Plugins (External Channels)
// ============================================================================

export interface NotificationPlugin {
  id: string;
  name: string;
  plugin_type: string;
  enabled: boolean;
  config: string;
  created_at: string;
  updated_at: string;
}

export interface SendNotificationResult {
  success: boolean;
  message: string;
  external_id?: string;
}

export async function getNotificationPlugins(): Promise<NotificationPlugin[]> {
  if (!isTauri()) {
    console.warn('Running outside Tauri - data not available');
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<NotificationPlugin[]>('get_notification_plugins');
}

export async function createNotificationPlugin(
  name: string,
  pluginType: string,
  config: string
): Promise<NotificationPlugin> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<NotificationPlugin>('create_notification_plugin', {
    name,
    pluginType,
    config,
  });
}

export async function updateNotificationPlugin(
  id: string,
  name: string,
  enabled: boolean,
  config: string
): Promise<NotificationPlugin> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<NotificationPlugin>('update_notification_plugin', {
    id,
    name,
    enabled,
    config,
  });
}

export async function deleteNotificationPlugin(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<void>('delete_notification_plugin', { id });
}

export async function sendNotification(
  pluginId: string,
  title: string,
  content: string
): Promise<SendNotificationResult> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<SendNotificationResult>('send_notification', {
    pluginId,
    title,
    content,
  });
}

// ============================================================================
// Tags
// ============================================================================

export async function getTags(): Promise<Tag[]> {
  if (!isTauri()) {
    console.warn('Running outside Tauri - returning empty');
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Tag[]>('get_tags');
}

export async function createTag(
  name: string,
  color?: string,
  description?: string
): Promise<Tag> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Tag>('create_tag', { name, color: color || null, description: description || null });
}

export async function updateTag(
  id: string,
  data: { name?: string; color?: string; description?: string }
): Promise<Tag> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Tag>('update_tag', {
    id,
    name: data.name || null,
    color: data.color || null,
    description: data.description || null,
  });
}

export async function deleteTag(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<void>('delete_tag', { id });
}

export async function getEntityTags(
  entityType: EntityType,
  entityId: string
): Promise<Tag[]> {
  if (!isTauri()) {
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Tag[]>('get_entity_tags', { entityType, entityId });
}

export async function setEntityTags(
  entityType: EntityType,
  entityId: string,
  tagIds: string[]
): Promise<void> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<void>('set_entity_tags', { entityType, entityId, tagIds });
}

export async function getEntitiesByTag(
  entityType: EntityType,
  tagIds: string[]
): Promise<string[]> {
  if (!isTauri()) {
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<string[]>('get_entities_by_tag', { entityType, tagIds });
}

// ============================================================================
// Export/Import
// ============================================================================

export interface ExportData {
  version: string;
  exported_at: string;
  data: {
    todos: Todo[];
    tasks: Task[];
    plans: Plan[];
    targets: Target[];
    steps: Step[];
    milestones: Milestone[];
    tags: Tag[];
    entity_tags: Array<{ entity_type: string; entity_id: string; tag_id: string }>;
    settings: {
      daily_summary_settings: DailySummarySettings | null;
      notification_plugins: NotificationPlugin[];
    };
  };
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export type ImportMode = 'merge' | 'replace' | 'update';

export async function exportData(): Promise<ExportData> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to export data');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<ExportData>('export_data');
}

export async function importData(
  data: ExportData,
  mode: ImportMode
): Promise<ImportResult> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to import data');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<ImportResult>('import_data', { data, mode });
}

// ============================================================================
// API Functions - Circulation (打卡)
// ============================================================================

export async function getCirculation(id: string): Promise<Circulation> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to get circulation');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Circulation>('get_circulation', { id });
}

export async function getCirculations(): Promise<Circulation[]> {
  if (!isTauri()) {
    console.warn('Running outside Tauri - data not available');
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Circulation[]>('get_circulations');
}

export async function getCirculationsByType(
  circulationType: CirculationType,
  frequency?: PeriodicFrequency
): Promise<Circulation[]> {
  if (!isTauri()) {
    console.warn('Running outside Tauri - data not available');
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Circulation[]>('get_circulations_by_type', {
    circulationType,
    frequency: frequency || null,
  });
}

export async function createCirculation(
  data: CreateCirculationParams
): Promise<Circulation> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to create circulation');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Circulation>('create_circulation', {
    title: data.title,
    circulationType: data.circulation_type,
    frequency: data.frequency || null,
    frequencyConfig: data.frequency_config || null,
    targetCount: data.target_count || null,
  });
}

export async function updateCirculation(
  id: string,
  data: UpdateCirculationParams
): Promise<Circulation> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to update circulation');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Circulation>('update_circulation', {
    id,
    title: data.title || null,
    circulationType: data.circulation_type || null,
    frequency: data.frequency || null,
    frequencyConfig: data.frequency_config || null,
    targetCount: data.target_count || null,
    status: data.status || null,
  });
}

export async function deleteCirculation(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to delete circulation');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<void>('delete_circulation', { id });
}

export async function checkinCirculation(
  id: string,
  note?: string,
  count?: number
): Promise<Circulation> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to checkin');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Circulation>('checkin_circulation', {
    id,
    note: note || null,
    count: count || null,
  });
}

export async function undoCheckinCirculation(id: string): Promise<Circulation> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to undo checkin');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Circulation>('undo_checkin_circulation', { id });
}

export async function getCirculationLogs(
  circulationId: string,
  limit?: number
): Promise<CirculationLog[]> {
  if (!isTauri()) {
    console.warn('Running outside Tauri - data not available');
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<CirculationLog[]>('get_circulation_logs', {
    circulationId,
    limit: limit || 20,
  });
}
