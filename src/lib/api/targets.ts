import type {
  Target,
  CreateTargetParams,
  UpdateTargetParams,
} from "@/lib/types";
import { invoke, withTauriError } from "./utils";

export async function getTarget(id: string): Promise<Target> {
  return withTauriError("获取 Target", async () => {
    return invoke<Target>("get_target", { id });
  });
}

export async function getTargets(): Promise<Target[]> {
  return withTauriError("获取 Target 列表", async () => {
    return invoke<Target[]>("get_targets");
  });
}

export async function createTarget(data: CreateTargetParams): Promise<Target> {
  return withTauriError("创建 Target", async () => {
    return invoke<Target>("create_target", {
      title: data.title,
      description: data.description || null,
      due_date: data.due_date || null,
    });
  });
}

export async function updateTarget(
  id: string,
  data: UpdateTargetParams,
): Promise<Target> {
  return withTauriError("更新 Target", async () => {
    return invoke<Target>("update_target", {
      id,
      title: data.title,
      description: data.description,
      due_date: data.due_date,
      status: data.status,
    });
  });
}

export async function deleteTarget(id: string): Promise<void> {
  return withTauriError("删除 Target", async () => {
    return invoke<void>("delete_target", { id });
  });
}
