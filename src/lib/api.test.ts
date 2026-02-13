import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isTauri, getPlans, getTasks, getTasksByPlan, getTargets, getSteps, getTodos, getMilestones, createPlan, updatePlan, deletePlan, createTask, updateTask, deleteTask, createTarget, updateTarget, deleteTarget, createStep, updateStep, deleteStep, createTodo, updateTodo, deleteTodo, createMilestone, updateMilestone, deleteMilestone } from '@/lib/api';

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
