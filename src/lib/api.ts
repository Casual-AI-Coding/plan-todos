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
export interface Task {
  id: string;
  plan_id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'pending' | 'in-progress' | 'done';
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
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Milestone - 里程碑
// ============================================================================
export interface Milestone {
  id: string;
  title: string;
  target_date: string | null;
  // One of these will be set
  plan_id: string | null;
  task_id: string | null;
  target_id: string | null;
  status: 'pending' | 'completed';
  progress: number; // 0-100, calculated from linked entity
  created_at: string;
  updated_at: string;
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
  });
}

export async function updateTask(id: string, data: {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: 'pending' | 'in-progress' | 'done';
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
}): Promise<Step> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to create steps');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Step>('create_step', {
    targetId: data.target_id,
    title: data.title,
    weight: data.weight,
  });
}

export async function updateStep(id: string, data: {
  title?: string;
  weight?: number;
  status?: 'pending' | 'completed';
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
}): Promise<Todo> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to create todos');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Todo>('create_todo', {
    title: data.title,
    content: data.content || null,
    dueDate: data.due_date || null,
  });
}

export async function updateTodo(id: string, data: {
  title?: string;
  content?: string;
  due_date?: string;
  status?: 'pending' | 'in-progress' | 'done';
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
  plan_id?: string;
  task_id?: string;
  target_id?: string;
}): Promise<Milestone> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to create milestones');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Milestone>('create_milestone', {
    title: data.title,
    targetDate: data.target_date || null,
    planId: data.plan_id || null,
    taskId: data.task_id || null,
    targetId: data.target_id || null,
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
