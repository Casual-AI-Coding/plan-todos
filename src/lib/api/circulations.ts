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
import { invoke, withTauriError } from "./utils";
export async function getCirculation(id: string): Promise<Circulation> {
  return withTauriError("获取 Circulation", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Circulation>("get_circulation", { id });
  });
}

export async function getCirculations(): Promise<Circulation[]> {
  return withTauriError("获取 Circulation 列表", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Circulation[]>("get_circulations");
  });
}

export async function getCirculationsByType(
  circulationType: CirculationType,
  frequency?: PeriodicFrequency,
): Promise<Circulation[]> {
  return withTauriError("获取指定类型的 Circulation 列表", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Circulation[]>("get_circulations_by_type", {
      circulationType,
      frequency: frequency || null,
    });
  });
}

export async function createCirculation(
  data: CreateCirculationParams,
): Promise<Circulation> {
  return withTauriError("创建 Circulation", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Circulation>("create_circulation", {
      title: data.title,
      circulationType: data.circulation_type,
      frequency: data.frequency || null,
      frequencyConfig: data.frequency_config || null,
      targetCount: data.target_count || null,
    });
  });
}

export async function updateCirculation(
  id: string,
  data: UpdateCirculationParams,
): Promise<Circulation> {
  return withTauriError("更新 Circulation", async () => {
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
  });
}

export async function deleteCirculation(id: string): Promise<void> {
  return withTauriError("删除 Circulation", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<void>("delete_circulation", { id });
  });
}

export async function checkinCirculation(
  id: string,
  note?: string,
  count?: number,
): Promise<Circulation> {
  return withTauriError("打卡 Circulation", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Circulation>("checkin_circulation", {
      id,
      note: note || null,
      count: count || null,
    });
  });
}

export async function undoCheckinCirculation(id: string): Promise<Circulation> {
  return withTauriError("撤销打卡", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Circulation>("undo_checkin_circulation", { id });
  });
}

export async function getCirculationLogs(
  circulationId: string,
  limit?: number,
): Promise<CirculationLog[]> {
  return withTauriError("获取打卡记录", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<CirculationLog[]>("get_circulation_logs", {
      circulationId,
      limit: limit || 20,
    });
  });
}

export async function getCirculationLogsBatch(
  circulationIds: string[],
  limit?: number,
): Promise<Record<string, CirculationLog[]>> {
  return withTauriError("批量获取打卡记录", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Record<string, CirculationLog[]>>(
      "get_circulation_logs_batch",
      {
        circulationIds,
        limit: limit || 50,
      },
    );
  });
}
