/**
 * Plan APIs
 *
 * API functions for Plan entity.
 */

import type { Plan, CreatePlanParams, UpdatePlanParams } from "@/lib/types";
import { invoke, withTauriError } from "./utils";
export async function getPlan(id: string): Promise<Plan> {
  return withTauriError("获取 Plan", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Plan>("get_plan", { id });
  });
}

export async function getPlans(): Promise<Plan[]> {
  return withTauriError("获取 Plan 列表", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Plan[]>("get_plans");
  });
}

export async function createPlan(data: CreatePlanParams): Promise<Plan> {
  return withTauriError("创建 Plan", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Plan>("create_plan", {
      title: data.title,
      description: data.description || null,
      startDate: data.start_date || null,
      endDate: data.end_date || null,
    });
  });
}

export async function updatePlan(
  id: string,
  data: UpdatePlanParams,
): Promise<Plan> {
  return withTauriError("更新 Plan", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Plan>("update_plan", {
      id,
      title: data.title,
      description: data.description,
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status,
    });
  });
}

export async function deletePlan(id: string): Promise<void> {
  return withTauriError("删除 Plan", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<void>("delete_plan", { id });
  });
}
