import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isTauri, getPlans, getTasks, getTasksByPlan, getTargets, getSteps, getTodos, getMilestones, createPlan, updatePlan, deletePlan, createTask, updateTask, deleteTask, createTarget, updateTarget, deleteTarget, createStep, updateStep, deleteStep, createTodo, updateTodo, deleteTodo, createMilestone, updateMilestone, deleteMilestone, getDashboard, Priority, Tag, EntityType, getTags, createTag, updateTag, deleteTag, getEntityTags, setEntityTags, getEntitiesByTag } from '@/lib/api';

// ============================================================================
// isTauri Function Tests
// ============================================================================
describe('isTauri', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Reset window object before each test
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('returns false when window is undefined', () => {
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
    });
    expect(isTauri()).toBe(false);
  });

  it('returns false when window does not have __TAURI__', () => {
    expect(isTauri()).toBe(false);
  });

  it('returns true when window has __TAURI__', () => {
    (global.window as any).__TAURI__ = {};
    expect(isTauri()).toBe(true);
  });
});

// ============================================================================
// API Functions - Read operations (non-Tauri)
// ============================================================================
describe('API Functions - Read operations (non-Tauri)', () => {
  beforeEach(() => {
    // Ensure we're not in Tauri environment
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });
  });

  it('getPlans returns empty array when not in Tauri', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await getPlans();
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Running outside Tauri - data not available');
    consoleSpy.mockRestore();
  });

  it('getTasks returns empty array when not in Tauri', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await getTasks();
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Running outside Tauri - data not available');
    consoleSpy.mockRestore();
  });

  it('getTasksByPlan returns empty array when not in Tauri', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await getTasksByPlan('plan-1');
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Running outside Tauri - data not available');
    consoleSpy.mockRestore();
  });

  it('getTargets returns empty array when not in Tauri', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await getTargets();
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Running outside Tauri - data not available');
    consoleSpy.mockRestore();
  });

  it('getSteps returns empty array when not in Tauri', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await getSteps('target-1');
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Running outside Tauri - data not available');
    consoleSpy.mockRestore();
  });

  it('getTodos returns empty array when not in Tauri', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await getTodos();
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Running outside Tauri - data not available');
    consoleSpy.mockRestore();
  });

  it('getMilestones returns empty array when not in Tauri', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await getMilestones();
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Running outside Tauri - data not available');
    consoleSpy.mockRestore();
  });
});

// ============================================================================
// API Functions - Plan Write Operations (non-Tauri)
// ============================================================================
describe('API Functions - Plan Write Operations (non-Tauri)', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });
  });

  it('createPlan throws error when not in Tauri', async () => {
    await expect(createPlan({ title: 'Test' })).rejects.toThrow('This app must run in Tauri to create plans');
  });

  it('updatePlan throws error when not in Tauri', async () => {
    await expect(updatePlan('id', { title: 'Test' })).rejects.toThrow('This app must run in Tauri to update plans');
  });

  it('deletePlan throws error when not in Tauri', async () => {
    await expect(deletePlan('id')).rejects.toThrow('This app must run in Tauri to delete plans');
  });
});

// ============================================================================
// API Functions - Task Write Operations (non-Tauri)
// ============================================================================
describe('API Functions - Task Write Operations (non-Tauri)', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });
  });

  it('createTask throws error when not in Tauri', async () => {
    await expect(createTask({ plan_id: 'plan-1', title: 'Test' })).rejects.toThrow('This app must run in Tauri to create tasks');
  });

  it('updateTask throws error when not in Tauri', async () => {
    await expect(updateTask('id', { title: 'Test' })).rejects.toThrow('This app must run in Tauri to update tasks');
  });

  it('deleteTask throws error when not in Tauri', async () => {
    await expect(deleteTask('id')).rejects.toThrow('This app must run in Tauri to delete tasks');
  });
});

// ============================================================================
// API Functions - Target Write Operations (non-Tauri)
// ============================================================================
describe('API Functions - Target Write Operations (non-Tauri)', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });
  });

  it('createTarget throws error when not in Tauri', async () => {
    await expect(createTarget({ title: 'Test' })).rejects.toThrow('This app must run in Tauri to create targets');
  });

  it('updateTarget throws error when not in Tauri', async () => {
    await expect(updateTarget('id', { title: 'Test' })).rejects.toThrow('This app must run in Tauri to update targets');
  });

  it('deleteTarget throws error when not in Tauri', async () => {
    await expect(deleteTarget('id')).rejects.toThrow('This app must run in Tauri to delete targets');
  });
});

// ============================================================================
// API Functions - Step Write Operations (non-Tauri)
// ============================================================================
describe('API Functions - Step Write Operations (non-Tauri)', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });
  });

  it('createStep throws error when not in Tauri', async () => {
    await expect(createStep({ target_id: 'target-1', title: 'Test', weight: 50 })).rejects.toThrow('This app must run in Tauri to create steps');
  });

  it('updateStep throws error when not in Tauri', async () => {
    await expect(updateStep('id', { title: 'Test' })).rejects.toThrow('This app must run in Tauri to update steps');
  });

  it('deleteStep throws error when not in Tauri', async () => {
    await expect(deleteStep('id')).rejects.toThrow('This app must run in Tauri to delete steps');
  });
});

