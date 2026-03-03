/**
 * Bulk Operation APIs
 *
 * API functions for batch operations.
 */

import type { BatchUpdateResult } from "@/lib/types";
import { withTauriError } from "./utils";

// Status types for bulk operations
export type BulkTodoStatus = "pending" | "in-progress" | "done";
export type BulkTaskStatus = "pending" | "in-progress" | "done";
export type BulkStepStatus = "pending" | "completed";

export async function bulkUpdateTodoStatus(
  ids: string[],
  status: BulkTodoStatus,
): Promise<BatchUpdateResult> {
  return withTauriError("bulk update todo status", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
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
    const { invoke } = await import("@tauri-apps/api/core");
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
    const { invoke } = await import("@tauri-apps/api/core");
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
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<BatchUpdateResult>("bulk_delete_todos", { ids });
  });
}

export async function bulkDeleteTasks(
  ids: string[],
): Promise<BatchUpdateResult> {
  return withTauriError("bulk delete tasks", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<BatchUpdateResult>("bulk_delete_tasks", { ids });
  });
}
