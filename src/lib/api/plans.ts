/**
 * Plan APIs
 *
 * API functions for Plan entity.
 */

import type { Plan, CreatePlanParams, UpdatePlanParams } from "@/lib/types";
import { isTauri } from "./client";

export async function getPlan(id: string): Promise<Plan> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to get plan");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Plan>("get_plan", { id });
}

export async function getPlans(): Promise<Plan[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - data not available");
    return [];
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Plan[]>("get_plans");
}

export async function createPlan(data: CreatePlanParams): Promise<Plan> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to create plans");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Plan>("create_plan", {
    title: data.title,
    description: data.description || null,
    startDate: data.start_date || null,
    endDate: data.end_date || null,
  });
}

export async function updatePlan(
  id: string,
  data: UpdatePlanParams,
): Promise<Plan> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to update plans");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Plan>("update_plan", {
    id,
    title: data.title,
    description: data.description,
    startDate: data.start_date,
    endDate: data.end_date,
    status: data.status,
  });
}

export async function deletePlan(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to delete plans");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("delete_plan", { id });
}
