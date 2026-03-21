// src/lib/api/bulk.ts
import { invoke } from "@tauri-apps/api/core";

export interface BulkTodoUpdates {
  status?: string;
  priority?: string;
  due_date?: string;
  archived?: boolean;
}

export interface BulkUpdateResult {
  updated: number;
  failed: Array<{ id: string; error: string }>;
}

export async function bulkUpdateTodos(
  ids: string[],
  updates: BulkTodoUpdates,
): Promise<BulkUpdateResult> {
  return await invoke<BulkUpdateResult>("bulk_update_todos", { ids, updates });
}

export async function bulkDeleteTodos(
  ids: string[],
): Promise<BulkUpdateResult> {
  return await invoke<BulkUpdateResult>("bulk_delete_todos", { ids });
}

export async function bulkArchiveTodos(
  ids: string[],
): Promise<BulkUpdateResult> {
  return await invoke<BulkUpdateResult>("bulk_archive_todos", { ids });
}

export async function bulkUpdatePlans(
  ids: string[],
  status?: string,
  archived?: boolean,
): Promise<BulkUpdateResult> {
  return await invoke<BulkUpdateResult>("bulk_update_plans", {
    ids,
    status,
    archived,
  });
}

export async function bulkDeletePlans(
  ids: string[],
): Promise<BulkUpdateResult> {
  return await invoke<BulkUpdateResult>("bulk_delete_plans", { ids });
}

export async function bulkUpdateTargets(
  ids: string[],
  status?: string,
  archived?: boolean,
): Promise<BulkUpdateResult> {
  return await invoke<BulkUpdateResult>("bulk_update_targets", {
    ids,
    status,
    archived,
  });
}

export async function bulkDeleteTargets(
  ids: string[],
): Promise<BulkUpdateResult> {
  return await invoke<BulkUpdateResult>("bulk_delete_targets", { ids });
}
