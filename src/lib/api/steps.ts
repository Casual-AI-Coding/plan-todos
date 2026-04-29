/**
 * Step APIs
 *
 * API functions for Step entity.
 */

import type { Step, CreateStepParams, UpdateStepParams } from "@/lib/types";
import { withTauriError } from "./utils";

export async function getSteps(targetId: string): Promise<Step[]> {
  return getStepsByTarget(targetId);
}

export async function getStepsByTarget(targetId: string): Promise<Step[]> {
  return withTauriError("get steps", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Step[]>("get_steps", { targetId });
  });
}

export async function createStep(data: CreateStepParams): Promise<Step> {
  return withTauriError("create steps", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Step>("create_step", {
      targetId: data.target_id,
      title: data.title,
      weight: data.weight,
      priority: data.priority || null,
    });
  });
}

export async function updateStep(
  id: string,
  data: UpdateStepParams,
): Promise<Step> {
  return withTauriError("update steps", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Step>("update_step", {
      id,
      title: data.title,
      weight: data.weight,
      status: data.status,
      priority: data.priority,
    });
  });
}

export async function deleteStep(id: string): Promise<void> {
  return withTauriError("delete steps", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<void>("delete_step", { id });
  });
}

export async function reorderSteps(
  targetId: string,
  stepIds: string[],
): Promise<void> {
  return withTauriError("reorder steps", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<void>("reorder_steps", { targetId, stepIds });
  });
}
