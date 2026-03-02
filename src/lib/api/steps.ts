/**
 * Step APIs
 *
 * API functions for Step entity.
 */

import type { Step, CreateStepParams, UpdateStepParams } from "@/lib/types";
import { isTauri } from "./client";

export async function getSteps(targetId: string): Promise<Step[]> {
  return getStepsByTarget(targetId);
}

export async function getStepsByTarget(targetId: string): Promise<Step[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - data not available");
    return [];
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Step[]>("get_steps", { targetId });
}

export async function createStep(data: CreateStepParams): Promise<Step> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to create steps");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Step>("create_step", {
    targetId: data.target_id,
    title: data.title,
    weight: data.weight,
    priority: data.priority || null,
  });
}

export async function updateStep(
  id: string,
  data: UpdateStepParams,
): Promise<Step> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to update steps");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Step>("update_step", {
    id,
    title: data.title,
    weight: data.weight,
    status: data.status,
    priority: data.priority,
  });
}

export async function deleteStep(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to delete steps");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("delete_step", { id });
}

export async function reorderSteps(
  targetId: string,
  stepIds: string[],
): Promise<void> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to reorder steps");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("reorder_steps", { targetId, stepIds });
}