// ============================================================================
// API Functions - Todo Write Operations (non-Tauri)
// ============================================================================
describe('API Functions - Todo Write Operations (non-Tauri)', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });
  });

  it('createTodo throws error when not in Tauri', async () => {
    await expect(createTodo({ title: 'Test' })).rejects.toThrow('This app must run in Tauri to create todos');
  });

  it('updateTodo throws error when not in Tauri', async () => {
    await expect(updateTodo('id', { title: 'Test' })).rejects.toThrow('This app must run in Tauri to update todos');
  });

  it('deleteTodo throws error when not in Tauri', async () => {
    await expect(deleteTodo('id')).rejects.toThrow('This app must run in Tauri to delete todos');
  });
});

// ============================================================================
// API Functions - Milestone Write Operations (non-Tauri)
// ============================================================================
describe('API Functions - Milestone Write Operations (non-Tauri)', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });
  });

  it('createMilestone throws error when not in Tauri', async () => {
    await expect(createMilestone({ title: 'Test' })).rejects.toThrow('This app must run in Tauri to create milestones');
  });

  it('updateMilestone throws error when not in Tauri', async () => {
    await expect(updateMilestone('id', { title: 'Test' })).rejects.toThrow('This app must run in Tauri to update milestones');
  });

  it('deleteMilestone throws error when not in Tauri', async () => {
    await expect(deleteMilestone('id')).rejects.toThrow('This app must run in Tauri to delete milestones');
  });
});

// ============================================================================
// API Functions - Dashboard (non-Tauri)
// ============================================================================
// API Functions - Dashboard (non-Tauri)
// ============================================================================
describe('API Functions - Dashboard (non-Tauri)', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });
  });

  it('getDashboard returns mock data when not in Tauri', async () => {
    const dashboard = await getDashboard();
    expect(dashboard).toHaveProperty('today_todos');
    expect(dashboard).toHaveProperty('overdue_todos');
    expect(dashboard).toHaveProperty('completed_today');
    expect(dashboard).toHaveProperty('active_plans');
    expect(dashboard).toHaveProperty('active_targets');
    expect(dashboard).toHaveProperty('active_milestones');
    expect(dashboard).toHaveProperty('overview');
    expect(dashboard.overview).toHaveProperty('today_todos_count');
    expect(dashboard.overview).toHaveProperty('completed_today_count');
  });
});

// ============================================================================
// API Functions - Notifications (non-Tauri)
// ============================================================================
describe('API Functions - Notifications (non-Tauri)', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });
  });

  it('getNotificationSettings throws error when not in Tauri', async () => {
    const { getNotificationSettings } = await import('@/lib/api');
    await expect(getNotificationSettings('todo', 'test-1')).rejects.toThrow('This app must run in Tauri');
  });

  it('setNotificationSettings throws error when not in Tauri', async () => {
    const { setNotificationSettings } = await import('@/lib/api');
    await expect(setNotificationSettings('todo', 'test-1', 30)).rejects.toThrow('This app must run in Tauri');
  });

  it('deleteNotificationSettings throws error when not in Tauri', async () => {
    const { deleteNotificationSettings } = await import('@/lib/api');
    await expect(deleteNotificationSettings('todo', 'test-1')).rejects.toThrow('This app must run in Tauri');
  });

  it('getDailySummarySettings throws error when not in Tauri', async () => {
    const { getDailySummarySettings } = await import('@/lib/api');
    await expect(getDailySummarySettings()).rejects.toThrow('This app must run in Tauri');
  });

  it('updateDailySummarySettings throws error when not in Tauri', async () => {
    const { updateDailySummarySettings } = await import('@/lib/api');
    await expect(updateDailySummarySettings(true, '09:00', true, true, true)).rejects.toThrow('This app must run in Tauri');
  });

  it('getDueReminders throws error when not in Tauri', async () => {
    const { getDueReminders } = await import('@/lib/api');
    await expect(getDueReminders()).rejects.toThrow('This app must run in Tauri');
  });

  it('markReminderSent throws error when not in Tauri', async () => {
    const { markReminderSent } = await import('@/lib/api');
    await expect(markReminderSent('todo', 'test-1')).rejects.toThrow('This app must run in Tauri');
  });

  it('getDailySummary throws error when not in Tauri', async () => {
    const { getDailySummary } = await import('@/lib/api');
    await expect(getDailySummary()).rejects.toThrow('This app must run in Tauri');
  });
});

