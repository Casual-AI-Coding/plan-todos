/**
 * Target APIs
 *
 * API functions for Target entity.
 */

import type {
  Target,
  CreateTargetParams,
  UpdateTargetParams,
} from "@/lib/types";
import { isTauri } from "./client";

export async function getTarget(id: string): Promise<Target> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to get target");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Target>("get_target", { id });
}

export async function getTargets(): Promise<Target[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - data not available");
    return [];
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Target[]>("get_targets");
}

export async function createTarget(data: CreateTargetParams): Promise<Target> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to create targets");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Target>("create_target", {
    title: data.title,
    description: data.description || null,
    dueDate: data.due_date || null,
  });
}

export async function updateTarget(
  id: string,
  data: UpdateTargetParams,
): Promise<Target> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to update targets");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Target>("update_target", {
    id,
    title: data.title,
    description: data.description,
    dueDate: data.due_date,
    status: data.status,
  });
}

export async function deleteTarget(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to delete targets");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("delete_target", { id });
}
