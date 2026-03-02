/**
 * Milestone APIs
 *
 * API functions for Milestone entity.
 */

import type {
  Milestone,
  CreateMilestoneParams,
  UpdateMilestoneParams,
} from "@/lib/types";
import { isTauri } from "./client";

export async function getMilestone(id: string): Promise<Milestone> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to get milestone");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Milestone>("get_milestone", { id });
}

export async function getMilestones(): Promise<Milestone[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - data not available");
    return [];
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Milestone[]>("get_milestones");
}

export async function getMilestonesByTarget(
  targetId: string,
): Promise<Milestone[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - data not available");
    return [];
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Milestone[]>("get_milestones_by_target", { targetId });
}

export async function createMilestone(
  data: CreateMilestoneParams,
): Promise<Milestone> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to create milestones");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Milestone>("create_milestone", {
    title: data.title,
    targetDate: data.target_date || null,
    bizType: data.biz_type || null,
    bizId: data.biz_id || null,
  });
}

export async function updateMilestone(
  id: string,
  data: UpdateMilestoneParams,
): Promise<Milestone> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to update milestones");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Milestone>("update_milestone", {
    id,
    title: data.title,
    targetDate: data.target_date,
    status: data.status,
  });
}

export async function deleteMilestone(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to delete milestones");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("delete_milestone", { id });
}
