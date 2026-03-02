/**
 * Circulation APIs
 *
 * API functions for Circulation (打卡) entity.
 */

import type {
  Circulation,
  CirculationLog,
  CreateCirculationParams,
  UpdateCirculationParams,
} from "@/lib/types";
import type { CirculationType, PeriodicFrequency } from "@/lib/types";
import { isTauri } from "./client";

export async function getCirculation(id: string): Promise<Circulation> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to get circulation");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Circulation>("get_circulation", { id });
}

export async function getCirculations(): Promise<Circulation[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - data not available");
    return [];
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Circulation[]>("get_circulations");
}

export async function getCirculationsByType(
  circulationType: CirculationType,
  frequency?: PeriodicFrequency,
): Promise<Circulation[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - data not available");
    return [];
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Circulation[]>("get_circulations_by_type", {
    circulationType,
    frequency: frequency || null,
  });
}

export async function createCirculation(
  data: CreateCirculationParams,
): Promise<Circulation> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to create circulation");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Circulation>("create_circulation", {
    title: data.title,
    circulationType: data.circulation_type,
    frequency: data.frequency || null,
    frequencyConfig: data.frequency_config || null,
    targetCount: data.target_count || null,
  });
}

export async function updateCirculation(
  id: string,
  data: UpdateCirculationParams,
): Promise<Circulation> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to update circulation");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Circulation>("update_circulation", {
    id,
    title: data.title || null,
    circulationType: data.circulation_type || null,
    frequency: data.frequency || null,
    frequencyConfig: data.frequency_config || null,
    targetCount: data.target_count || null,
    status: data.status || null,
  });
}

export async function deleteCirculation(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to delete circulation");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("delete_circulation", { id });
}

export async function checkinCirculation(
  id: string,
  note?: string,
  count?: number,
): Promise<Circulation> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to checkin");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Circulation>("checkin_circulation", {
    id,
    note: note || null,
    count: count || null,
  });
}

export async function undoCheckinCirculation(id: string): Promise<Circulation> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to undo checkin");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Circulation>("undo_checkin_circulation", { id });
}

export async function getCirculationLogs(
  circulationId: string,
  limit?: number,
): Promise<CirculationLog[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - data not available");
    return [];
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<CirculationLog[]>("get_circulation_logs", {
    circulationId,
    limit: limit || 20,
  });
}

export async function getCirculationLogsBatch(
  circulationIds: string[],
  limit?: number,
): Promise<Record<string, CirculationLog[]>> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - data not available");
    return {};
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Record<string, CirculationLog[]>>(
    "get_circulation_logs_batch",
    {
      circulationIds,
      limit: limit || 50,
    },
  );
}
