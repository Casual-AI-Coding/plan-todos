/**
 * Bulk Operation APIs
 *
 * API functions for batch operations.
 */

import type { BatchUpdateResult } from "@/lib/types";
import { invoke, withTauriError } from "./utils";

// Status types for bulk operations
export type BulkTodoStatus = "pending" | "in-progress" | "done";
export type BulkTaskStatus = "pending" | "in-progress" | "done";
export type BulkStepStatus = "pending" | "completed";

export async function bulkUpdateTodoStatus(
  ids: string[],
  status: BulkTodoStatus,
): Promise<BatchUpdateResult> {
  return withTauriError("bulk update todo status", async () => {
    return invoke<BatchUpdateResult>("bulk_update_todo_status", {
      ids,
      status,
    });
  });
}

export async function bulkUpdateTaskStatus(
  ids: string[],
  status: BulkTaskStatus,
): Promise<BatchUpdateResult> {
  return withTauriError("bulk update task status", async () => {
    return invoke<BatchUpdateResult>("bulk_update_task_status", {
      ids,
      status,
    });
  });
}

export async function bulkUpdateStepStatus(
  ids: string[],
  status: BulkStepStatus,
): Promise<BatchUpdateResult> {
  return withTauriError("bulk update step status", async () => {
    return invoke<BatchUpdateResult>("bulk_update_step_status", {
      ids,
      status,
    });
  });
}

export async function bulkDeleteTodos(
  ids: string[],
): Promise<BatchUpdateResult> {
  return withTauriError("bulk delete todos", async () => {
    return invoke<BatchUpdateResult>("bulk_delete_todos", { ids });
  });
}

export async function bulkDeleteTasks(
  ids: string[],
): Promise<BatchUpdateResult> {
  return withTauriError("bulk delete tasks", async () => {
    return invoke<BatchUpdateResult>("bulk_delete_tasks", { ids });
  });
}

export async function bulkDeleteSteps(
  ids: string[],
): Promise<BatchUpdateResult> {
  return withTauriError("bulk delete steps", async () => {
    return invoke<BatchUpdateResult>("bulk_delete_steps", { ids });
  });
}

export async function bulkUpdateTodoPriority(
  ids: string[],
  priority: string,
): Promise<BatchUpdateResult> {
  return withTauriError("bulk update todo priority", async () => {
    return invoke<BatchUpdateResult>("bulk_update_todo_priority", {
      ids,
      priority,
    });
  });
}

export async function bulkUpdateTaskPriority(
  ids: string[],
  priority: string,
): Promise<BatchUpdateResult> {
  return withTauriError("bulk update task priority", async () => {
    return invoke<BatchUpdateResult>("bulk_update_task_priority", {
      ids,
      priority,
    });
  });
}
