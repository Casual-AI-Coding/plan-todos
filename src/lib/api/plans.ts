import type { Plan, CreatePlanParams, UpdatePlanParams } from "@/lib/types";
import { invoke, withTauriError } from "./utils";

export async function getPlan(id: string): Promise<Plan> {
  return withTauriError("获取 Plan", async () => {
    return invoke<Plan>("get_plan", { id });
  });
}

export async function getPlans(): Promise<Plan[]> {
  return withTauriError("获取 Plan 列表", async () => {
    return invoke<Plan[]>("get_plans");
  });
}

export async function createPlan(data: CreatePlanParams): Promise<Plan> {
  return withTauriError("创建 Plan", async () => {
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
    return invoke<void>("delete_plan", { id });
  });
}