// ============================================================================
// Priority Type Tests
// ============================================================================
describe('Priority Type', () => {
  it('Priority type accepts P0', () => {
    const priority: Priority = 'P0';
    expect(priority).toBe('P0');
  });

  it('Priority type accepts P1', () => {
    const priority: Priority = 'P1';
    expect(priority).toBe('P1');
  });

  it('Priority type accepts P2', () => {
    const priority: Priority = 'P2';
    expect(priority).toBe('P2');
  });

  it('Priority type accepts P3', () => {
    const priority: Priority = 'P3';
    expect(priority).toBe('P3');
  });
});

// ============================================================================
// API Functions - Priority in Create/Update (non-Tauri)
// ============================================================================
describe('API Functions - Priority in Create/Update (non-Tauri)', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });
  });

  it('createTodo accepts priority parameter', async () => {
    // Should not throw - priority is optional
    await expect(createTodo({ title: 'Test', priority: 'P0' })).rejects.toThrow('This app must run in Tauri to create todos');
  });

  it('updateTodo accepts priority parameter', async () => {
    await expect(updateTodo('id', { priority: 'P1' })).rejects.toThrow('This app must run in Tauri to update todos');
  });

  it('createTask accepts priority parameter', async () => {
    await expect(createTask({ plan_id: 'plan-1', title: 'Test', priority: 'P0' })).rejects.toThrow('This app must run in Tauri to create tasks');
  });

  it('updateTask accepts priority parameter', async () => {
    await expect(updateTask('id', { priority: 'P1' })).rejects.toThrow('This app must run in Tauri to update tasks');
  });

  it('createStep accepts priority parameter', async () => {
    await expect(createStep({ target_id: 'target-1', title: 'Test', weight: 50, priority: 'P0' })).rejects.toThrow('This app must run in Tauri to create steps');
  });

  it('updateStep accepts priority parameter', async () => {
    await expect(updateStep('id', { priority: 'P1' })).rejects.toThrow('This app must run in Tauri to update steps');
  });
});

// ============================================================================
// Tag Type Tests
// ============================================================================
describe('Tag Type', () => {
  it('Tag interface has required fields', () => {
    const tag: Tag = {
      id: 'tag-1',
      name: 'Important',
      color: '#ff0000',
      created_at: '2026-01-01T00:00:00Z',
    };
    expect(tag.id).toBe('tag-1');
    expect(tag.name).toBe('Important');
    expect(tag.color).toBe('#ff0000');
  });

  it('Tag color accepts hex format', () => {
    const tag: Tag = {
      id: 'tag-2',
      name: 'Work',
      color: '#FF5733',
      created_at: '2026-01-01T00:00:00Z',
    };
    expect(tag.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

// ============================================================================
// EntityType Tests
// ============================================================================
describe('EntityType', () => {
  it('EntityType accepts todo', () => {
    const entityType: EntityType = 'todo';
    expect(entityType).toBe('todo');
  });

  it('EntityType accepts plan', () => {
    const entityType: EntityType = 'plan';
    expect(entityType).toBe('plan');
  });

  it('EntityType accepts target', () => {
    const entityType: EntityType = 'target';
    expect(entityType).toBe('target');
  });
});

// ============================================================================
// API Functions - Tags (non-Tauri)
// ============================================================================
describe('API Functions - Tags (non-Tauri)', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });
  });

  it('getTags returns empty array when not in Tauri', async () => {
    const tags = await getTags();
    expect(tags).toEqual([]);
  });

  it('createTag rejects when not in Tauri', async () => {
    await expect(createTag('Test', '#ff0000')).rejects.toThrow('This app must run in Tauri');
  });

  it('updateTag rejects when not in Tauri', async () => {
    await expect(updateTag('tag-1', { name: 'Updated' })).rejects.toThrow('This app must run in Tauri');
  });

  it('deleteTag rejects when not in Tauri', async () => {
    await expect(deleteTag('tag-1')).rejects.toThrow('This app must run in Tauri');
  });

  it('getEntityTags returns empty array when not in Tauri', async () => {
    const tags = await getEntityTags('todo', 'entity-1');
    expect(tags).toEqual([]);
  });

  it('setEntityTags rejects when not in Tauri', async () => {
    await expect(setEntityTags('todo', 'entity-1', ['tag-1'])).rejects.toThrow('This app must run in Tauri');
  });

  it('getEntitiesByTag returns empty array when not in Tauri', async () => {
    const entities = await getEntitiesByTag('todo', ['tag-1']);
    expect(entities).toEqual([]);
  });
});

// ============================================================================
// API Functions - Todo with Tags (non-Tauri)
// ============================================================================
describe('API Functions - Todo with Tags (non-Tauri)', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });
  });

  it('getTodos returns empty array when not in Tauri', async () => {
    const todos = await getTodos();
    expect(todos).toEqual([]);
  });

  it('createTodo does not accept tags parameter (handled separately)', async () => {
    // Tags are set via setEntityTags after creation
    await expect(createTodo({ title: 'Test' })).rejects.toThrow('This app must run in Tauri to create todos');
  });
});
