// Types
export interface Todo {
  id: string;
  title: string;
  content: string | null;
  due_date: string | null;
  status: 'pending' | 'in-progress' | 'done';
  plan_ids: string[];
  milestone_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  plan_id: string;
  title: string;
  target_date: string | null;
  status: 'pending' | 'completed';
}

// Check if running in Tauri environment
// Exported for testing purposes
export function isTauri(): boolean {
  if (typeof window === 'undefined') return false;
  return '__TAURI__' in window;
}

// API Functions
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
  plan_ids: string[];
}): Promise<Todo> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to create todos');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Todo>('create_todo', {
    title: data.title,
    content: data.content || null,
    dueDate: data.due_date || null,
    planIds: data.plan_ids,
  });
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
  target_date?: string;
}): Promise<Plan> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to create plans');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Plan>('create_plan', {
    title: data.title,
    description: data.description || null,
    targetDate: data.target_date || null,
  });
}

export async function getMilestones(planId: string): Promise<Milestone[]> {
  if (!isTauri()) {
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Milestone[]>('get_milestones', { planId });
}

export async function updateTodo(id: string, data: {
  title?: string;
  content?: string;
  due_date?: string;
  status?: 'pending' | 'in-progress' | 'done';
  plan_ids?: string[];
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
    planIds: data.plan_ids,
  });
}

export async function deleteTodo(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error('This app must run in Tauri to delete todos');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<void>('delete_todo', { id });
}

export async function updatePlan(id: string, data: {
  title?: string;
  description?: string;
  target_date?: string;
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
    targetDate: data.target_date,
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
