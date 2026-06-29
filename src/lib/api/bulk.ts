// src/lib/api/bulk.ts
import { invoke } from "@tauri-apps/api/core";

export interface BulkTodoUpdates {
  status?: string;
  priority?: string;
  due_date?: string;
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

// Bulk tag operations

export interface BulkTagResult {
  entity_type: string;
  tag_id: string;
  success_count: number;
  failed_ids: string[];
}

/**
 * Add a tag to multiple entities
 */
export async function bulkAddTags(
  entityType: "todo" | "plan" | "target",
  entityIds: string[],
  tagId: string,
): Promise<BulkTagResult> {
  return await invoke<BulkTagResult>("bulk_add_tags", {
    entity_type: entityType,
    entity_ids: entityIds,
    tag_id: tagId,
  });
}

/**
 * Remove a tag from multiple entities
 */
export async function bulkRemoveTags(
  entityType: "todo" | "plan" | "target",
  entityIds: string[],
  tagId: string,
): Promise<BulkTagResult> {
  return await invoke<BulkTagResult>("bulk_remove_tags", {
    entity_type: entityType,
    entity_ids: entityIds,
    tag_id: tagId,
  });
}
