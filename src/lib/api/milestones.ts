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
import { withTauriError, withTauriFallback } from "./utils";

export async function getMilestone(id: string): Promise<Milestone> {
  return withTauriError("get milestones", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Milestone>("get_milestone", { id });
  });
}

export async function getMilestones(): Promise<Milestone[]> {
  return withTauriFallback(
    "milestones",
    async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<Milestone[]>("get_milestones");
    },
    [],
  );
}

export async function getMilestonesByTarget(
  targetId: string,
): Promise<Milestone[]> {
  return withTauriFallback(
    "milestones by target",
    async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<Milestone[]>("get_milestones_by_target", { targetId });
    },
    [],
  );
}

export async function createMilestone(
  data: CreateMilestoneParams,
): Promise<Milestone> {
  return withTauriError("create milestones", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Milestone>("create_milestone", {
      title: data.title,
      targetDate: data.target_date || null,
      bizType: data.biz_type || null,
      bizId: data.biz_id || null,
    });
  });
}

export async function updateMilestone(
  id: string,
  data: UpdateMilestoneParams,
): Promise<Milestone> {
  return withTauriError("update milestones", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Milestone>("update_milestone", {
      id,
      title: data.title,
      targetDate: data.target_date,
      status: data.status,
    });
  });
}

export async function deleteMilestone(id: string): Promise<void> {
  return withTauriError("delete milestones", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<void>("delete_milestone", { id });
  });
}
