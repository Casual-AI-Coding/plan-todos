/**
 * Tag APIs
 *
 * API functions for Tag entity.
 */

import type { Tag, EntityType } from "@/lib/types";
import { withTauriError } from "./utils";

export async function getTag(id: string): Promise<Tag> {
  return withTauriError("get tag", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Tag>("get_tag", { id });
  });
}

export async function getTags(): Promise<Tag[]> {
  return withTauriError("get tags", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Tag[]>("get_tags");
  });
}

export async function createTag(
  name: string,
  color?: string,
  description?: string,
): Promise<Tag> {
  return withTauriError("create tag", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Tag>("create_tag", {
      name,
      color: color || null,
      description: description || null,
    });
  });
}

export async function updateTag(
  id: string,
  data: { name?: string; color?: string; description?: string },
): Promise<Tag> {
  return withTauriError("update tag", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Tag>("update_tag", {
      id,
      name: data.name || null,
      color: data.color || null,
      description: data.description || null,
    });
  });
}

export async function deleteTag(id: string): Promise<void> {
  return withTauriError("delete tag", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<void>("delete_tag", { id });
  });
}

export async function getEntityTags(
  entityType: EntityType,
  entityId: string,
): Promise<Tag[]> {
  return withTauriError("get entity tags", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Tag[]>("get_entity_tags", { entityType, entityId });
  });
}

export async function setEntityTags(
  entityType: EntityType,
  entityId: string,
  tagIds: string[],
): Promise<void> {
  return withTauriError("set entity tags", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<void>("set_entity_tags", { entityType, entityId, tagIds });
  });
}

export async function getEntitiesByTag(
  entityType: EntityType,
  tagIds: string[],
): Promise<string[]> {
  return withTauriError("get entities by tag", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<string[]>("get_entities_by_tag", { entityType, tagIds });
  });
}
