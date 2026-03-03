/**
 * Task APIs
 *
 * API functions for Task entity.
 */

import type { Task, CreateTaskParams, UpdateTaskParams } from "@/lib/types";
import { withTauriError, withTauriFallback } from "./utils";

export async function getTask(id: string): Promise<Task> {
  return withTauriError("get tasks", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Task>("get_task", { id });
  });
}

export async function getTasks(): Promise<Task[]> {
  return withTauriFallback(
    "tasks",
    async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<Task[]>("get_tasks");
    },
    [],
  );
}

export async function getTasksByPlan(planId: string): Promise<Task[]> {
  return withTauriFallback(
    "tasks by plan",
    async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<Task[]>("get_tasks_by_plan", { planId });
    },
    [],
  );
}

export async function createTask(data: CreateTaskParams): Promise<Task> {
  return withTauriError("create tasks", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Task>("create_task", {
      planId: data.plan_id,
      title: data.title,
      description: data.description || null,
      startDate: data.start_date || null,
      endDate: data.end_date || null,
      priority: data.priority || null,
    });
  });
}

export async function updateTask(
  id: string,
  data: UpdateTaskParams,
): Promise<Task> {
  return withTauriError("update tasks", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Task>("update_task", {
      id,
      title: data.title,
      description: data.description,
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status,
      priority: data.priority,
    });
  });
}

export async function deleteTask(id: string): Promise<void> {
  return withTauriError("delete tasks", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<void>("delete_task", { id });
  });
}
