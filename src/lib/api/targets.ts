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
import { withTauriError, withTauriFallback } from "./utils";

export async function getTarget(id: string): Promise<Target> {
  return withTauriError("get targets", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Target>("get_target", { id });
  });
}

export async function getTargets(): Promise<Target[]> {
  return withTauriFallback(
    "targets",
    async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<Target[]>("get_targets");
    },
    [],
  );
}

export async function createTarget(data: CreateTargetParams): Promise<Target> {
  return withTauriError("create targets", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Target>("create_target", {
      title: data.title,
      description: data.description || null,
      dueDate: data.due_date || null,
    });
  });
}

export async function updateTarget(
  id: string,
  data: UpdateTargetParams,
): Promise<Target> {
  return withTauriError("update targets", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Target>("update_target", {
      id,
      title: data.title,
      description: data.description,
      dueDate: data.due_date,
      status: data.status,
    });
  });
}

export async function deleteTarget(id: string): Promise<void> {
  return withTauriError("delete targets", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<void>("delete_target", { id });
  });
}
