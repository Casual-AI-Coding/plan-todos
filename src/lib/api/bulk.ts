/**
 * Bulk Operation APIs
 *
 * API functions for batch operations.
 */

import type { BatchUpdateResult } from "@/lib/types";
import { isTauri } from "./client";

export async function bulkUpdateTodoStatus(
  ids: string[],
  status: string,
): Promise<BatchUpdateResult> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<BatchUpdateResult>("bulk_update_todo_status", { ids, status });
}

export async function bulkUpdateTaskStatus(
  ids: string[],
  status: string,
): Promise<BatchUpdateResult> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<BatchUpdateResult>("bulk_update_task_status", { ids, status });
}

export async function bulkUpdateStepStatus(
  ids: string[],
  status: string,
): Promise<BatchUpdateResult> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<BatchUpdateResult>("bulk_update_step_status", { ids, status });
}

export async function bulkDeleteTodos(
  ids: string[],
): Promise<BatchUpdateResult> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<BatchUpdateResult>("bulk_delete_todos", { ids });
}

export async function bulkDeleteTasks(
  ids: string[],
): Promise<BatchUpdateResult> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<BatchUpdateResult>("bulk_delete_tasks", { ids });
}
