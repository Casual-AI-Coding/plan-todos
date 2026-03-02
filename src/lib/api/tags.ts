/**
 * Tag APIs
 *
 * API functions for Tag entity.
 */

import type { Tag, EntityType } from "@/lib/types";
import { isTauri } from "./client";

export async function getTag(id: string): Promise<Tag> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to get tag");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Tag>("get_tag", { id });
}

export async function getTags(): Promise<Tag[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - returning empty");
    return [];
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Tag[]>("get_tags");
}

export async function createTag(
  name: string,
  color?: string,
  description?: string,
): Promise<Tag> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Tag>("create_tag", {
    name,
    color: color || null,
    description: description || null,
  });
}

export async function updateTag(
  id: string,
  data: { name?: string; color?: string; description?: string },
): Promise<Tag> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Tag>("update_tag", {
    id,
    name: data.name || null,
    color: data.color || null,
    description: data.description || null,
  });
}

export async function deleteTag(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("delete_tag", { id });
}

export async function getEntityTags(
  entityType: EntityType,
  entityId: string,
): Promise<Tag[]> {
  if (!isTauri()) {
    return [];
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Tag[]>("get_entity_tags", { entityType, entityId });
}

export async function setEntityTags(
  entityType: EntityType,
  entityId: string,
  tagIds: string[],
): Promise<void> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("set_entity_tags", { entityType, entityId, tagIds });
}

export async function getEntitiesByTag(
  entityType: EntityType,
  tagIds: string[],
): Promise<string[]> {
  if (!isTauri()) {
    return [];
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<string[]>("get_entities_by_tag", { entityType, tagIds });
}
